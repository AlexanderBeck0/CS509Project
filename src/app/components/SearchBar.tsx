import React, { ChangeEvent, KeyboardEvent, useState } from 'react';

interface SearchBarProps {
  handleSearch: (input: String) => void;
}

export function SearchBar({ handleSearch }: SearchBarProps) {
  const [tempSearchInput, setTempSearchInput] = useState("");
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempSearchInput(e.target.value);
  };

  return (
    <div className="searchBar">
      <input
        className="search-input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
        type="text"
        maxLength={20}
        value={tempSearchInput}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch(tempSearchInput)}
        onChange={handleInputChange}
        placeholder="Search here..."
      />
      <button onClick={() => handleSearch(tempSearchInput)}>&nbsp;🔎&nbsp;</button>
    </div>
  );
}
export default SearchBar;
