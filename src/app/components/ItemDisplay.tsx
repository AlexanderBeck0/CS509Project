import { Item } from "@/utils/types";
import { ReactNode } from "react";

interface ItemDisplayProps {
  item: Item,
  children?: ReactNode
}

export default function ItemDisplay(props: ItemDisplayProps) {
  const { item } = props;
  return (
    <div className="item min-w-60 ">
      <picture>
        <img src={item.image || '/BlankImage.jpg'} // Use the validated or fallback image
          alt={item.name}
          className={`rounded-lg p-1 max-w-full`} />
      </picture>
      <b className="text-xl p-1 text-wrap">{item.name} - ${item.price}</b>
      <p>{item.description} </p>
      <div className="flex flex-row">
        <div className="flex row basis-2/3"> {/* dates */}
          <p style={{ fontSize: "30px" }}>🕒</p>
          <div className='dateContainer'>
            <div className='dateLabel' style={{ width: "100%" }}>
              {typeof item.startDate === "string" ? new Date(item.startDate).toLocaleDateString() : item.startDate.toLocaleDateString()}
            </div>
            <div className='dateLabel' style={{ width: "100%" }}>
              {(typeof item.endDate === "string" ? new Date(item.endDate).toLocaleDateString() : item.endDate?.toLocaleDateString()) || "No end date"}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          {item?.status && <p className="text-lg basis-1/3">{item.status}</p>}
          {!!item?.archived && <p className="text-lg basis-1/3">Archived</p>}
        </div>
      </div>
      {props.children}
    </div>
  );
}
