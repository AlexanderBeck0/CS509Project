import { Account, Buyer } from '@/utils/types';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface BuyerPageProps {
    userData: Account
    logout: () => void;
    closeAccount: () => void;
}

export default function BuyerPage(props: BuyerPageProps) {
    const fundsRef = useRef<HTMLInputElement | null>(null);
    
    const [selectedOption, setSelectedOption] = useState("All");

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };
    // useEffect(() => {
    //     setAccount(props.userData);
    // }, [props]);

    // useEffect(() => {
    //     if (account === null || account === undefined) return;
    //     setFunds(account.balance);
    // }, [account]);

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

    const handleLogout = () => {
        props.logout();
    };

    const handleCloseAccount = () => {
        props.closeAccount();
    }

    async function addFunds(): Promise<void> {
        const fundsInput = fundsRef.current?.valueAsNumber;

        if (fundsInput === undefined) {
            // TODO: Handle error here
        }

        // Validate input before sending
        // Funds is not a whole number
        if (Math.floor(fundsInput!) !== fundsInput) {
            // TODO: Handle not whole number here
        }

        // Negative number
        if (fundsInput! < 1) {
            // TODO: Handle negative number here
        }

        try {
            const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/edit-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    deltaBalance: fundsInput
                })
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                console.log(errorMessage)
                throw new Error(errorMessage);
            }

            const data: { statusCode: 200, newBalance: number } | { statusCode: 400 | 500, error: string } = await response.json();
            if (data['statusCode'] !== 200) {
                throw new Error(data['error']);
            }

            props.userData.balance = data.newBalance;
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            throw error
        }
    }

    return (
        <div className='content'>
            <div> {/* heading of buyer */}
                <Image src="/accountSymbol.png" alt="Buyer Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>Buyer:</b> {props.userData.username}</p>
            </div>
            <div className="pageContent"> {/* item content */}
                <div className='pageContentColumn' style={{ width: "25%", }}>
                    <p><b>Funds:</b> ${props.userData.balance}</p>
                    <div className='buttons'>
                        <input type="number" min={1} step={1} ref={fundsRef} placeholder="Funds #"
                            className="input"
                        // The below line would make it not allow decimals, but it causes the cursor to move to the start
                        onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "")}
                        ></input>
                        <button className="accountButton"
                            type="button" onClick={addFunds}>Add Funds</button>
                        <button className='accountButton' onClick={handleCloseAccount}>Close Account</button>
                        <button className='accountButton' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
                <div className='pageContentColumn' style={{ width: "60%", }}>
                    <div className='flex row'>
                        <p><b>Items:</b></p>
                        <select value={selectedOption} onChange={handleSelectChange}>
                            <option value={"All"}>All</option> {/* what are the status options for buyer? */}
                            <option value={"Active"}>Active</option>
                            <option value={"Inactive"}>Inactive</option>
                            <option value={"Frozen"}>Frozen</option>
                            <option value={"Requested"}>Requested</option>
                            <option value={"Failed"}>Failed</option>
                            <option value={"Archived"}>Archived</option>
                            <option value={"Completed"}>Completed</option>
                            <option value={"Fulfilled"}>Fulfilled</option>
                        </select>
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
                    </div>
                </div>
            </div>
        </div>
    );
}