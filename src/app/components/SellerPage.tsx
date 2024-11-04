// import React, { useState, useEffect} from 'react';
import Image from 'next/image';

interface SellerPageProps {
    logout: () => void;
    closeAccount: () => void;
}

export default function SellerPage(props: SellerPageProps) {

    /*get JSON of seller id from database*/

    const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
        const container = event.target as HTMLDivElement;
        const scrollAmount = event.deltaY;
        container.scrollTo({
            top: 0,
            left: container.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });
    };

    /**
     * Used to call `props.logout()`
     */
    const handleLogout = () => {
        props.logout();
    };

    /**
     * Used to call `props.clorseAccount()`
     */
    const handleCloseAccount = () => {
        props.closeAccount();
    }

    return (
        <div className='content'>
            <div> {/* heading of seller */}
                <Image src="/accountSymbol.png" alt="Seller Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>Seller:</b> {"SELLERNAME"}</p>
            </div>
            <div className="sellerContent"> {/* item content */}
                <div className='sellerContentColumn' style={{ width: "33.33%", }}>
                    <p><b>Profit:</b></p>
                    {"PROFIT NUMBER"}
                    <div className='buttons'>
                        <button className='accountButton' onClick={handleCloseAccount}>Close Account</button>
                        <button className='accountButton' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
                <div className='sellerContentColumn' style={{ width: "66.66%", }}>
                    <div className='flex row'>
                        <p><b>Items:</b></p>
                        <div>{"DROPDOWN"}</div>
                    </div>
                    <div className='flex row'>
                        <div className="container" onWheel={handleScroll}>
                            <div className="scrollItem">
                                1
                            </div>
                            <div className="scrollItem">
                                2
                            </div>
                            <div className="scrollItem">
                                3
                            </div>
                        </div>
                        <button className='' style={{ fontSize: "50px" }}><b>+</b></button>
                    </div>
                    <div className="container" onWheel={handleScroll}>
                        <div className="scrollItem">
                            1
                        </div>
                        <div className="scrollItem">
                            2
                        </div>
                        <div className="scrollItem">
                            3
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}