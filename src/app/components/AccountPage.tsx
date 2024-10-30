import React, { useState, useEffect} from 'react';
import SellerPage from './SellerPage';

interface AccountPageProps {
    accountType: string;
}

export default function AccountPage( {accountType}:AccountPageProps) { 
    
    if(accountType === "seller") {
        return (
            <SellerPage/>
        );
    } else {
        return (
            <div>
                Account page
            </div>
        );
    }
}