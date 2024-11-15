import Image from 'next/image';

interface AccountPageProps {
    logout: () => void;
}

export default function AdminPage(props: AccountPageProps) {
    // #region view-db
    async function handleClick(tableName: string) {
        const payload = {
            "tableName": tableName,
        };
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/view-db", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        displayResult(result.body);
    }
    // #endregion
    // #region modify-db
    async function handleModify(sqlCommand: string) {
        const payload = {
            "sqlCommand": sqlCommand,
        };
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/modify-db", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (response.ok) {
            console.log(result.body);
            alert("Operation successful");
            const resultDiv = document.getElementById("result");
            if (resultDiv) {
                resultDiv.innerHTML = result.body;
            }
        } else {
            alert(`Error: ${result.message}`);
        }
    }
    // #endregion

    /**
     * Used to call `logout()`
     * @param event The event object.
     */
    const handleLogout = () => {
        props.logout();
    };

    function displayResult(data: string) {
        const resultDiv = document.getElementById("result");
        const jsonData = JSON.parse(data);
        if (jsonData.length === 0) {
            if (resultDiv) {
                resultDiv.innerHTML = "No data found";
            }
            return;
        }

        let table = `
            <table border='1' style='border-collapse: collapse; width: 100%;'>
            <thead style='background-color: #f2f2f2;'>
                <tr>`;
        // Create table headers
        Object.keys(jsonData[0]).forEach(key => {
            table += `<th style='padding: 8px; text-align: left; border-bottom: 1px solid #ddd;'>${key}</th>`;
        });
        table += `
                </tr>
            </thead>
            <tbody>`;

        // Create table rows
        jsonData.forEach((row: Record<string, string | number | boolean>) => {
            table += "<tr>";
            Object.values(row).forEach((value: string | number | boolean) => {
                table += `<td style='padding: 8px; border-bottom: 1px solid #ddd;'>${value}</td>`;
            });
            table += "</tr>";
        });
        table += `
            </tbody>
            </table>`;

        if (resultDiv) {
            resultDiv.innerHTML = table;
        }
    }

    return (
        <div className='content'>
            <div> {/* heading of admin */}
                <Image src="/accountSymbol.png" alt="Admin Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>ADMIN PAGE</b></p>
            </div>
            <div className='SQL Commands'>
                <h1>Execute SQL Command:</h1>
                <textarea id="sqlCommand" rows={4} cols={50} placeholder="Enter your SQL command here"></textarea>
                <button onClick={() => {
                    const sqlCommand = (document.getElementById('sqlCommand') as HTMLTextAreaElement).value;
                    handleModify(sqlCommand);
                }}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Execute
                </button>
            </div>
            <div className="viewDB"> {/* view DB content */}
                <h1>View Database Tables: </h1>
                <button onClick={() => handleClick('Account')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Account
                </button>
                <button onClick={() => handleClick('Item')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Item</button>
                <button onClick={() => handleClick('Bid')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Bid</button>
                <div id="result"></div>
            </div>
            <button className='accountButton' onClick={handleLogout}>Log out</button>
        </div>
    );
}