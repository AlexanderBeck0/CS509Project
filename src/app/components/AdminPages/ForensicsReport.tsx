import { useEffect, useState } from "react";

export default function ForensicsReport() {
    const [accounts, setAccounts] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const payload = {
                token: localStorage.getItem('token'),
            };
            try {
                const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/generateForensicReport',
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });
    
                const resultData = await response.json();
                if (resultData.statusCode === 200) {
                    setAccounts(resultData.accounts);
                    setItems(resultData.items);
                } else throw Error;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    });

    return (
        <div style={{width: "100%", maxWidth: "100%"}}>
            <p style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>Forensic Report</p>
            <div className="pageContent" style={{width: "100%", maxWidth: "100%"}}>
                <div className="table">
                    <div className="tableHeader">
                        <p>User</p>
                        <p>Warning</p>
                    </div>
                    {accounts.length > 0 ? (
                        accounts.map((user: any, index: number) => (
                            <TableItem image={"/accountSymbol.png"} name={user.username} warnings={user.warnings}/>
                        ))
                    ) : (
                        <p>No Users</p>
                    )}
                </div>
                <div className="table">
                    <div className="tableHeader">
                        <p>Item</p>
                        <p>Warning</p>
                    </div>
                    {items.length > 0 ? (
                        items.map((item: any, index: number) => (
                            <TableItem image={item.image} name={item.name} warnings={item.warnings}/>
                        ))
                    ) : (
                        <p>No Items</p>
                    )}
                </div>    
            </div>
        </div>
    );
}

function TableItem({ image, name, warnings }: { image: string; name: string; warnings: string[] }) {

    return (
        <div style={{display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center",
            border: "2px solid #ccc", borderRadius: "8px", padding:"5px"
        }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <img src={image} alt={name} width={50} height={50} style={{ objectFit: "contain" }}/>
                <p style={{ marginLeft: 10, verticalAlign: "middle" }}>{name}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px" }}>
                {warnings.length > 0 ? (
                    warnings.map((warning: any, index: number) => (
                        <p style={{textAlign: "right"}}>{warning}</p>
                    ))
                ) : <p>No warnings</p>}
            </div>
        </div>
    )
}