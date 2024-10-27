'use client';
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { Routes, Route, Link, HashRouter } from 'react-router-dom';

export default function Home() {
  async function onLogin(token: string): Promise<void> {
    //"use server"; // removed bc causing compile issues
    console.log("onLogin token provided " + token);
  }

  return (
    <main className="main-container">
        <HashRouter basename='/'>
            <div className="heading">
            <Link to="/"><button className="HomeButton">Auction House</button></Link>
            <div>Search here</div>
            <Link to="/Login"><button className="AccountButton">Account</button></Link>
            </div>
            <div className="content">
            <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/Login" element = {<LoginPage onLogin={onLogin} />} />
            </Routes>
            </div>

            
        </HashRouter>     
    </main>
  );
}
