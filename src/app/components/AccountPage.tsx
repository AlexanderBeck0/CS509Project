import React, { useState, useEffect } from 'react';
import SellerPage from './SellerPage';

interface AccountPageProps {
    userData: {accountType: string, username: string}; // can never be null
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {
    console.log(props.userData);
    if (props.userData.accountType === "Seller") {
        return (
            <SellerPage userData={props.userData} logout={props.logout} />
        );
    } else {
        return (
            <div>
                account page
            </div>
        );
    }
}