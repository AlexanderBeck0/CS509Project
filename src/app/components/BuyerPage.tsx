// import React, { useState, useEffect} from 'react';
import Image from 'next/image';

interface BuyerPageProps {
    logout: () => void;
    closeAccount: () => void;
}

export default function BuyerPage(props: BuyerPageProps) {

    /*get JSON of buyer id from database*/

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
            <div> {/* heading of buyer */}
                <Image src="/accountSymbol.png" alt="Buyer Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>Buyer:</b> {"BUYERNAME"}</p>
            </div>
            <div className="buyerContent"> {/* item content */}
                <div className='buyerContentColumn w-1/3'>
                    <p><b>Profit:</b></p>
                    {"PROFIT NUMBER"}
                    <div className='buttons'>
                        <button className='accountButton' onClick={handleCloseAccount}>Close Account</button>
                        <button className='accountButton' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
                <div className='buyerContentColumn w-2/3'>
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
                        <button className='text-6xl'><b>+</b></button>
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