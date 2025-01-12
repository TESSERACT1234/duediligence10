import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionProgress = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [transactionsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };
    fetchTransactions();
  }, []);

  // Filter for incomplete transactions
  const incompleteTransactions = transactions.filter(
    (transaction) =>
      !Object.values(transaction.stages).every((stage) => stage === true)
  );

  // Pagination calculation
  const indexOfLastTransaction = (currentPage + 1) * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = incompleteTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Handle checkbox change with confirmation
  const handleCheckboxChange = async (transactionId, stageKey) => {
    const confirmChange = window.confirm(
      "Are you sure you want to mark this stage as completed?"
    );
    if (!confirmChange) {
      return; // Do nothing if user cancels
    }

    // Get current date when the checkbox is checked
    const dateChecked = new Date().toISOString(); // Use ISO format to ensure correct formatting

    try {
      const updatedTransaction = await axios.put(
        `http://localhost:5000/api/transactions/${transactionId}`,
        {
          [`stages.${stageKey}`]: true,
          [`stages.${stageKey}_date`]: dateChecked, // Save the date when stage was marked as completed
        }
      );

      // Update local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === transactionId
            ? updatedTransaction.data
            : transaction
        )
      );

      // Check if all stages are completed
      const transaction = updatedTransaction.data;
      const allStagesCompleted = Object.values(transaction.stages).every(
        (stage) => stage === true
      );

      if (allStagesCompleted) {
        // Show toast and move transaction to completed cycles
        toast.success("Cycle completed! Moving to Completed Cycles.");
        await axios.put(
          `http://localhost:5000/api/move-to-completed/${transaction._id}`
        );
        setTransactions((prev) =>
          prev.filter((t) => t._id !== transactionId) // Remove from current list
        );
      }
    } catch (error) {
      console.error("Failed to update transaction", error);
    }
  };

  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Back
      </button>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Transaction Progress</h2>

        {/* Transaction Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Date</th>
                <th>Stages</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.buyer}</td>
                  <td>{transaction.date}</td>
                  <td>
                    {Object.entries(transaction.stages).map(([stageKey, stageValue]) => (
                      <div key={stageKey}>
                        <label>
                          <input
                            type="checkbox"
                            checked={stageValue}
                            onChange={() =>
                              !stageValue && handleCheckboxChange(transaction._id, stageKey)
                            } // Only allow changes for unchecked stages
                          />
                          {stageKey}
                          {transaction.stages[`${stageKey}_date`] && (
                            <span> (Checked on: {transaction.stages[`${stageKey}_date`]})</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={Math.ceil(incompleteTransactions.length / transactionsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          disabledClassName={"disabled"}
        />

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default TransactionProgress;
