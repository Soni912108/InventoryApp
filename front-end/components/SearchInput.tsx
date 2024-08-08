// components/SearchInput.tsx

import { useState, ChangeEvent } from 'react';
import styles from '../styles/SearchInput.module.css';

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
}

export const SearchInput = ({ onSearch }: SearchInputProps) => {
  const [inputValue, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setValue(inputValue);
    onSearch(inputValue);
  };

  const handleKeyPress = (event: { key: string }) => {
    if (event.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <div className={styles.searchInputContainer}>
      <label htmlFor="inputId" className={styles.searchIcon}>🔍</label>
      <input
        type="text"
        id="inputId"
        placeholder="Enter your keywords"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        className={styles.searchInput}
      />
    </div>
  );
};
