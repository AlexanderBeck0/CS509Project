import { Account, Item } from '@/utils/types';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import ItemDisplay from './ItemDisplay';

interface BuyerPageProps {
  userData: Account;
  logout: () => void;
  closeAccount: () => void;
}

export default function BuyerPage(props: BuyerPageProps) {
  const fundsRef = useRef<HTMLInputElement | null>(null);
  const [selectedOption, setSelectedOption] = useState("All");
  const [items, setItems] = useState<Item[]>([]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = event.target as HTMLDivElement;
    const scrollAmount = event.deltaY;
    container.scrollTo({
      top: 0,
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleLogout = () => {
    props.logout();
  };

  const handleCloseAccount = () => {
    props.closeAccount();
  };

  async function addFunds(): Promise<void> {
    const fundsInput = fundsRef.current?.valueAsNumber;

    if (fundsInput === undefined || isNaN(fundsInput)) {
      console.error("Invalid funds input.");
      return;
    }

    if (Math.floor(fundsInput) !== fundsInput || fundsInput < 1) {
      console.error("Funds must be a positive whole number.");
      return;
    }

    try {
      const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/edit-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          deltaBalance: fundsInput,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error || "Failed to add funds.");
      }

      const data: { statusCode: 200; newBalance: number } | { statusCode: 400 | 500; error: string } = await response.json();
      if (data.statusCode !== 200) {
        throw new Error(data.error);
      }

      props.userData.balance = data.newBalance;
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }

  useEffect(() => {
    const fetchActiveBids = async () => {
      try {
        const payload = {
            token: localStorage.getItem('token')
          };
          console.log(payload);
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/reviewActiveBids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        /*
        const data: {
          statusCode: 200 | 400;
          username?: string;
          bids?: { id: number; bid: number; timeOfBid: string; item: Item }[];
          error?: string;
        } = await response.json();
        console.log(data);*/
        const data = await response.json();
        if (data.statusCode === 200 && data.body.bids) {
            console.log(data.body);
          //setItems(data.body.bids.map(bid => bid.item));
        } else {
          console.error(data.error || "Failed to fetch active bids.");
        }
      } catch (error) {
        if (error instanceof Error) console.error(error);
        if (typeof error === 'string' && error.includes("jwt expired")) {
            console.error("Please log in to see this page.");
            return;
        }
        console.error("Error fetching active bids:", error);
      }
    };

    fetchActiveBids();
  }, []);

  return (
    <div className="content">
      <div>
        <Image src="/accountSymbol.png" alt="Buyer Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
        <p><b>Buyer:</b> {props.userData.username}</p>
      </div>
      <div className="pageContent">
        <div className="pageContentColumn" style={{ width: "25%" }}>
          <p><b>Funds:</b> ${props.userData.balance}</p>
          <div className="buttons">
            <input
              type="number"
              min={1}
              step={1}
              ref={fundsRef}
              placeholder="Funds #"
              className="input"
              onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "")}
            />
            <button className="accountButton" type="button" onClick={addFunds}>Add Funds</button>
            <button className="accountButton" onClick={handleCloseAccount}>Close Account</button>
            <button className="accountButton" onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <div className="pageContentColumn" style={{ width: "60%" }}>
          <div className="flex row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <p><b>Active Bids:</b></p>
            <select value={selectedOption} onChange={handleSelectChange}>
              <option value={"All"}>All</option>
              <option value={"Active"}>Active</option>
              <option value={"Inactive"}>Inactive</option>
              <option value={"Frozen"}>Frozen</option>
              <option value={"Requested"}>Requested</option>
              <option value={"Failed"}>Failed</option>
              <option value={"Archived"}>Archived</option>
              <option value={"Completed"}>Completed</option>
              <option value={"Fulfilled"}>Fulfilled</option>
            </select>
          </div>
          <div className="flex row">
            <div className="container" onWheel={handleScroll}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <ItemDisplay key={index} item={item} />
                ))
              ) : (
                <p>No items found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
