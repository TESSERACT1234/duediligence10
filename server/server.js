const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/due-diligence", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use(authRoutes);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  buyer: String,
  volume: Number,
  cost: Number,
  city: String,
  date: String,
  feedstock: String,
  stages: {
    b100Dispatched: { type: Boolean, default: false },
    b100DispatchedDate: { type: Date, default: null }, // Date field added for each stage
    b100Supplied: { type: Boolean, default: false },
    b100SuppliedDate: { type: Date, default: null },
    receivingCopyReceived: { type: Boolean, default: false },
    receivingCopyReceivedDate: { type: Date, default: null },
    rcUploadedToBuyer: { type: Boolean, default: false },
    rcUploadedToBuyerDate: { type: Date, default: null },
    rcUploadedToBank: { type: Boolean, default: false },
    rcUploadedToBankDate: { type: Date, default: null },
    amountReceivedFromBank: { type: Boolean, default: false },
    amountReceivedFromBankDate: { type: Date, default: null },
    bankReceivedFromBuyer: { type: Boolean, default: false },
    bankReceivedFromBuyerDate: { type: Date, default: null },
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Routes

// Create a new transaction
app.post("/api/transactions", async (req, res) => {
  const newTransaction = new Transaction(req.body);
  try {
    await newTransaction.save();
    res.status(201).send(newTransaction);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get transaction by ID
app.get("/api/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update transaction stages (partial update)
app.put("/api/transactions/:id", async (req, res) => {
  const { stageKey } = req.body; // Expecting the stageKey (e.g., "b100Dispatched") from the frontend
  const updateData = {};

  if (stageKey) {
    updateData[`stages.${stageKey}`] = true; // Mark the stage as completed
    updateData[`stages.${stageKey}Date`] = new Date(); // Save the current date
  }

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get completed transactions
app.get("/api/completed-transactions", async (req, res) => {
  try {
    const completedTransactions = await Transaction.find({
      "stages.b100Dispatched": true,
      "stages.b100Supplied": true,
      "stages.receivingCopyReceived": true,
      "stages.rcUploadedToBuyer": true,
      "stages.rcUploadedToBank": true,
      "stages.amountReceivedFromBank": true,
      "stages.bankReceivedFromBuyer": true,
    });
    res.json(completedTransactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
