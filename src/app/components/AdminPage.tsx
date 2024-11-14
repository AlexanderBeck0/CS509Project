import Image from 'next/image';
import { ReactNode, useRef, useState } from 'react';

interface AccountPageProps {
    logout: () => void;
}

export default function AdminPage(props: AccountPageProps) {
    /**
     * The possible tables that an Admin can view.
     * 
     * @see {@link selectedRef}
     */
    const TABLES = ["Account", "Item", "Bid"] as const;

    /**
     * The ref that stores what the user currently has selected. Used a ref instead of a State so there is no rerendering.
     * 
     * Uses a trick of `typeof STR_ARR[number]` to determine the allowed values in a single place, {@link TABLES}, while also being able to
     * loop through the possible values (you cannot do this with types).
     * 
     * @see {@link TABLES}
     */
    const selectedRef = useRef<null | typeof TABLES[number]>(null);

    const outputRef = useRef<HTMLDivElement | null>(null);
    const [outputContent, setOutputContent] = useState<ReactNode>(null);
    const [copyOnClick, setCopyOnClick] = useState<boolean>(false);

    // #region view-db
    async function handleClick(tableName: typeof TABLES[number]) {
        selectedRef.current = tableName;

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
        setOutputContent(displayResult(result.body));
    }
    // #endregion
    // #region modify-db
    async function handleModify(sqlCommand: string) {
        // TODO: PLEASE add verification to this
        const payload = {
            "sqlCommand": sqlCommand,
        };
        console.log("Running SQL Command: " + sqlCommand);
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/modify-db", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (response.ok) {
            console.log(result);
            alert("Operation successful");
            setOutputContent(<code>{result.body}</code>)
        } else {
            alert(`Error: ${result.message}`);
        }
    }
    // #endregion

    // #region handleCopy
    function handleCopyOnClick() {
        setCopyOnClick(!copyOnClick);
    }

    /**
     * 
     * @param value The value to copy.
     */
    function copy(value: string): void {
        if (!copyOnClick) return;
        navigator.clipboard.writeText(value);
    }
    // #endreigion

    /**
     * Used to call `logout()`
     * @param event The event object.
     */
    const handleLogout = () => {
        props.logout();
    };

    async function deleteRow(row: Record<string, string | number | boolean>): Promise<void> {
        if (selectedRef === null) throw new Error("Can not determine what table to delete row from.");

        const PRIMARY_KEYS = ['id', 'username'];
        // Get the key name
        const keyName = Object.keys(row).filter(key => PRIMARY_KEYS.includes(key));

        if (keyName.length < 1) throw new Error("There is no known primary key in the row.");
        if (keyName.length > 1) throw new Error("There are too many primary keys in the row.");
        // keyName[0] is one of the PRIMARY_KEYS that relates to row
        const key = row[keyName[0]];

        if (row["accountType"] && row["accountType"] === "Admin") throw new Error("NOOO PLEASE DON'T DELETE ADMIN");

        await handleModify(`DELETE FROM ${selectedRef.current} WHERE ${keyName[0]} = '${key}'`);
    }

    /**
     * Displays the data in a table.
     * @param data The data to display the results from.
     * @returns The ReactNode of the table from the data.
     */
    function displayResult(data: string): ReactNode {
        const jsonData = JSON.parse(data);
        if (jsonData.length === 0) {
            return <p>No data found</p>
        }
        return (
            <table className={`border border-black border-collapse max-w-2xl w-full mx-auto`}>
                <thead className="bg-zinc-100">
                    <tr>
                        {
                            Object.keys(jsonData[0]).map((key, index) => {
                                return <th key={index} className="p-1 text-left border-b border-b-zinc-300 whitespace-nowrap">{key}</th>
                            })
                        }
                        <th className="p-1 test-left border-b border-b-zinc-300 whitespace-nowrap">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        jsonData.map((row: Record<string, string | number | boolean>, rowIndex: number) => {
                            return (
                                <tr key={rowIndex}>
                                    {
                                        Object.values(row).map((value: string | number | boolean, index) => {
                                            return <td key={index} className={`p-1 text-left border-b border-b-zinc-300 truncate text-wrap max-w-[${Math.floor(1800 / Object.values(row).length)}px] ${copyOnClick ? "hover:cursor-copy" : "hover:cursor-text"}`}
                                                title={String(value)} onClick={() => copyOnClick && copy(String(value))}>{value}</td>
                                        })
                                    }
                                    <td className={`p-1 text-left border-b border-b-zinc-300 truncate text-wrap max-w-[${Math.floor(1800 / Object.values(row).length)}px]`}>
                                        <button onClick={() => deleteRow(row)}
                                            className={`p-2 bg-red-400 hover:bg-red-500 active:bg-red-600`}>Delete</button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    return (
        <div className='content center'>
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
                <div>
                    {
                        // Add all the tables in TABLES
                        Object.values(TABLES).map((table, index) => {
                            return <button key={index} onClick={() => handleClick(table)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{table}</button>
                        })
                    }
                    <button onClick={handleCopyOnClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        {copyOnClick ? "Disable" : "Enable"} Copy on Click
                    </button>
                </div>
                <div id="result" ref={outputRef}>{outputContent}</div>
            </div>
            <button className='accountButton' onClick={handleLogout}>Log out</button>
        </div>
    );
}