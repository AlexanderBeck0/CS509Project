'use client';
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { Routes, Route, Link, HashRouter, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import Dropdown from "./components/Dropdown";
import SearchBar from "./components/SearchBar";

function AppContent() {
  async function onLogin(token: string): Promise<void> {
    //"use server"; // removed bc causing compile issues
    console.log("onLogin token provided " + token);
  }

  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("startDate_ASC");

  const handleSearch = (input: any) => {
    setSearchInput(input);
  };

  return (
    <main className="main-container">
      <div className="heading">
        <Link to="/"><button className="HomeButton">Auction House</button></Link>
        <div className="search">{/* Need to disable if seller */}
          <SearchBar handleSearch={handleSearch}/>
          <Dropdown setSortBy={setSortBy}/> 
        </div>
        <Link to="/Login"> {/* Need link to other pages if logged in */}
          <button className="AccountButton" style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <img src="accountSymbol.png" style={{ height: "40px", width: "auto", objectFit: "contain" }} alt="Account"/>
          </button>
        </Link>
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
