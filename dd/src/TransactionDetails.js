import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TransactionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
                setTransaction(response.data);
            } catch (error) {
                console.error('Failed to fetch transaction details:', error);
            }
        };
        fetchTransaction();
    }, [id]);

    const handleStageChange = async (stage) => {
        const updatedStages = { ...transaction.stages, [stage]: !transaction.stages[stage] };
        await axios.put(`http://localhost:5000/api/transactions/${id}`, { stages: updatedStages });
        setTransaction({ ...transaction, stages: updatedStages });
    };

    if (!transaction) return <p>Loading...</p>;

    return (
        <div>
            <button onClick={() => navigate(-1)} style={{ marginTop: "20px", padding: "10px 20px" }}>
                Back
            </button>
            <h2>Transaction Details</h2>
            <p>Buyer: {transaction.buyer}</p>
            <p>Volume: {transaction.volume}L</p>
            <p>Cost: ${transaction.cost}</p>
            <p>City: {transaction.city}</p>
            <p>Feedstock: {transaction.feedstock}</p>
            <h3>Stages</h3>
            {Object.keys(transaction.stages).map((stage) => (
                <div key={stage}>
                    <label>
                        <input
                            type="checkbox"
                            checked={transaction.stages[stage]}
                            onChange={() => handleStageChange(stage)}
                        />
                        {stage.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </label>
                </div>
            ))}
            <button onClick={() => navigate("/progress")}>Back to Progress</button>
        </div>
    );
};

export default TransactionDetails;
