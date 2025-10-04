import React, { useState, useEffect } from "react";
import "./App.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function App() {
  // Load saved expenses and balance from localStorage
  const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const savedBalance = parseFloat(localStorage.getItem("balance")) || 5000;

  const [walletBalance, setWalletBalance] = useState(savedBalance);
  const [expenses, setExpenses] = useState(savedExpenses);

  // Modal state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Income form
  const [incomeAmount, setIncomeAmount] = useState("");

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    price: "",
    category: "food",
    date: new Date().toISOString().split("T")[0],
  });

  // Update localStorage whenever expenses or wallet balance changes
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("balance", walletBalance);
  }, [expenses, walletBalance]);

  // Modal handlers
  const openIncomeModal = () => setIsIncomeModalOpen(true);
  const closeIncomeModal = () => setIsIncomeModalOpen(false);

  const openExpenseModal = () => setIsExpenseModalOpen(true);
  const closeExpenseModal = () => setIsExpenseModalOpen(false);

  // Handle expense form change
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    const key = name === "price" ? "price" : name;
    setExpenseForm({ ...expenseForm, [key]: value });
  };

  // Add Income
  const handleAddIncome = (e) => {
    e.preventDefault();
    const amount = parseFloat(incomeAmount);
    if (!amount || amount <= 0) return;
    setWalletBalance(walletBalance + amount);
    setIncomeAmount("");
    closeIncomeModal();
  };

  // Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.price);
    if (
      !expenseForm.title ||
      !expenseForm.price ||
      isNaN(amount) ||
      amount <= 0
    ) {
      alert("Please enter valid expense details.");
      return;
    }
    if (amount > walletBalance) {
      alert("Expense exceeds wallet balance!");
      return;
    }

    const newExpense = {
      id: Date.now(),
      ...expenseForm,
      price: amount,
    };

    setExpenses([newExpense, ...expenses]);
    setWalletBalance(walletBalance - amount);
    setExpenseForm({
      title: "",
      price: "",
      category: "food",
      date: new Date().toISOString().split("T")[0],
    });
    closeExpenseModal();
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    const expenseToDelete = expenses.find((e) => e.id === id);
    if (expenseToDelete) {
      setWalletBalance(walletBalance + expenseToDelete.price);
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  // Pie Chart data
  const categories = ["food", "entertainment", "travel"];
  const COLORS = ["#a855f7", "#f97316", "#facc15"];

  const chartData = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: expenses
      .filter((e) => e.category === cat)
      .reduce((acc, e) => acc + e.price, 0),
  })).filter(d => d.value > 0);

  return (
    <div className="app-container">
      <h1>Expense Tracker</h1>

      {/* Top row: Wallet & Add buttons */}
      <div className="top-row-grid">
        <div className="card balance-card">
          <h3 className="card-title">
            Wallet Balance: <span className="balance-amount">₹{walletBalance}</span>
          </h3>
          <button type="button" className="btn add-income-btn" onClick={openIncomeModal}>
            + Add Income
          </button>
        </div>

        <div className="card expenses-card">
          <h3 className="card-title">
            Expenses: <span className="expense-amount">₹{expenses.reduce((acc,e)=>acc+e.price,0)}</span>
          </h3>
          <button type="button" className="btn add-expense-btn" onClick={openExpenseModal}>
            + Add Expense
          </button>
        </div>

        <div className="card chart-card">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: "10px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">No expenses to display chart.</div>
          )}
        </div>
      </div>

      {/* Bottom row: Expense List */}
      <div className="bottom-row-grid">
        <div className="card transactions-box">
          <h3 className="section-title">Recent Transactions</h3>
          {expenses.length === 0 ? (
            <p className="no-transactions-text">No transactions!</p>
          ) : (
            <ul className="transaction-list">
              {expenses.map((e) => (
                <li key={e.id} className="transaction-item expense">
                  <div className="tx-details">
                    <span className="tx-title">{e.title} ({e.category})</span>
                    <span className="tx-date">{e.date}</span>
                  </div>
                  <div className="tx-controls">
                    <span className="tx-amount expense-text">-₹{e.price}</span>
                    <button className="delete-btn" onClick={() => handleDeleteExpense(e.id)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Income Modal */}
      {isIncomeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content income-modal">
            <h3 className="modal-header">Add Balance</h3>
            <form onSubmit={handleAddIncome}>
              <div className="modal-form-row">
                <input
                  type="number"
                  name="balance"
                  placeholder="Income Amount"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn modal-add-btn primary">
                  Add Balance
                </button>
                <button type="button" className="btn modal-cancel-btn" onClick={closeIncomeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content expense-modal">
            <h3 className="modal-header">Add Expenses</h3>
            <form onSubmit={handleAddExpense}>
              <div className="modal-form-grid">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={expenseForm.title}
                  onChange={handleExpenseChange}
                  className="modal-input"
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={expenseForm.price}
                  onChange={handleExpenseChange}
                  className="modal-input"
                  required
                />
                <select
                  name="category"
                  value={expenseForm.category}
                  onChange={handleExpenseChange}
                  className="modal-input"
                  required
                >
                  <option value="food">Food</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="travel">Travel</option>
                </select>
                <input
                  type="date"
                  name="date"
                  value={expenseForm.date}
                  onChange={handleExpenseChange}
                  className="modal-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn modal-add-btn expense-primary">
                  Add Expense
                </button>
                <button type="button" className="btn modal-cancel-btn" onClick={closeExpenseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
