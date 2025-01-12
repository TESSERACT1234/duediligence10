import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2"; // Import Pie chart component
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import necessary chart.js components

ChartJS.register(ArcElement, Tooltip, Legend);

const CyclesCompleted = () => {
  const [completedTransactions, setCompletedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const transactionsPerPage = 5;
  const navigate = useNavigate();

  const totalTenderVolume = 30000000; // Total tender volume in KL (30,000 KL)

  useEffect(() => {
    const fetchCompletedTransactions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/completed-transactions");

        // Sort transactions by date (latest first)
        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setCompletedTransactions(sortedTransactions);
      } catch (error) {
        console.error("Error fetching completed transactions:", error);
      }
    };

    fetchCompletedTransactions();
  }, []);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = completedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(completedTransactions.length / transactionsPerPage);

  const viewDetails = async (transactionId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/${transactionId}`);
      setSelectedTransaction(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const calculateVolumeAndCostByBuyer = () => {
    const volumeByBuyer = {};
    const costByBuyer = {};

    completedTransactions.forEach((transaction) => {
      const { buyer, volume, cost } = transaction;
      if (volumeByBuyer[buyer]) {
        volumeByBuyer[buyer] += volume;
        costByBuyer[buyer] += cost;
      } else {
        volumeByBuyer[buyer] = volume;
        costByBuyer[buyer] = cost;
      }
    });

    const totalVolume = Object.values(volumeByBuyer).reduce((acc, volume) => acc + volume, 0);
    const totalCost = Object.values(costByBuyer).reduce((acc, cost) => acc + cost, 0);

    return { volumeByBuyer, costByBuyer, totalVolume, totalCost };
  };

  const { volumeByBuyer, costByBuyer, totalVolume, totalCost } = calculateVolumeAndCostByBuyer();

  const convertVolumeToKL = (volumeInLiters) => (volumeInLiters / 1000).toFixed(2);
  const convertCostToCrores = (costInINR) => (costInINR / 10000000).toFixed(2);

  // Data for Pie Chart
  const pieChartData = {
    labels: ["Completed Volume", "Remaining Volume (Tender)"],
    datasets: [
      {
        data: [totalVolume, totalTenderVolume - totalVolume], // Volume left from tender
        backgroundColor: ["#36A2EB", "#FF6384"], // Colors for the chart
      },
    ],
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Back
      </button>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Completed Cycles</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="3">No completed transactions available.</td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.buyer}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <button
                        onClick={() => viewDetails(transaction._id)}
                        style={{
                          padding: "5px 10px",
                          cursor: "pointer",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "3px",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination" style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "5px" }}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: "5px 10px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => paginate(pageNumber)}
              style={{
                padding: "5px 10px",
                fontWeight: currentPage === pageNumber ? "bold" : "normal",
                backgroundColor: currentPage === pageNumber ? "#007bff" : "#fff",
                color: currentPage === pageNumber ? "#fff" : "#000",
                border: "1px solid #ddd",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: "5px 10px", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>

        {/* Volume and Cost by Buyer Table */}
        <div style={{ marginTop: "20px" }}>
          <h3>Volume and Cost by Buyer</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Buyer</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Total Volume (KL)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Total Cost (Crores)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(volumeByBuyer).map(([buyer, volume]) => (
                <tr key={buyer}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{buyer}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {convertVolumeToKL(volume)}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {convertCostToCrores(costByBuyer[buyer])}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>Total Volume</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>
                  {convertVolumeToKL(totalVolume)}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>
                  {convertCostToCrores(totalCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pie Chart for Volume Comparison */}
        <div style={{ marginTop: "20px", width: "250px", margin: "0 auto" }}>
          <h3>Completed Volume vs. Total Tender Volume</h3>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>

        {/* Modal for Transaction Details */}
        {isModalOpen && selectedTransaction && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>Transaction Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <tbody>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Buyer</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.buyer}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Volume</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.volume}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Cost</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.cost}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>City</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.city}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Date</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.date}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ddd" }}>Feedstock</th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedTransaction.feedstock}</td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ marginTop: "20px" }}>Stages</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Stage</th>
                  <th style={{ padding: "8px", border: "1px solid #ddd" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(selectedTransaction.stages).map(([stage, status]) => (
                  <tr key={stage}>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>{stage}</td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {status ? "✅ Completed" : "❌ Not Completed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                marginTop: "20px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}

        {isModalOpen && (
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default CyclesCompleted;
