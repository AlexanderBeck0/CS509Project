import { Account, Bid, Item } from '@/utils/types';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ItemDisplay from './ItemDisplay';

interface BuyerPageProps {
  userData: Account;
  logout: () => void;
  closeAccount: () => void;
}

export default function BuyerPage(props: BuyerPageProps) {
  const fundsRef = useRef<HTMLInputElement | null>(null);
  const [selectedOption, setSelectedOption] = useState("All");
  const [activeBids, setActiveBids] = useState<Item[]>([]);
  const [fulfilledPurchases, setFulfilledPurchases] = useState<Item[]>([]);
  // const [bids, setBids] = useState<Bid[]>([]);
  const [funds, setFunds] = useState<number>(props.userData.balance);

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

      setFunds(data.newBalance)
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }

  useEffect(() => {
    const fetchActiveBids = async (option: string, setItems: Dispatch<SetStateAction<Item[]>>) => {
      try {
        const payload = {
          token: localStorage.getItem('token'),
          status: option,
        };
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/reviewActiveBids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.statusCode === 200 && data.body.bids) {
          const mappedItems = data.body.bids.map((bid: { item: Item } & Bid) => bid.item);
          // const mappedBids = data.body.bids.map((bid: Bid) => (bid.id, bid.bid, bid.timeOfBid, bid.item_id))
          setItems(mappedItems);
          // setBids(mappedBids);
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

    fetchActiveBids("Active", setActiveBids);
    fetchActiveBids("Fulfilled", setFulfilledPurchases);
  }, [props]);

  return (
    <div className="content">
      <div>
        <Image src="/accountSymbol.png" alt="Buyer Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
        <p><b>Buyer:</b> {props.userData.username}</p>
      </div>
      <div className="pageContent">
        <div className="pageContentColumn" style={{ width: "25%" }}>
          <p><b>Funds:</b> ${funds}</p>
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
        <p><b>Active Bids:</b></p>
          <div className="flex row container" onWheel={handleScroll}>
            {activeBids.length > 0 ? (
              activeBids.map((item, index) => (
                <ItemDisplay key={index} item={item}>
                  <Link to={`/item/${item.id}`}>
                    <button className={`p-2 border border-black rounded-lg select-none`}>
                      View Item
                    </button>
                  </Link>
                </ItemDisplay>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </div>
          <p><b>Purchases:</b></p>
          <div className="flex row container" onWheel={handleScroll}>
            {fulfilledPurchases.length > 0 ? (
              fulfilledPurchases.map((item, index) => (
                <ItemDisplay key={index} item={item}>
                  <Link to={`/item/${item.id}`}>
                    <button className={`p-2 border border-black rounded-lg select-none`}>
                      View Item
                    </button>
                  </Link>
                </ItemDisplay>
              ))
            ) : (
              <p>No items found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
