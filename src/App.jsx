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
  const [balance, setBalance] = useState(5000);
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, title: "Groceries", amount: 120, type: "expense", date: "2025-10-01" },
          { id: 2, title: "Salary", amount: 2000, type: "income", date: "2025-10-03" },
        ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense" });

  // Persist transactions in localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    const total = transactions.reduce((acc, t) => (t.type === "income" ? acc + t.amount : acc - t.amount), 0);
    setBalance(total);
  }, [transactions]);

  const openModal = (type) => {
    setForm({ title: "", amount: "", type });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTransaction = () => {
    if (!form.title || !form.amount) return;

    const newTx = {
      id: Date.now(),
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions([newTx, ...transactions]);
    closeModal();
  };

  const deleteTransaction = (id) => setTransactions(transactions.filter((tx) => tx.id !== id));

  const chartData = [
    {
      name: "Income",
      value: transactions.filter((tx) => tx.type === "income").reduce((acc, tx) => acc + tx.amount, 0),
    },
    {
      name: "Expense",
      value: transactions.filter((tx) => tx.type === "expense").reduce((acc, tx) => acc + tx.amount, 0),
    },
  ];

  const COLORS = ["#0ea5e9", "#ef4444"];

  return (
    <div className="container">
      <h1>💰 Expense Tracker</h1>

      {/* Top row */}
      <div className="top-row">
        {/* Wallet Card */}
        <div className="wallet-card">
          <h3>Wallet Balance</h3>
          <div className="wallet-amount">₹{balance.toLocaleString()}</div>
          <div className="wallet-actions">
            <button className="btn primary" onClick={() => openModal("income")}>
              + Add Income
            </button>
            <button className="btn primary" onClick={() => openModal("expense")}>
              + Add Expense
            </button>
          </div>
        </div>

        {/* Chart Card */}
        <div className="charts-card">
          <h3>Income vs Expense</h3>
          <div className="chart-wrapper">
            {chartData[0].value === 0 && chartData[1].value === 0 ? (
              <div className="no-data">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions">
        <h3>Transactions</h3>
        <ul className="tx-list">
          {transactions.map((tx) => (
            <li key={tx.id} className="tx-item">
              <div className="tx-left">
                <span className="tx-title">{tx.title}</span>
                <span className="tx-meta">{tx.date}</span>
              </div>
              <div className="tx-right">
                <span className="tx-amount" style={{ color: tx.type === "income" ? "green" : "red" }}>
                  {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                </span>
                <button className="icon-btn" onClick={() => deleteTransaction(tx.id)}>
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add {form.type === "income" ? "Income" : "Expense"}</h3>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Enter amount" />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn primary" onClick={addTransaction}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
