//pagination component to call in other pages.

import React from 'react';
import styles from '../styles/Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  return (
    <div className={styles.paginationContainer}>
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          className={styles.paginationButton}
          onClick={() => onPageChange(page)}
          style={{
            backgroundColor: page === currentPage ? '#007bff' : '',
            color: page === currentPage ? '#ffffff' : '',
          }}
        >
          {page}
        </button>
      ))}
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
