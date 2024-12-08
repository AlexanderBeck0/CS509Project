import type { Account, AccountType } from '@/utils/types';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminPage } from './AdminPages';
import BuyerPage from './BuyerPage';
import SellerPage from './SellerPage';

interface AccountPageProps {
    accountType: AccountType | null;
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {
    const [accountInfo, setAccountInfo] = useState<Account | null>(null);

    // #region getAccountInfo
    useEffect(() => {
        const fetchData = async () => {
            const payload = {
                token: localStorage.getItem('token'),
            };
            if (!payload.token) return;
            try {
                const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAccountInfo', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                const resultData: { statusCode: 200, account: Account } | { statusCode: 400, error: string } = await response.json();
                if (resultData.statusCode !== 200) {
                    console.log(resultData);
                    throw new Error(resultData.error);
                }
                if (resultData.statusCode == 200) {
                    setAccountInfo(resultData.account);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                props.logout();
            }
        }
        fetchData();
    }, [props]);

    // #endregion
    // #region closeAccount
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
                console.error(data.error);
                alert(`Error closing account: ${data.error}`);
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
    // #endregion

    if (props.accountType === "Seller") {

        return (
            (accountInfo && <SellerPage userData={accountInfo} logout={props.logout} closeAccount={closeAccount} />)
        );
    } else if (props.accountType === "Buyer") {
        return (
            (accountInfo && <BuyerPage userData={accountInfo} logout={props.logout} closeAccount={closeAccount} />)
        );
    } else if (props.accountType === "Admin") {
        return (
            (accountInfo && <AdminPage logout={props.logout} />)
        );
    } else {
        return (
            <Navigate to="/" />
        )
    }
}