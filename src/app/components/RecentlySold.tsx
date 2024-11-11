import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentlySoldProps {
  setRecentlySold: (checked: boolean) => void;
  recentlySold: boolean;
}

export default function RecentlySold({ setRecentlySold, recentlySold }: RecentlySoldProps) {

    const navigate = useNavigate();

    const handleRecentlySoldChange = () => {
        setRecentlySold(!recentlySold)
        navigate('/');
      }

    return (
        <div className='searchBox'>
            <span style={{ fontSize: "12px",marginRight: "0.5rem" }}>Recently Sold:</span>
            <input className="recently-sold-check" type="checkbox" checked={recentlySold} onChange={handleRecentlySoldChange} />
        </div>
    );
}