import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

interface ItemProps {
    item : {name:string, description:string, image:string, startDate:string, endDate:string, price:number}
}

export function Item( {item}: ItemProps) {   
  return (
    <div className="item">
        <img src={item.image || '/BlankImage.jpg'} // Use the validated or fallback image
                alt={item.name} style={{borderRadius: "8px"}}/>
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
