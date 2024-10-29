'use client';
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { Routes, Route, Link, HashRouter, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, createContext, useContext } from "react";

function AppContent() {
  async function onLogin(token: string): Promise<void> {
    //"use server"; // removed bc causing compile issues
    console.log("onLogin token provided " + token);
  }
  const [searchInput, setSearchInput] = useState("");
  const [tempSearchInput, setTempSearchInput] = useState("");
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("startDate_ASC");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Start");
  const [isAscending, setIsAscending] = useState(true);

  const handleOptionClick = (option:any) => {
    if(selectedOption === option) {
      setIsAscending(!isAscending);
    } else {
      setSelectedOption(option);
      setIsAscending(true);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: any) => {
    setTempSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchInput(tempSearchInput);
  };

  useEffect(() => {
    var sort = "";
    switch(selectedOption) {
      case "Name":
        sort += "name"
        break;
      case "Price":
        sort += "price";
        break;
      case "Start":
        sort += "startDate";
        break;
      case "End":
        sort += "endDate";
        break;
      default:
        sort += "name"
    }
    sort += "_";
    sort += isAscending ? "ASC" : "DESC";
    setSortBy(sort);
  }), [selectedOption, isAscending];

  return (
    <main className="main-container">
            <div className="heading">
            <Link to="/"><button className="HomeButton">Auction House</button></Link>
            <div className="search">
              <div className="searchBar">
                <input
                  className="search-input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
                  type="text"
                  maxLength={20}
                  value={tempSearchInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onChange={handleInputChange}
                  placeholder="Search here..."
                />
                <button onClick={handleSearch}>&nbsp;🔎&nbsp;</button> 
              </div>  
              <div style={{ position: "relative", marginLeft: "8px" }}>
                <button onClick={() => setIsOpen(!isOpen)}>
                  ▼
                </button>
                {isOpen && (
                  <ul className="dropdown" style={{ top: "0", left: "100%" }}>
                    {["Name", "Price", "Start", "End"].map((option) => (
                      <li
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        style={{
                          display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "8px",
                          backgroundColor: option === selectedOption ? "#f0f0f0" : "white", // Highlight selected option
                          fontWeight: option === selectedOption ? "bold" : "normal",        // Bold selected option
                        }}
                      >
                        {option === selectedOption && (isAscending ? "▼" : "▲")} 
                        <span style={{ marginLeft: "4px" }}>{option}</span>
                      </li>
                    ))}
                  </ul>
                )} 
              </div> 
            </div>
            <Link to="/Login"><button className="AccountButton">Account</button></Link>
            </div>
            <div className="content">
            <Routes>
            <Route path="/" element={<HomePage searchInput={searchInput} sortBy={sortBy}/>} />
            <Route path="/Login" element = {<LoginPage onLogin={onLogin}/>} />
            </Routes>
            </div>  
    </main>
  );
}
export default function Home() {
  return (
    <HashRouter basename='/'>
      <AppContent />
    </HashRouter>
  );
}
