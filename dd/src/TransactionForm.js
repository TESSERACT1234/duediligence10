import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const TransactionForm = () => {
  const [buyer, setBuyer] = useState('');
  const [volume, setVolume] = useState('');
  const [cost, setCost] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [feedstock, setFeedstock] = useState('');
  const navigate = useNavigate();

  const notifySuccess = () => toast.success("Transaction submitted successfully!");
  const notifyError = () => toast.error("Failed to submit transaction. Please try again.");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTransaction = {
      buyer,
      volume,
      cost,
      city,
      date,
      feedstock,
      stages: {
        b100Dispatched: false,
        b100Supplied: false,
        receivingCopyReceived: false,
        rcUploadedToBuyer: false,
        rcUploadedToBank: false,
        amountReceivedFromBank: false,
        bankReceivedFromBuyer: false
      }
    };

    try {
      await axios.post('http://localhost:5000/api/transactions', newTransaction);
      notifySuccess(); // Show success notification
      // Reset form fields
      setBuyer('');
      setVolume('');
      setCost('');
      setCity('');
      setDate('');
      setFeedstock('');
    } catch (error) {
      console.error('Error creating transaction:', error);
      notifyError(); // Show error notification
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <h2>Transaction Form</h2>
        <input
          type="text"
          placeholder="Buyer"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Feedstock"
          value={feedstock}
          onChange={(e) => setFeedstock(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
        <ToastContainer />
      </form>

      <div style={{margin:"20px"}}>
      <center>
      <button style={{marginRight:"15px"}} onClick={() => navigate('/progress')}>Transaction in Progress</button>
      <button onClick={() => navigate('/cycles')}>Completed Cycles</button>
      </center>
      </div>
      
    </div>
  );
};

export default TransactionForm;
