import React, { ChangeEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export default function AddItemPage() {

    const navigate = useNavigate();
    const [userImage, setUserImage] = useState<string>("");
    const nameRef = useRef<HTMLInputElement | null>(null);
    const descriptionRef = useRef<HTMLInputElement | null>(null);
    const priceRef = useRef<HTMLInputElement | null>(null);
    const startDateRef = useRef<HTMLInputElement | null>(null);
    const endDateRef = useRef<HTMLInputElement | null>(null);

    const handleURLChange = (e: ChangeEvent<HTMLInputElement>) => {
        //if(e.target.value === "") setUserImage(undefined);
        setUserImage(e.target.value);
    }

    // #region saveItem
    const addItem = () => {
        const fetchData = async () => {
            const payload = {
                token: localStorage.getItem('token'),
                item: {
                    name: nameRef.current!.value,
                    description: descriptionRef.current!.value,
                    image: userImage,
                    initialPrice: Math.max(1, parseFloat(priceRef.current!.value) || 1),
                    startDate: new Date(startDateRef.current!.value).toISOString().slice(0, -8),
                    endDate: endDateRef.current!.value === "" ? null : new Date(endDateRef.current!.value).toISOString().slice(0, -8)
                }
            };
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
                if (resultData.statusCode === 400) {
                    alert("Add item failed");
                    console.error(resultData)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }
    // #endregion

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addItem();
    };

    return (
        <div >
            <form onSubmit={handleSave} className='sellerContent'>
                <div className='sellerContentColumn' style={{ width: "60%", }}>
                    <input className="itemPageInput" ref={nameRef} style={{ fontSize: "30px" }} type="text" name="ItemName" data-length="20" maxLength={45} required
                        placeholder="Item Name" />
                    <div className="border border-black rounded-lg h-52 max-h-52 max-w-52 m-4 flex grow">
                        <picture>
                            <img src={userImage || "BlankImage.jpg"} alt={userImage} className="rounded-lg" />
                        </picture>
                    </div>
                    <input className="itemPageInput" style={{ fontSize: "16px" }} type="url" name="ItemURL" data-length="20"
                        placeholder="Image URL" value={userImage} onChange={handleURLChange} maxLength={200} />
                    <input className="itemPageInput" ref={descriptionRef} style={{ fontSize: "16px" }} type="text" name="ItemDescription" data-length="20"
                        placeholder="Item Description" maxLength={100} />
                    <input className="itemPageInput" ref={priceRef} style={{ fontSize: "16px" }} type="number" name="ItemPrice" data-length="20"
                        step={1} min={0} maxLength={10} placeholder="Item Price" />
                    <div className='flex row'> {/* dates */}
                        <p style={{ fontSize: "50px" }}>🕒</p>
                        <div className='dateContainer'>
                            <div className='dateLabel' style={{ width: "100%" }}>
                                <b>Start Date:</b>
                                <input className="itemPageInput" ref={startDateRef} style={{ fontSize: "12px" }} type="datetime-local" name="StartDate" data-length="10" required
                                    placeholder="MM/DD/YYYY"
                                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8)}
                                    defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8)} />
                            </div>
                            <div className='dateLabel' style={{ width: "100%" }}>
                                <b>End Date:</b>
                                <input className="itemPageInput" ref={endDateRef} style={{ fontSize: "12px" }} type="datetime-local" name="EndDate" data-length="10"
                                    placeholder="MM/DD/YYYY"
                                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8)}
                                    defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='sellerContentColumn' style={{ marginTop: "auto" }}> {/* buttons */}
                    <button className='save accountButton' type="submit">💾 Save</button>
                    <Link to="/account">
                        <button className='cancel accountButton' style={{ color: "red", border: "1px solid red", }}>
                            ❌Cancel
                        </button>
                    </Link>
                </div></form>
        </div>
    );
}