import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  setSearchInput: (input: string) => void;
}

export function SearchBar({ setSearchInput }: SearchBarProps) {
  const [tempSearchInput, setTempSearchInput] = useState("");

  const navigate = useNavigate();
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempSearchInput(e.target.value);
  };

  const handleSearch = (input: string) => {
    setSearchInput(input);
    navigate('/');
  };

  return (
    <div className="searchBar">
      <input
        className="search-input"
        type="text"
        maxLength={50}
        value={tempSearchInput}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch(tempSearchInput)}
        onChange={handleInputChange}
        placeholder="Search here..."
        role="searchbox" // I'm not quite sure what the difference between "search" and "searchbox" are...
      />
      <button className='searchButton' onClick={() => handleSearch(tempSearchInput)}>&nbsp;🔎&nbsp;</button>
    </div>
  );
}
export default SearchBar;
