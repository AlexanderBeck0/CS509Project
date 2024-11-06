import React, { useState, useEffect } from 'react';
import SellerPage from './SellerPage';

interface AccountPageProps {
    userData: {accountType: string, username: string}; // can never be null
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {
    const [accountInfo, setAccountInfo] = useState<{accountType:string,isActive:number,balance:number,username:string}|null>(null);
        
    useEffect(() => {
        const fetchData = async () => {
        const payload = {
            username: props.userData.username,
        };
        try {
            const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAccountInfo',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const resultData = await response.json();
            console.log(resultData);
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

    console.log(accountInfo);
    if (props.userData.accountType === "Seller") {
        if(accountInfo==null) return null;
        return (
            <SellerPage userData={accountInfo} logout={props.logout} />
        );
    } else {
        return (
            <div>
                account page
            </div>
        );
    }
}