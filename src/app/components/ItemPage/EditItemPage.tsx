import type { AccountType, Bid, Item } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditItemForm from './EditItemForm';

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

async function archive(id: number) {
    try {
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/archive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                item_id: id
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error(data.error);
            alert(`Error archiving item: ${data.error}`);
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

async function remove(id: number) {
    try {
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/remove-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                item_id: id
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error(data.error);
            alert(`Error removing item: ${data.error}`);
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
    const [published, setPublished] = useState<boolean | null>(null)
    const [archived, setArchived] = useState<boolean | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (archived) {
            navigate(`/item/${id}`)
        }
    }, [archived, id, navigate]);


    async function handlePublishClick() {
        if (item?.status === "Frozen") alert("NOT YET IMPLEMENTED; FROZEN ITEMS CANNOT BE UNPUBLISHED");
        if (item?.status === 'Active') {
            const unpublishResults = await unpublish(item.id)
            if (unpublishResults['statusCode'] === 200) {
                setPublished(false)
            }
        } else if (item?.status === 'Inactive') {
            const publishResults = await publish(item.id, forSale)
            if (publishResults['statusCode'] === 200) {
                setPublished(true)
            }
        }

    }

    async function handleArchiveClick() {
        if (item?.status === 'Inactive') {
            const archiveResults = await archive(item.id)
            if (archiveResults['statusCode'] === 200) {
                setArchived(true)
            }
        }
    }

    async function handleRemoveClick() {
        if (item?.status === 'Inactive') {
            const removeResults = await remove(item.id)
            if (removeResults['statusCode'] === 200) {
                navigate("/account")
            }
        }
    }

    /**
     * Function to call when fetching an item.
     */
    const fetchItem = useCallback(async (): Promise<void> => {
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
                setPublished(data.item.status === 'Active');
                setForSale(data.item.forSale === 1);
                setArchived(data.item.archived === 1);
                return;
            }
            console.log(data);
            if (data?.error !== undefined) alert(data.error);

        } catch (error) {
            console.error('Error fetching item:', error);
        }
    }, [id, props.token]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem, id, props, published]);

    useEffect(() => {
        setPublished(item?.status === 'Active')
        setArchived(item?.archived === true)
    }, [item]);

    /**
     * @param changes The changes to be made.
     * @returns A string promise of the resulting message. Could be a success message, or an error message.
     */
    async function handleEdit(changes: object): Promise<string> {

        /**
         * @param str The date string to check.
         * @returns A boolean representing if str is a date string.
         */
        const isDate = (str: string): boolean => {
            return !isNaN(new Date(str).getTime());
        }

        // Create a new item that contains all the new changes
        const newItem: Partial<Item> = { ...item }!;
        Object.entries(changes).forEach(([key, value]) => {
            // console.log(new Date(value))
            if (key in newItem) {
                // Convert date to ISO format
                if (isDate(value)) {
                    value = new Date(value).toISOString().slice(0, -8)
                }
                newItem[key as keyof Item] = value;
            }
        });

        return new Promise((resolve, reject) => {
            fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/saveItem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    item: newItem
                }),
            }).then(response => response.json()).then(data => {
                if (data.statusCode !== 200) {
                    console.error(data.error);
                    reject(data.error);
                }
                resolve("Successfully edited item!");
                fetchItem();
            }).catch(error => {
                console.error(error);
                reject(error instanceof Error ? error.message : typeof error === "string" ? error : error);
            });
        });
    }

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
                        <p><strong>Description: </strong> {item.description}</p>
                        <p><strong>Start Date: </strong> {typeof item.startDate === "string" ? new Date(item.startDate).toLocaleString() : item.startDate.toLocaleString()}</p>
                        <p><strong>End Date: </strong> {item?.endDate ?(typeof item.endDate === "string" ? new Date(item.endDate).toLocaleString() : item.endDate?.toLocaleString()) : 'No end date available'}</p>
                        <p><strong>Status: </strong> {item.status}</p>
                    </div>

                    {/* Middle Container */}
                    <div className="w-1/3 flex flex-col gap-4">
                        {/* Bids */}
                        <div>
                            <p><strong>Current Price:</strong> ${item.price}</p>
                            <h3>Bids:</h3>
                            {bids.length > 0 ? (
                                <ul>
                                    {bids.map((bid, index) => (
                                        <li key={index}>${bid.bid} by {bid.buyer_username}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No bids placed yet.</p>
                            )}
                            {published && <p>{forSale ? "This item is able to be bought NOW!" : "This item is up for normal auction"}</p>}
                        </div>
                        {/* Edit Controls */}
                        {item.status === "Inactive" && bids.length === 0 &&
                            <EditItemForm item={item} handleEdit={handleEdit} />
                        }
                    </div>
                    {/* Controls */}
                    <div style={{ width: '33%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* TODO: Add a request unfreeze here and hide publish/unpublish if it is frozen/requested */}
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
                            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:bg-gray-500"
                            onClick={handlePublishClick}
                            disabled={bids.length > 0}
                        >
                            {published ? "Unpublish" : "Publish"}
                        </button>
                        {!published &&
                            <button className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:bg-gray-500"
                                onClick={handleRemoveClick}>Remove Item</button>}

                        {/* archive item */}
                        {!archived && !published && (
                            <button
                                className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:bg-gray-500"
                                onClick={handleArchiveClick}
                            >
                                Archive
                            </button>
                        )}

                    </div>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
