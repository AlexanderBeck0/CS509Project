import type { ItemStatus } from "@/utils/types";
import { useRef } from "react";

interface BuyerItemPageProps {
    status: ItemStatus;
    item_id: number;
    itemForSale: boolean;
    price: number;
    fetchItem: () => Promise<void>;
}

export default function BuyerItemPage(props: BuyerItemPageProps) {
    const bidRef = useRef<HTMLInputElement | null>(null);
    // get funds from getToken
    const handlePlaceBid = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const placeBid = async () => {
            const payload = {
                token: localStorage.getItem('token'),
                id: props.item_id,
                bid: props.itemForSale ? props.price : Number(bidRef.current!.valueAsNumber),
            };

            await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/placeBid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }).then(response => response.json()).then(data => {

                if (data.statusCode !== 200) throw data.error;
                if (data.statusCode === 200) {
                    alert(data.response);
                    props.fetchItem();

                }
            }).catch(error => {
                // Log actual errors and not just insufficient permission errors
                if (error instanceof Error) console.error(error);
                if (typeof error === 'string' && error.includes("Insufficient funds")) {
                    alert(`Insufficient funds to ${props.itemForSale ? "purchase" : "bid on"} this item`);
                }
                if (typeof error === 'string') alert(error)
            });
        };

        placeBid();
    };

    if (props.status === "Active") {
        return (
            <form onSubmit={handlePlaceBid}>
                {!props.itemForSale &&
                    <label>
                        Place bid of: $
                        <input
                            type="number"
                            ref={bidRef}
                            defaultValue={props.price}
                            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
                            min={props.price}
                            step={1}
                        />
                    </label>
                }
                <button type="submit" className="accountButton" style={{ marginLeft: '0.5rem' }}>
                    {props.itemForSale ? "Buy" : "Place Bid"}
                </button>

            </form>
        );
    } else if (props.status === "Completed") {
        return (<div>Item has been purchased</div>);
    } else if (props.status === "Fulfilled") {
        return (<div>Item has been fulfilled</div>);
    } else {
        return (<div>unhandled status {props.status}</div>);
    }
}