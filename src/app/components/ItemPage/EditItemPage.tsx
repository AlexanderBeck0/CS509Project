import { Item, Bid, AccountType } from '@/utils/types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

async function unpublish(id: number) {
    try {
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/unpublishItem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                item_id: id
            })
        });

        const data = await response.json();
        // console.log(data)
        if (data.error) {
            console.error(data.error);
            alert(`Error unpublishing item: ${data.error}`);
            return;
        }

        return data;

    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
    }
}

async function publish(id: number, forSale: boolean) {
    try {
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/publishItem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                item_id: id,
                forSale: forSale
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error(data.error);
            alert(`Error publishing item: ${data.error}`);
            return;
        }
        return data;

    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
    }
}

interface ItemPageProps {
    accountType: AccountType | null;
    token: string | null;
}

export default function ItemPage(props: ItemPageProps) {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [forSale, setForSale] = useState(false);
    const [published, setPublish] = useState<boolean | null>(null)


    async function handlePublishClick() {
        if (item?.status === 'Active') {
            const unpublishResults = await unpublish(item.id)
            if (unpublishResults['statusCode'] === 200) {
                setPublish(false)
            }
        } else if (item?.status === 'Inactive') {
            const publishResults = await publish(item.id, forSale)
            if (publishResults['statusCode'] === 200) {
                setPublish(true)
            }
        }

    }

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
                    setItem(data.item);
                    setBids(data.item?.bids ? JSON.parse(data.item.bids) : []);
                    setPublish(data.item.status === 'Active');
                    setForSale(data.item.forSale === 1);
                }
                if (data.statusCode !== 200) {
                    console.log(data);
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        fetchItem();
    }, [id, props, published]);

    useEffect(() => {
        setPublish(item?.status === 'Active')
    }, [item])


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
                        <p><strong>Status:</strong> {item.status}</p>
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
                        {published ? (
                            <p>{forSale === true ? "This item is able to be bought NOW!" : "This item is up for normal auction"}</p>
                        ) : (
                            <></>
                        )}
                    </div>
                    {/* Controls */}
                    <div style={{ width: '33%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* for sale button: */}
                        {!published &&
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', }}>
                                <input
                                    type="checkbox"
                                    checked={forSale}
                                    onChange={(e) => setForSale(e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label><strong>For Sale</strong></label>
                            </div>
                        }
                        {/* Publish or unpublish button: */}
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handlePublishClick}
                        >
                            {published ? "Unpublish" : "Publish"}
                        </button>
                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}