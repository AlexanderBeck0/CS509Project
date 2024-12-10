import { Item, ItemStatus } from '@/utils/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AdminSQL from './AdminSQL';
import ItemDisplay from '../ItemDisplay';
import { Link } from 'react-router-dom';

interface AccountPageProps {
    logout: () => void;
}

export default function AdminPage(props: AccountPageProps) {
    const [sqlOpen, setSqlOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All');
    const [filteredItemresult, setFilteredItemresult] = useState<Item[]>([]);
    const [reload, setReload] = useState(0);
    const [adminBalance, setAdminBalance] = useState<number | null>(null);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            const payload = {
                token: localStorage.getItem('token'),
                filter: selectedOption
            };
            try {
                const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAdminItems',
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });

                const resultData = await response.json();
                if (resultData.statusCode === 200) {
                    setFilteredItemresult(resultData.items);
                } else throw Error;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [selectedOption, reload]);

    const handleLogout = () => {
        props.logout();
    };

    const toggleSQL = () => {
        setSqlOpen(!sqlOpen);
        setReload(reload + 1);
    };

    const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
        const container = event.target as HTMLDivElement;
        const scrollAmount = event.deltaY;
        container.scrollTo({
            top: 0,
            left: container.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });
    };

    const toggleFreeze = (id: number, status: ItemStatus) => {
        const fetchData = async () => {
            const payload = {
                token: localStorage.getItem('token'),
                id: id,
                status: status
            };
            try {
                const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/toggleFreeze',
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });

                const resultData = await response.json();
                if (resultData.statusCode === 200) {
                    setReload(reload + 1);
                } else throw Error;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };

    const fetchAdminBalance = async () => {
        const payload = {
            token: localStorage.getItem('token'),
        };
        try {
            const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getAccountInfo', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const resultData = await response.json();
            if (resultData.statusCode === 200) {
                setAdminBalance(resultData.account.balance || 0);
            } else {
                console.error("Failed to fetch admin balance:", resultData.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching admin balance:", error);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div>
                <Image src="/accountSymbol.png" alt="Admin Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>ADMIN PAGE</b></p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className='flex row' style={{ gap: "10px" }}>
                    <button className='accountButton' onClick={fetchAdminBalance}>Auction Report</button>
                    <Link to="/forensicsReport"><button className='accountButton'>Forensics Report</button></Link>
                    <button className='accountButton' onClick={handleLogout}>Log out</button>
                </div>
                {adminBalance !== null && (<p>Admin Balance: ${adminBalance}</p>)}
                <button className='accountButton' onClick={toggleSQL}>{sqlOpen ? "Close SQL" : "Open SQL"}</button>
            </div>
            {sqlOpen ? <AdminSQL /> :
                <div className='pageContentColumn' style={{ width: "100%", }}>
                    <div className='flex row' style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <p><b>Items:</b></p>
                        <select value={selectedOption} onChange={handleSelectChange}>
                            <option value={"All"}>All</option>
                            <option value={"Active"}>Active</option>
                            <option value={"Frozen"}>Frozen</option>
                            <option value={"Requested"}>Requested</option>
                            <option value={"Failed"}>Failed</option>
                            <option value={"Completed"}>Completed</option>
                            <option value={"Fulfilled"}>Fulfilled</option>
                        </select>
                    </div>
                    <div className='flex row'>
                        <div className="container" onWheel={handleScroll}>
                            {filteredItemresult.length > 0 ? (
                                filteredItemresult.map((item, index) => (
                                    <ItemDisplay key={index} item={item}>
                                        {(item.status === "Active" || item.status === "Frozen" || item.status === "Requested") && (
                                            <button onClick={() => toggleFreeze(item.id, item.status)} className="accountButton">
                                                {item.status === "Active" ? "Freeze" : "Unfreeze"}
                                            </button>
                                        )}
                                    </ItemDisplay>
                                ))
                            ) : (
                                <p>No items found.</p>
                            )}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
