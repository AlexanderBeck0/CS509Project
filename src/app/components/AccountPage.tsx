import React, { useState, useEffect } from 'react';
import SellerPage from './SellerPage';

interface AccountPageProps {
    accountType: "Seller" | "Buyer" | "Admin";
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {

    if (props.accountType === "Seller") {
        return (
            <SellerPage logout={props.logout} />
        );
    } else {
        return (
            <div>
                Account page
            </div>
        );
    }
}