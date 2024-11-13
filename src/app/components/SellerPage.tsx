import { Account, Item } from '@/utils/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ItemDisplay from './ItemDisplay';

interface SellerPageProps {
    userData: Account
    logout: () => void;
    closeAccount: () => void;
}

export default function SellerPage(props: SellerPageProps) {

    /*get JSON of seller id from database*/
    const [selectedOption, setSelectedOption] = useState("All");
    const [filteredItemresult, setFilteredItemresult] = useState<Item[]>([]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    /**
     * This function is used to get the url and the button text for an item.
     * * An item that is Active, Inactive, Frozen, or Requested will have `text` = "Edit Item" and `url` = `/edit/:id`
     * * Any other item will have `text` = "View Item" and `url` = `/item/:id`
     * @param item The item to get the item action from.
     */
    const getItemAction = (item: Item): { text: string, url: string } => {
        return item.status === "Active" || item.status === "Inactive" || item.status === "Frozen" || item.status === "Requested" ?
            { text: "Edit Item", url: `/edit/${item.id}` } :
            { text: "View Item", url: `/item/${item.id}` }
    }

    // #region getSellerItems
    useEffect(() => {
        const fetchData = async () => {
            const payload = {
                username: props.userData.username,
                status: selectedOption,
            };
            try {
                const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getSellerItems',
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });

                const resultData = await response.json();
                if (resultData.statusCode == 200) {
                    setFilteredItemresult(resultData.items);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [props.userData.username, selectedOption]); // Changed to include props.userData.username because ESLint wasn't happy about it
    // #endregion

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
     * Used to call `props.closeAccount()`
     */
    const handleCloseAccount = () => {
        props.closeAccount();
    }

    return (
        <div className='content'>
            {/* need to handle account active/closed */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> {/* heading of seller */}
                <Image src="/accountSymbol.png" alt="Seller Account Symbol" width={100} height={100} style={{ objectFit: "contain", margin: "1rem" }} />
                <b>{props.userData!.username}</b>
            </div>
            <div className="sellerContent"> {/* item content */}
                <div className='sellerContentColumn' style={{ width: "25%", }}>
                    <p><b>Profit:</b></p>
                    ${props.userData!.balance}
                    <div className='buttons' style={{ marginTop: "auto" }}>
                        <button className='accountButton select-none' onClick={handleCloseAccount}>Close Account</button>
                        <button className='accountButton select-none' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
                <div className='sellerContentColumn' style={{ width: "60%", }}>
                    <div className='flex row' style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <p><b>Items:</b></p>
                        <select value={selectedOption} onChange={handleSelectChange}>
                            <option value={"All"}>All</option>
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
                        {/* Get items based on filter, not sold prob?? */}
                        <div className="container" onWheel={handleScroll}>
                            {filteredItemresult.length > 0 ? (
                                filteredItemresult.map((item, index) => (
                                    <ItemDisplay key={index} item={item}>
                                        <Link to={getItemAction(item).url}>
                                            <button className={`p-2 border border-black rounded-lg select-none`}>
                                                {getItemAction(item).text}
                                            </button>
                                        </Link>
                                    </ItemDisplay>
                                ))
                            ) : (
                                <p>No items found.</p>
                            )}
                        </div>
                    </div>
                    {/*
                    <div className="container" onWheel={handleScroll}>
                        {/* Get sold Items }
                            {Array.from({ length: 10 }, (_, index) => (
                            <div className="scrollItem" key={index}>
                            {index + 1}
                            </div>
                        ))}
                    </div>
                    */}
                </div>
                <div className='sellerContentColumn' style={{ width: "6%", justifyContent: "center", alignItems: "center" }}>
                    <Link to="/addItem"><button style={{ fontSize: "5vw", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <b>+</b>
                    </button></Link>
                </div>
            </div>
        </div>
    );
}