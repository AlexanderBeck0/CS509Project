import React, { useRef, useEffect, useState } from 'react';

interface DropdownMenuProps {
  setSortBy: (sort: string) => void;
}

export function SortDropdown({ setSortBy }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownButtonWidth, setDropdownButtonWidth] = useState(0);
  const [selectedOption, setSelectedOption] = useState("Start");
  const [isAscending, setIsAscending] = useState(true);

  useEffect(() => {
    if (dropdownButtonRef.current) {
      setDropdownButtonWidth(dropdownButtonRef.current.offsetWidth);
    }
  }, [dropdownButtonRef]);

  const handleOptionClick = (option: string) => {
    if (selectedOption === option) {
      setIsAscending(!isAscending);
    } else {
      setSelectedOption(option);
      setIsAscending(true);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const optionMap: { [key: string]: string } = {
      Name: "name",
      Price: "price",
      Start: "startDate",
      End: "endDate",
    };

    const sortKey = optionMap[selectedOption] || "name";
    setSortBy(`${sortKey}_${isAscending ? "ASC" : "DESC"}`);
  }, [selectedOption, isAscending, setSortBy]);

  return (
    <div style={{ position: "relative", marginLeft: "8px" }}>
      <button ref={dropdownButtonRef} onClick={() => setIsOpen(!isOpen)}>
        <span className={`icon ${isOpen ? "open" : "closed"}`}>▼</span>
      </button>
      {isOpen && (
        <ul className="dropdown" style={{ right: `${dropdownButtonWidth / 2}px`, top: "120%" }}>
          {["Name", "Price", "Start", "End"].map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              style={{ borderRadius: "8px",
                display: "flex", alignItems: "center", cursor: "pointer",
                padding: "8px", 
                backgroundColor: option === selectedOption ? "#f0f0f0" : "",
                fontWeight: option === selectedOption ? "bold" : "normal",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ccc")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = option === selectedOption ? "#f0f0f0" : "")
              }>
              {option === selectedOption && (isAscending ? "▼" : "▲")}
              <span style={{ marginLeft: "4px" }}>{option}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default SortDropdown;
