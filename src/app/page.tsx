'use client';
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { Routes, Route, Link, HashRouter } from 'react-router-dom';
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import SortDropdown from "./components/SortDropdown";
import SearchBar from "./components/SearchBar";
import AccountPage from "./components/AccountPage";
import RegisterPage from "./components/RegisterPage";

function AppContent() {
  async function onLogin(token: string): Promise<void> {
    //"use server"; // removed bc causing compile issues
    console.log("onLogin token provided " + token);
  }

  async function onRegister(token: string): Promise<void> {
    //"use server"; // removed bc causing compile issues
    console.log("onRegister token provided " + token);
  }

  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("startDate_ASC");

  const handleSearch = (input: string) => {
    setSearchInput(input);
  };

  return (
    <main className="main-container">
      <div className="heading">
        <Link to="/"><button className="HomeButton">Auction House</button></Link>
        <div className="search">{/* Need to disable if seller */}
          <SearchBar handleSearch={handleSearch} />
          <SortDropdown setSortBy={setSortBy} />
        </div>
        <Link to="/login"> {/* Need link to other pages if logged in */}
          <button className="AccountButton" style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Image src="/accountSymbol.png" height={40} width={40} style={{ height: "40px", width: "auto", objectFit: "contain" }} alt="Account" />
          </button>
        </Link>
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage searchInput={searchInput} sortBy={sortBy} />} />
          <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
          <Route path="/createAccount" element={<RegisterPage onRegister={onRegister} />} />
          <Route path="/account" element={<AccountPage accountType={"seller"} />} />
        </Routes>
      </div>
    </main>
  );
}
export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <HashRouter basename='/'>
      <AppContent />
    </HashRouter>
  );
}
