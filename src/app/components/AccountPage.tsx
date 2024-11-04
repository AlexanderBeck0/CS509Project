import React, { useState, useEffect } from 'react';
import SellerPage from './SellerPage';
import { AccountType } from '@/utils/types';

interface AccountPageProps {
    accountType: AccountType | null;
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