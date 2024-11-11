import { Item } from "@/utils/types";
import { Link } from "react-router-dom";

interface ItemDisplayProps {
  item: Item;
}

export default function ItemDisplay({ item }: ItemDisplayProps) {
  return (
    <Link to={`/item/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="item">
        <img src={item.image || '/BlankImage.jpg'} alt={item.name} style={{ borderRadius: "8px" }} />
        <b style={{ fontSize: "20px" }}>{item.name} - ${item.price}</b>
        <p>{item.description}</p>
        <div className='flex row'>
          <p style={{ fontSize: "30px" }}>🕒</p>
          <div className='dateContainer'>
            <div className='dateLabel'>
              {typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()}
            </div>
            <div className='dateLabel'>
              {(typeof item.endDate === "string" ? new Date(item.endDate).toLocaleDateString() : item.endDate?.toLocaleDateString()) || "No end date"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
