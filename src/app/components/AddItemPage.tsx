import React, { useState, useEffect, ChangeEvent} from 'react';
import SellerPage from './SellerPage';
import { Link } from 'react-router-dom';

interface AddItemPageProps {
    
}

export default function AddItemPage( {}:AddItemPageProps) { 
    const [userImage,setUserImage] = useState<string | number | readonly string[] | undefined>(undefined);

    const handleURLChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.value === "") setUserImage(undefined);
        else setUserImage(e.target.value);
    }

    return (
        <div className='sellerContent'>
            <div className='sellerContentColumn' style={{ width: "60%", }}>
                <input className="itemPageInput" style={{fontSize: "30px"}} type="text" name="ItemName" data-length="20" required
                    placeholder="Item Name"/>
                <div style={{border: "1px solid black", borderRadius: "8px", height: "200px", maxHeight: "200px", maxWidth: "200px", margin: "1rem",}}>
                    <img src={"https://en.wikipedia.org/wiki/Red_panda#/media/File:Red_Panda_(24986761703).jpg"}/>
                </div>
                <input className="itemPageInput" style={{fontSize: "16px"}} type="text" name="ItemURL" data-length="20" required
                    placeholder="Image URL" value={userImage} onChange={handleURLChange}/>
                <input className="itemPageInput" style={{fontSize: "16px"}} type="text" name="ItemURL" data-length="20" required
                    placeholder="Item Description" value={userImage} onChange={handleURLChange}/>
                <div className='flex row'> {/* dates */}
                    <p style={{fontSize: "50px"}}>🕒</p>
                    <div className='flex column center'>
                        <div className='flex row' style={{width: "100%"}}>
                            <p style={{fontSize: "12px", }}>Start Date:</p>{/* do calendar pop up */}
                            <input className="itemPageInput" style={{fontSize: "12px"}} type="text" name="StartDate" data-length="10" required
                                placeholder="MM/DD/YYYY"/>
                        </div>
                        <div className='flex row' style={{width: "100%"}}>
                            <p style={{fontSize: "12px"}}>End Date:</p>{/* do calendar pop up */}
                            <input className="itemPageInput" style={{fontSize: "12px"}} type="text" name="EndDate" data-length="10" required
                                placeholder="MM/DD/YYYY"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='sellerContentColumn'> {/* buttons */}
                <button className='save accountButton'>💾 Save</button>
                <Link to="/account">
                    <button className='cancel accountButton' style={{color: "red", border: "1px solid red",}}>
                        ❌Cancel
                        </button>
                </Link>
            </div>
        </div>
    );
}