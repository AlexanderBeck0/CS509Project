import { Item } from "@/utils/types";

interface ItemDisplayProps {
    item: Item
}

export default function ItemDisplay({ item }: ItemDisplayProps) {
    return (
        <div className="item">
            <img src={item.image || '/BlankImage.jpg'} // Use the validated or fallback image
                alt={item.name} style={{ borderRadius: "8px" }} />
            <b style={{ fontSize: "20px" }}>{item.name} - ${item.price}</b>
            <p>{item.description} </p>
            <div className='flex row'> {/* dates */}
                <p style={{ fontSize: "30px" }}>🕒</p>
                <div className='dateContainer'>
                    <div className='dateLabel' style={{ width: "100%" }}>
                        {typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()}
                    </div>
                    <div className='dateLabel' style={{ width: "100%" }}>
                        {(typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()) || "No end date"}
                    </div>
                </div>
            </div>
            <p> </p>
        </div>
    );
}