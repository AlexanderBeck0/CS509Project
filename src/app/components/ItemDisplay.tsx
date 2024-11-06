import React, { ChangeEvent, KeyboardEvent, useState } from 'react';

interface ItemProps {
    index: number,
    item : {name:string, description:string, image:string, startDate:string, endDate:string, price:number}
}

export function Item( {index, item}: ItemProps) {
  return (
    <div key={index} className="item">
        <img src={item.image} alt={item.image}/>
        <b style={{fontSize: "20px"}}>{item.name} - ${item.price}</b>
        <p>{item.description} </p>
        <div className='flex row'> {/* dates */}
            <p style={{fontSize: "30px"}}>🕒</p>
            <div className='dateContainer'>
                <div className='dateLabel' style={{width: "100%"}}>
                    {new Date(item.startDate).toLocaleDateString("en-US")}
                </div>
                <div className='dateLabel' style={{width: "100%"}}>
                {item.endDate === "0000-00-00 00:00:00" ? "MM/DD/YYYY" : new Date(item.endDate).toLocaleDateString("en-US")}
                </div>
            </div>
        </div>
        <p> </p>
    </div>
  );
}
export default Item;
