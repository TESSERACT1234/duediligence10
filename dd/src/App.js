import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransactionProgress from './TransactionProgress';
import CyclesCompleted from './CyclesCompleted';
import TransactionDetails from './TransactionDetails';
import './styles.css';  // Ensure the CSS file is imported
import Navbar from './Navbar'
import Footer from './Footer'

const App = () => {
  return (
    <div>
      <Navbar />
      <Router>
        <div>
          <h1>Due Diligence Software</h1>
          <Routes>
            <Route path="/" element={<TransactionForm />} />
            <Route path="/progress" element={<TransactionProgress />} />
            <Route path="/cycles" element={<CyclesCompleted />} />
            <Route path="/transaction/:id" element={<TransactionDetails />} />
          </Routes>
        </div>
      </Router>
      <Footer/>
    </div>
  );
};

export default App;
