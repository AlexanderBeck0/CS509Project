import { Buyer } from '@/utils/types';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface BuyerPageProps {
    logout: () => void;
    closeAccount: () => void;
}

export default function BuyerPage(props: BuyerPageProps) {
    const fundsRef = useRef<HTMLInputElement | null>(null);
    const [account, setAccount] = useState<Buyer | null>(null);
    const [funds, setFunds] = useState<number>(0);

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAccountInfo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: localStorage.getItem('token')
                    })
                });

                const data: { statusCode: 400 | 500, error: string } | { statusCode: 200, account: Buyer } = await response.json();

                if (data.statusCode !== 200) throw new Error(data.error);
                return data.account;
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                throw error
            }
        };
        fetchAccountData().then((accountInfo) => setAccount(accountInfo)).catch((error) => console.error(error.message));
    }, []);

    useEffect(() => {
        if (account === null || account === undefined) return;
        setFunds(account.balance);
    }, [account]);

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

    /**
     * Adds funds to the buyer.
     */
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

            account!.balance = data.newBalance;
            setFunds(data.newBalance);
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            throw error
        }
    }

    return (
        <div className='content'>
            <div> {/* heading of buyer */}
                <Image src="/accountSymbol.png" alt="Buyer Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>Buyer:</b> {account?.username || "Unknown"}</p>
            </div>
            <div className="flex flex-row gap-4 p-4 justify-center w-full max-w-6xl m-0 justify-items-center"> {/* item content */}
                <div className='flex flex-col m-12 w-1/3'>
                    <p><b>Funds:</b> ${funds}</p>
                    <div className='buttons'>
                        <button className='accountButton' onClick={handleCloseAccount}>Close Account</button>
                        <button className='accountButton' onClick={handleLogout}>Log out</button>
                        <div className="max-w-full mt-2 flex flex-row flex-nowrap basis-full items-center">
                            <input type="number" min={1} step={1} maxLength={10} ref={fundsRef} placeholder="Funds #"
                                className="flex basis-2/3 flex-grow-0 border rounded-lg border-solid border-black"
                            // The below line would make it not allow decimals, but it causes the cursor to move to the start
                            // onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "")}
                            ></input>
                            <button className="flex basis-1/2 text-nowrap mt-0 border rounded-lg border-solid border-black"
                                type="button" onClick={addFunds}>Add Funds</button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col m-12 w-2/3'>
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