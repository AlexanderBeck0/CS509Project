import React, { useState, ChangeEvent, useRef, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AddItemPageProps {
}

export default function AddItemPage( props :AddItemPageProps) { 

    const navigate = useNavigate();
    const [userImage,setUserImage] = useState<string>("");
    const nameRef = useRef<HTMLInputElement | null>(null);
    const descriptionRef = useRef<HTMLInputElement | null>(null);
    const priceRef = useRef<HTMLInputElement | null>(null);
    const startDateRef = useRef<HTMLInputElement | null>(null);
    const endDateRef = useRef<HTMLInputElement | null>(null);

    const handleURLChange = (e: ChangeEvent<HTMLInputElement>) => {
        //if(e.target.value === "") setUserImage(undefined);
        setUserImage(e.target.value);
    } 

    const addItem = () => {
        const fetchData = async () => {
            const payload = {
              token: localStorage.getItem('token'),
              item: {
                name: nameRef.current!.value,
                description: descriptionRef.current!.value,
                image: userImage,
                initialPrice: Math.max(1, parseFloat(priceRef.current!.value) || 1),
                startDate: startDateRef.current!.value,
                endDate: endDateRef.current!.value == "" ? null : endDateRef.current!.value
              }
            };
            console.log(JSON.stringify(payload));
            try {
              const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/saveItem',
                {
                  method: 'POST',
                  body: JSON.stringify(payload),
                });
      
              const resultData = await response.json();
              if (resultData.statusCode === 200) {
                navigate('/account');
              }
              if(resultData.statusCode === 400) {
                alert("Add item failed");
              }
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
          fetchData();
    }

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; 

        if (startDateRef.current) {
            startDateRef.current.min = today;
        }
        if (endDateRef.current) {
            endDateRef.current.min = today;
        }
    }, []);

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addItem();
    };

    return (
        <div >
            <form onSubmit={handleSave}className='sellerContent'>
            <div className='sellerContentColumn' style={{ width: "60%", }}>
                <input className="itemPageInput" ref={nameRef} style={{fontSize: "30px"}} type="text" name="ItemName" data-length="20" required
                    placeholder="Item Name"/>
                <div style={{border: "1px solid black", borderRadius: "8px", height: "200px", maxHeight: "200px", maxWidth: "200px", margin: "1rem",}}>
                    <img src={userImage || "BlankImage.jpg"} alt={userImage} style={{borderRadius: "8px"}}/>
                </div>
                <input className="itemPageInput" style={{fontSize: "16px"}} type="text" name="ItemURL" data-length="20"
                    placeholder="Image URL" value={userImage} onChange={handleURLChange}/>
                <input className="itemPageInput" ref={descriptionRef} style={{fontSize: "16px"}} type="text" name="ItemURL" data-length="20"
                    placeholder="Item Description"/>
                <input className="itemPageInput" ref={priceRef} style={{fontSize: "16px"}} type="number" name="ItemPrice" data-length="20"
                    placeholder="Item Price"/>
                <div className='flex row'> {/* dates */}
                    <p style={{fontSize: "50px"}}>🕒</p>
                    <div className='dateContainer'>
                        <div className='dateLabel' style={{width: "100%"}}>
                            <b>Start Date:</b>
                            <input className="itemPageInput" ref={startDateRef} style={{fontSize: "12px"}} type="date" name="StartDate" data-length="10" required
                                placeholder="MM/DD/YYYY"/>
                        </div>
                        <div className='dateLabel' style={{width: "100%"}}>
                            <b>End Date:</b>
                            <input className="itemPageInput" ref={endDateRef} style={{fontSize: "12px"}} type="date" name="EndDate" data-length="10"
                                placeholder="MM/DD/YYYY"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='sellerContentColumn' style={{marginTop: "auto"}}> {/* buttons */}
                <button className='save accountButton' type="submit">💾 Save</button>
                <Link to="/account">
                    <button className='cancel accountButton' style={{color: "red", border: "1px solid red",}}>
                        ❌Cancel
                        </button>
                </Link>
            </div></form>
        </div>
    );
}