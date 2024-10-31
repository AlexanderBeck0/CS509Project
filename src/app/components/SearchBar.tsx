import React, { ChangeEvent, KeyboardEvent, useState } from 'react';

interface SearchBarProps {
  handleSearch: (input: string) => void;
}

export function SearchBar({ handleSearch }: SearchBarProps) {
  const [tempSearchInput, setTempSearchInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempSearchInput(e.target.value);
  };

  return (
    <div className="searchBar">
      <input
        className="search-input"
        type="text"
        maxLength={20}
        value={tempSearchInput}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch(tempSearchInput)}
        onChange={handleInputChange}
        placeholder="Search here..."
      />
      <button className='searchButton' onClick={() => handleSearch(tempSearchInput)}>&nbsp;🔎&nbsp;</button>
    </div>
  );
}
export default SearchBar;
