import { Item, Bid, AccountType } from '@/utils/types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface ItemPageProps {
    accountType: AccountType | null;
    token: string | null;
}

export default function ItemPage(props: ItemPageProps) {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [newBid, setNewBid] = useState<number>(0);
    //const [availableFunds, setAvailableFunds] = useState<number>(1000); // Example amount; fetch real funds as needed

    useEffect(() => {
        const fetchItem = async () => {
            const payload = { id: id, token: props.token };
            try {
                const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/getItemFromID", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                if (data.statusCode === 200) {
                    setItem(data.items[0]);
                    setBids(data.items.bids || []);
                }
                if (data.statusCode !== 200) {
                    alert(data.error)
                }
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        fetchItem();
    }, [id, props]);

    const handlePlaceBid = () => {
        // if (newBid > availableFunds) {
        //     alert("You do not have enough funds to place this bid.");
        //     return;
        // }
        // Further implementation for bid submission to backend can be added here
        alert(`Placed bid of $${newBid}`);
    };

    return (
        <div style={{ display: 'flex', padding: '2rem', gap: '2rem' }}>
            {item ? (
                <>
                    {/* Left Container */}
                    <div style={{ width: '33%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2>{item.name}</h2>
                        <picture>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: 'auto' }} />
                        </picture>
                        <p><strong> Description: </strong> {item.description}</p>
                        <p><strong> Start Date: </strong> {new Date(item.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {item?.endDate ? new Date(item.endDate).toLocaleDateString() : 'No end date available'}</p>
                    </div>

                    {/* Middle Container */}
                    <div style={{ width: '33%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p><strong>Current Price:</strong> ${item.price}</p>

                        <h3>Bids:</h3>
                        {bids.length > 0 ? (
                            <ul>
                                {bids.map((bid, index) => (
                                    <li key={index}>${bid.bid} by {bid.buyerUsername}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No bids placed yet.</p>
                        )}

                        <div>
                            <label>
                                Place bid of: $
                                <input
                                    type="number"
                                    value={newBid}
                                    onChange={(e) => setNewBid(Number(e.target.value))}
                                    style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                                />
                            </label>
                            <button onClick={handlePlaceBid} style={{ marginLeft: '0.5rem' }}>
                                Place Bid
                            </button>
                        </div>

                        {/* <p><strong>Available Funds:</strong> ${availableFunds}</p> */}
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
