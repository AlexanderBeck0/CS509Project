import SellerPage from './SellerPage';
import AdminPage from './AdminPage';
import { AccountType } from '@/utils/types';
import BuyerPage from './BuyerPage';
import { useEffect, useState } from 'react';

interface AccountPageProps {
    userData: {accountType: string, username: string}; 
    accountType: AccountType | null;
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {
    const [accountInfo, setAccountInfo] = useState<{accountType:string,isActive:number,balance:number,username:string}|null>(null);
        
    useEffect(() => {
        const fetchData = async () => {
        const payload = {
            token: localStorage.getItem('token'),
        };
        try {
            const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAccountInfo',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const resultData = await response.json();
            if (resultData.statusCode == 200) {
                setAccountInfo(resultData.account);
            }
            if(resultData.statusCode == 400)
                props.logout();
        } catch (error) {
            console.error('Error fetching data:', error);
            props.logout();
        }
        }
        fetchData();
    }, []);

    /**
     * Closes the user's account and logs them out.
     */
    async function closeAccount() {
        try {
            const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/closeAccount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            });

            const data = await response.json();
            if (data.error) {
                // TODO: Show the user this error with a message somehow
                console.error(data.error);
                return;
            }

            if (data.valid) {
                // Log the user out if closing the account was successful
                // TODO: Add a message to logout to show to the user?
                props.logout();
            }
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
        }
    }

    if (props.accountType === "Seller") {
        
        return (
            (accountInfo !== null && <SellerPage userData={accountInfo} logout={props.logout} closeAccount={closeAccount} />)
        );
    } else if (props.accountType === "Buyer") {
        return (
            <BuyerPage logout={props.logout} closeAccount={closeAccount} />
        );
    } else if (props.accountType === "Admin") {
        return (
            <AdminPage logout={props.logout} />
        );
    } else {
        return (
            <div>
                account page
            </div>
        );
    }
}