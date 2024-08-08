// components/SelectRows.tsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faTimes, faList } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/SelectRows.module.css';

interface SelectRowsProps {
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  handleDeleteSelectedItems: (items: any[]) => void;
  selectedItemsCount: number;
  items: any[];
}

const SelectRows: React.FC<SelectRowsProps> = (props) => {
  const { isSelectionMode, toggleSelectionMode, handleDeleteSelectedItems, selectedItemsCount, items } = props;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    handleDeleteSelectedItems(items);
  }

  return (
    <div className={styles.selectionActions}>
      <button
        className={isSelectionMode ? styles.cancelButton : styles.selectButton}
        onClick={toggleSelectionMode}
      >
        {isSelectionMode ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faList} />}
        {isSelectionMode ? 'Cancel' : ' Select Rows'}
      </button>
      {isSelectionMode && (
        <button
          className={styles.deleteSelectedButton}
          onClick={handleDeleteClick}
          disabled={selectedItemsCount === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
          Delete Selected
        </button>
      )}
    </div>
  );
};

export default SelectRows;