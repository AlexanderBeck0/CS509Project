import React, { useState, useEffect} from 'react';
import Image from 'next/image';
import { Link } from 'react-router-dom';
    
interface SellerPageProps {
    userData: {accountType: string, username: string} 
    logout: () => void;
}

export default function SellerPage(props: SellerPageProps) {

    /*get JSON of seller id from database*/
    const [selectedOption, setSelectedOption] = useState("All");
    const [filterItemsBy, setFilter] = useState("");
    const [filteredItemresult, setFilteredItemresult] = useState<any[]>([]);
    const [sellerResult, setSellerResult] = useState<any[]>([]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {    
        const sortKey = selectedOption === "All" ? "" : selectedOption.toLowerCase();
        setFilter(`${sortKey}`);
    }, [selectedOption, setFilter]);

    useEffect(() => {
        console.log("Filter: " + filterItemsBy);
        const fetchData = async () => {
          const payload = {
            username: "", // get seller username from token
            filter: filterItemsBy,
          };
          try {
            const response = await fetch('',
              {
                method: 'POST',
                body: JSON.stringify(payload),
              });
    
            const resultData = await response.json();
            console.log(resultData);
            if (resultData.statusCode == 200) {
                setFilteredItemresult(resultData.items);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
        fetchData();
      }, [filterItemsBy]);

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
     * Used to call `logout()`
     * @param event The event object.
     */
    const handleLogout = () => {
        props.logout();
    };

    return (
        <div className='content'>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}> {/* heading of seller */}
                <Image src="/accountSymbol.png" alt="Seller Account Symbol" width={100} height={100} style={{ objectFit: "contain", margin: "1rem"}} />
                <b>{"SELLERNAME"}</b>
            </div>
            <div className="sellerContent"> {/* item content */}
                <div className='sellerContentColumn' style={{ width: "25%", }}>
                    <p><b>Profit:</b></p>
                    ${"PROFIT NUMBER"}
                    <div className='buttons'>
                        {/* on clicks */}
                        <button className='accountButton'>Close Account</button>
                        <button className='accountButton' onClick={handleLogout}>Log out</button>
                    </div>
                </div>
                <div className='sellerContentColumn' style={{ width: "60%", }}>
                    <div className='flex row' style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <p><b>Items:</b></p>
                        <select value={selectedOption} onChange={handleSelectChange}>
                            <option value={"All"}>All</option>
                            <option value={"Inactive"}>Inactive</option>
                            <option value={"Active"}>Active</option>
                            <option value={"Failed"}>Failed</option>
                            <option value={"Archived"}>Archived</option>
                            <option value={"Completed"}>Completed</option>
                        </select>
                    </div>
                    <div className='flex row'>
                        {/* Get items based on filter, not sold prob?? */}
                        <div className="container" onWheel={handleScroll}>
                        {Array.from({ length: 50 }, (_, index) => (
                            <div className="scrollItem" key={index}>
                                {index + 1}
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="container" onWheel={handleScroll}>
                        {/* Get sold Items */}
                            {Array.from({ length: 10 }, (_, index) => (
                            <div className="scrollItem" key={index}>
                            {index + 1}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='sellerContentColumn' style={{ width: "6%", justifyContent: "center", alignItems: "center"}}>
                    <Link to="/addItem"><button style={{ fontSize: "5vw", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <b>+</b>
                    </button></Link>
                </div>
            </div>
        </div>
    );
}