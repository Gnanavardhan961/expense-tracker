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
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [balance, setBalance] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "food",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    setBalance(income - expense);
    setExpenseTotal(expense);
  }, [transactions]);

  const openModal = (type) => {
    setForm({
      title: "",
      amount: "",
      type,
      category: type === "income" ? "salary" : "food",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addTransaction = () => {
    if (!form.title || !form.amount) return;
    const newTx = {
      id: Date.now(),
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
    };
    setTransactions([newTx, ...transactions]);
    closeModal();
  };

  const deleteTransaction = (id) =>
    setTransactions(transactions.filter((tx) => tx.id !== id));

  const chartData = [
    { name: "Food", value: transactions.filter((t) => t.category === "food").reduce((a, b) => a + b.amount, 0) },
    { name: "Entertainment", value: transactions.filter((t) => t.category === "entertainment").reduce((a, b) => a + b.amount, 0) },
    { name: "Travel", value: transactions.filter((t) => t.category === "travel").reduce((a, b) => a + b.amount, 0) },
  ];

  const COLORS = ["#a855f7", "#f97316", "#facc15"];

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      {/* Top Row */}
      <div className="top-row">
        <div className="card">
          <h3>Wallet Balance: <span className="green">₹{balance}</span></h3>
          <button className="btn green" onClick={() => openModal("income")}>+ Add Income</button>
        </div>
        <div className="card">
          <h3>Expenses: <span className="orange">₹{expenseTotal}</span></h3>
          <button className="btn red" onClick={() => openModal("expense")}>+ Add Expense</button>
        </div>
        <div className="card chart-card">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={50}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-row">
        <div className="transactions-box">
          <h3><i>Recent Transactions</i></h3>
          {transactions.length === 0 ? (
            <p>No transactions!</p>
          ) : (
            <ul>
              {transactions.map((tx) => (
                <li key={tx.id}>
                  {tx.title} - {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                  <button onClick={() => deleteTransaction(tx.id)}>❌</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="top-expenses">
          <h3><i>Top Expenses</i></h3>
          <p>Food - ₹{chartData[0].value}</p>
          <p>Entertainment - ₹{chartData[1].value}</p>
          <p>Travel - ₹{chartData[2].value}</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add {form.type === "income" ? "Income" : "Expense"}</h3>
            <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} />
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="food">Food</option>
              <option value="entertainment">Entertainment</option>
              <option value="travel">Travel</option>
              <option value="salary">Salary</option>
              <option value="other">Other</option>
            </select>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
            <div>
              <button className="btn" onClick={closeModal}>Cancel</button>
              <button className="btn primary" onClick={addTransaction}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
