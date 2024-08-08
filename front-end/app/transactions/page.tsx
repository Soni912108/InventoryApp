"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/TransactionsPage.module.css';
import { useRouter } from 'next/navigation';
import ModalAddTransaction from '../../components/ModalAddTransaction';
import ModalUpdateTransaction from '../../components/ModalUpdateTransaction';
import Navbar from '../../components/Navbar';
import { SearchInput } from '../../components/SearchInput';
import SelectRows from '../../components/SelectRows';
import Pagination from '../../components/Pagination';


interface Transaction {
  id: number;
  customer: {
    id: number;
    name: string;
  };
  car: {
    id: number;
    model: string;
    brand: string;
    year: number;
  };
  amount: string;
  date: string;
  receipt: string;
  selected?: boolean;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [noTransactionsFound, setNoTransactionsFound] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page
  // State for token
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const handleNavigation = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  const fetchTransactions =  async (authToken: string)  => {
    
    if (!token) {
      setError('You are not authenticated. Please log in.');
      router.push('/login');
      return;
    }
    try {
      const response = await axios.get('http://localhost:8000/crm/api/transactions/', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          page: currentPage,
          page_size: rowsPerPage,
        },
      });

        setTransactions(response.data.transactions);
        setFilteredTransactions(response.data.transactions);
        setTotalTransactions(response.data.total_count);

    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setNoTransactionsFound(false);
          router.push('/login');
        } else if (err.response?.status === 204 && err.response?.data.message === 'No transaction found!') {
          setNoTransactionsFound(true);
        } else {
          console.error('Error fetching transaction:', err);
        }
      } else {
        console.error('Error fetching transaction:', err);
      }
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Access localStorage on client side only
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchTransactions(storedToken); // Fetch transactions after setting the token
    } else {
      setError('You are not authenticated. Please log in.');
      router.push('/login');
    }
  }, [currentPage, rowsPerPage]); 

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction]);
    setFilteredTransactions([...transactions, newTransaction]);
  };

  const handleEditTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(transaction =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
    setFilteredTransactions(transactions.map(transaction =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await axios.delete(`http://localhost:8000/crm/api/delete_transaction/${transactionId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
      setFilteredTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  const handleDeleteSelectedTransactions = async () => {
    if (!confirm('Are you sure you want to delete the selected transactions?')) return;
    try {
      for (const transaction of selectedTransactions) {
        await axios.delete(`http://localhost:8000/crm/api/delete_transaction/${transaction.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setTransactions(transactions.filter((transaction) => !selectedTransactions.includes(transaction)));
      setFilteredTransactions(transactions.filter((transaction) => !selectedTransactions.includes(transaction)));
      setSelectedTransactions([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error('Error deleting transactions', err);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditTransactionModalOpen(true);
  };

  const handleSearch = (searchTerm: string) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    setFilteredTransactions(
      transactions.filter(transaction =>
        transaction.customer.name.toLowerCase().includes(lowercasedSearchTerm) ||
        transaction.car.model.toLowerCase().includes(lowercasedSearchTerm) ||
        transaction.car.brand.toLowerCase().includes(lowercasedSearchTerm) ||
        transaction.car.year.toString().includes(lowercasedSearchTerm) ||
        transaction.amount.toLowerCase().includes(lowercasedSearchTerm) ||
        new Date(transaction.date).toLocaleDateString().includes(lowercasedSearchTerm) ||
        transaction.receipt.toLowerCase().includes(lowercasedSearchTerm)
      )
    );
    setCurrentPage(1);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (transactionId: number) => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? { ...transaction, selected: !transaction.selected }
        : transaction
    );
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);

    const updatedSelectedTransactions = updatedTransactions.filter(transaction => transaction.selected);
    setSelectedTransactions(updatedSelectedTransactions);
  };

  return (
    <div className={styles.container}>
      <title>Transactions</title>
      <Navbar handleNavigation={handleNavigation} />
      <h1 className={styles.title}>Transaction List</h1>
      <div className={styles.actionsContainer}>
        <SelectRows
          isSelectionMode={isSelectionMode}
          toggleSelectionMode={toggleSelectionMode}
          handleDeleteSelectedItems ={handleDeleteSelectedTransactions}
          selectedItemsCount={selectedTransactions.length}
          items={transactions} // Pass the 'transactions' array as the 'items' prop
        />
        </div>
        <div className={styles.leftAlignedContainer}>
          <SearchInput onSearch={handleSearch} />
        </div>
      <button
        className={styles.addTransactionButton}
        onClick={() => setIsAddTransactionModalOpen(true)}
      >
        Add Transaction
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {info && <p style={{ color: 'gray', textAlign: 'center' }}>{info}</p>}
      {noTransactionsFound && !error && !info && (
        <p style={{ color: 'gray', textAlign: 'center' }}>No transactions found.</p>
      )}
      {!noTransactionsFound && !loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              {isSelectionMode && <th>Select</th>}
              <th>Transaction Id</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                {isSelectionMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={transaction.selected || false}
                      onChange={() => handleSelectTransaction(transaction.id)}
                    />
                  </td>
                )}
                <td>{transaction.id}</td>
                <td>{transaction.customer.name}</td>
                <td>
                  {transaction.car.brand} {transaction.car.model} ({transaction.car.year})
                </td>
                <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.receipt}</td>
                <td>
                  <button onClick={() => openEditModal(transaction)} className={`${styles.button} ${styles.edit}`}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className={`${styles.button} ${styles.delete}`}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination
      currentPage={currentPage}
      totalItems={totalTransactions}
      itemsPerPage={rowsPerPage}
      onPageChange={setCurrentPage}
    />
      <ModalAddTransaction
      isOpen={isAddTransactionModalOpen}
      onClose={() => setIsAddTransactionModalOpen(false)}
      onAdd={handleAddTransaction}
    />
      {selectedTransaction && (
        <ModalUpdateTransaction
          isOpen={isEditTransactionModalOpen}
          onClose={() => setIsEditTransactionModalOpen(false)}
          transaction={selectedTransaction}
          onEdit={handleEditTransaction}
        />
      )}
    </div>
  );
}
