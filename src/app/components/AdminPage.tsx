import Image from 'next/image';
import { ReactNode, useEffect, useRef, useState } from 'react';
import AdminSQL from './AdminSQL';
import { Item, ItemStatus } from '@/utils/types';
import ItemDisplay from './ItemDisplay';

interface AccountPageProps {
    logout: () => void;
}

export default function AdminPage(props: AccountPageProps) {
    const [sqlOpen,setSqlOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All');
    const [filteredItemresult, setFilteredItemresult] = useState<Item[]>([]);
    const [reload, setReload] = useState(0);

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
              if(resultData.statusCode === 200) {
                setFilteredItemresult(resultData.items);
              } else throw Error;
            } catch (error) {
                console.error('Error fetching data:', error);
            }   
        }
        fetchData();
    }, [selectedOption,reload]); 

    /**
     * Used to call `logout()`
     * @param event The event object.
     */
    const handleLogout = () => {
        props.logout();
    };

    const toggleSQL = () => {
        setSqlOpen(!sqlOpen);
        setReload(reload+1);
    }
    const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
        const container = event.target as HTMLDivElement;
        const scrollAmount = event.deltaY;
        container.scrollTo({
            top: 0,
            left: container.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });
    };

    const toggleFreeze = (id:number, status: ItemStatus) => {
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
                if(resultData.statusCode === 200) {
                    setReload(reload+1);
                } else throw Error;
              } catch (error) {
                  console.error('Error fetching data:', error);
              }   
        }
        fetchData();
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div> 
                <Image src="/accountSymbol.png" alt="Admin Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>ADMIN PAGE</b></p>
            </div>
            <button className='accountButton' onClick={toggleSQL}>{sqlOpen ? "Close SQL" : "Open SQL"}</button>
            {sqlOpen ? <AdminSQL/> :
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
                                        <button onClick={() => toggleFreeze(item.id, item.status)} className="accountButton" >
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
            <button className='accountButton' onClick={handleLogout}>Log out</button>
        </div>
    );
}