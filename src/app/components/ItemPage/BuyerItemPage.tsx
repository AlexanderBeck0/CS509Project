import { useState } from "react";

interface BuyerItemPageProps {
    status: string;
    item_id: number;
    itemForSale: boolean;
    price: number;
}

export default function BuyerItemPage(props: BuyerItemPageProps) {
    const [newBid, setNewBid] = useState<number>(props.price);

    // get funds from getToken

    const handlePlaceBid = () => {
        const placeBid = async () => {
            const payload = { 
                token : localStorage.getItem('token'),
                id : props.item_id,
                bid: newBid,
            };
            
            await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/placeBid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }).then(response => response.json()).then(data => {
                console.log(data);
                if (data.statusCode !== 200) throw data.error;
                if (data.statusCode === 200) {
                    alert(props.itemForSale ? "Purchased item" : "Bid placed");
                }
            }).catch(error => {
                // Log actual errors and not just insufficient permission errors
                if (error instanceof Error) console.error(error);
                if (typeof error === 'string' && error.includes("Insufficient funds")) {
                    alert(`Insuddicient funds to ${props.itemForSale ? "purchase": "bid on"} this item`);
                }
            });
        };

        placeBid();
    };
    
    if(props.status === "Active") {
    return (
        <div>
                {!props.itemForSale &&
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
    } else if (props.status === "Complete") {
        return (<div>complete</div>);
    } else {
        return (<div>unhandled status {props.status}</div>);
    }
}