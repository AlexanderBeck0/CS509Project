'use client';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { HashRouter, Link, Navigate, redirect, Route, Routes } from 'react-router-dom';
import AccountPage from "./components/AccountPage";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SearchBar from "./components/SearchBar";
import SortDropdown from "./components/SortDropdown";

function AppContent() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("startDate_ASC");

  // Called whenever token changes
  useEffect(() => {
    const verifyToken = async () => {
      if (token === undefined || token === null) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/verifyToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        // Use === true to ensure that it won't become undefined if data.valid is undefined
        setIsLoggedIn(data.body.valid === true);
      } catch (error) {
        console.error("Failure to verify token: " + error);
        setIsLoggedIn(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleSearch = (input: string) => {
    setSearchInput(input);
  };

  function onLogin(newToken: string): void {
    setToken(newToken);
    localStorage.setItem('token', newToken); //Store token in localStorage
  }

  function onRegister(newToken: string): void {
    setToken(newToken);
    localStorage.setItem('token', newToken); //Store token in localStorage
  }

  /**
   * Logs the user out by deleting their token from local storage and changing the React states.
   * 
   * Redirects user to `/`.
   */
  function logout(): void {
    // Remove the token from local storage
    localStorage.removeItem("token");

    setToken(null);
    setIsLoggedIn(false);
    redirect('/');
  }

  return (
    <main className="main-container">
      <div className="heading">
        <Link to="/"><button className="HomeButton">Auction House</button></Link>
        <div className="search">{/* Need to disable if seller */}
          <SearchBar handleSearch={handleSearch} />
          <SortDropdown setSortBy={setSortBy} />
        </div>
        <Link to="/login">
          <button className="AccountButton" style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <Image src="/accountSymbol.png" height={40} width={40} style={{ height: "40px", width: "auto", objectFit: "contain" }} alt="Account" />
          </button>
        </Link>
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage searchInput={searchInput} sortBy={sortBy} />} />
          <Route path="/login" element={
            (!isLoggedIn ? <LoginPage onLogin={onLogin} /> : <Navigate to={"/account"} />)
          } />
          <Route path="/createAccount" element={
            (!isLoggedIn ? <RegisterPage onRegister={onRegister} /> : <Navigate to={"/account"} />)
          } />
          <Route path="/account" element={
            (isLoggedIn ? <AccountPage accountType={"Seller"} logout={logout} /> : <Navigate to={"/"} />)
          } />
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
