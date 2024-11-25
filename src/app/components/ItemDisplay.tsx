import { Item } from "@/utils/types";
import { ReactNode } from "react";
import TimeDisplay from "./TimeDisplay";

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
        <TimeDisplay startDate={item.startDate} endDate={item.endDate}/>
        <div className="flex flex-col">
          {item?.status && <p className="text-lg basis-1/3">{item.status}</p>}
          {!!item?.archived && <p className="text-lg basis-1/3">Archived</p>}
        </div>
      </div>
      {props.children}
    </div>
  );
}
