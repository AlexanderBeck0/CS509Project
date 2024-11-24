import { useState } from "react";

interface BuyerItemPageProps {
    status: string;
    item_id: number;
    itemForSale: boolean;
}

export default function BuyerItemPage(props: BuyerItemPageProps) {
    //const [availableFunds, setAvailableFunds] = useState<number>(1000); // Example amount; fetch real funds as needed
    const [newBid, setNewBid] = useState<number>(0);

    const handlePlaceBid = () => {
        // if (newBid > availableFunds) {
        //     alert("You do not have enough funds to place this bid.");
        //     return;
        // }
        // Further implementation for bid submission to backend can be added here
        alert(`Placed bid of $${newBid}`);
    };
    
    return (
        <div>
            { !props.itemForSale &&
                <label>
                    Place bid of: $
                    <input
                        type="number"
                        value={newBid}
                        onChange={(e) => setNewBid(Number(e.target.value))}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                    />
                </label>
            }
            <button className="accountButton"onClick={handlePlaceBid} style={{ marginLeft: '0.5rem' }}>
                {props.itemForSale ? "Buy" : "Place Bid"}
            </button>
            {/* <p><strong>Available Funds:</strong> ${availableFunds}</p> */}
        </div>
    );
}