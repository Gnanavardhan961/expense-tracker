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
  
  // NEW STATE: Separate state for two modals
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // State for Income form (only amount)
  const [incomeAmount, setIncomeAmount] = useState("");
  
  // State for Expense form (all fields)
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
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

  // Open/Close functions for the specific modals
  const openIncomeModal = () => setIsIncomeModalOpen(true);
  const closeIncomeModal = () => setIsIncomeModalOpen(false);
  const openExpenseModal = () => setIsExpenseModalOpen(true);
  const closeExpenseModal = () => setIsExpenseModalOpen(false);

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm({ ...expenseForm, [name]: value });
  };

  // Function to add a new income transaction
  const addIncome = () => {
    if (!incomeAmount) return;
    const newTx = {
      id: Date.now(),
      title: "Income",
      amount: parseFloat(incomeAmount),
      type: "income",
      category: "salary",
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions([newTx, ...transactions]);
    setIncomeAmount(""); // Clear input
    closeIncomeModal();
  };

  // Function to add a new expense transaction
  const addExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) return;
    const newTx = {
      id: Date.now(),
      title: expenseForm.title,
      amount: parseFloat(expenseForm.amount),
      type: "expense",
      category: expenseForm.category,
      date: expenseForm.date,
    };
    setTransactions([newTx, ...transactions]);
    setExpenseForm({ // Reset form
      title: "",
      amount: "",
      category: "food",
      date: new Date().toISOString().split("T")[0],
    });
    closeExpenseModal();
  };

  const deleteTransaction = (id) =>
    setTransactions(transactions.filter((tx) => tx.id !== id));

  // Data for chart and top expenses (only expense categories shown in design)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const chartData = [
    { name: "Food", value: expenseTransactions.filter((t) => t.category === "food").reduce((a, b) => a + b.amount, 0) },
    { name: "Entertainment", value: expenseTransactions.filter((t) => t.category === "entertainment").reduce((a, b) => a + b.amount, 0) },
    { name: "Travel", value: expenseTransactions.filter((t) => t.category === "travel").reduce((a, b) => a + b.amount, 0) },
  ];
  
  // Filter out categories with zero expense for the chart
  const nonZeroChartData = chartData.filter(data => data.value > 0);

  const COLORS = ["#a855f7", "#f97316", "#facc15"];

  return (
    <div className="app-container">
      <h1 className="main-title">Expense Tracker</h1>

      {/* Top Row: Wallet, Expenses, Chart */}
      <div className="top-row-grid">
        <div className="card balance-card">
          <h3 className="card-title">Wallet Balance: <span className="balance-amount">₹{balance}</span></h3>
          <button className="btn add-income-btn" onClick={openIncomeModal}>+ Add Income</button>
        </div>
        
        <div className="card expenses-card">
          <h3 className="card-title">Expenses: <span className="expense-amount">₹{expenseTotal}</span></h3>
          <button className="btn add-expense-btn" onClick={openExpenseModal}>+ Add Expense</button>
        </div>
        
        <div className="card chart-card">
          {nonZeroChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={nonZeroChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {nonZeroChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">No expenses to display chart.</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Transactions and Top Expenses */}
      <div className="bottom-row-grid">
        <div className="card transactions-box">
          <h3 className="section-title">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="no-transactions-text">No transactions!</p>
          ) : (
            <ul className="transaction-list">
              {transactions.slice(0, 5).map((tx) => ( // Show only the top 5
                <li key={tx.id} className={`transaction-item ${tx.type}`}>
                  <div className="tx-details">
                    <span className="tx-title">{tx.title}</span>
                    <span className="tx-date">{tx.date}</span>
                  </div>
                  <div className="tx-controls">
                    <span className={`tx-amount ${tx.type === "income" ? "income-text" : "expense-text"}`}>
                      {tx.type === "income" ? "+₹" : "-₹"}{tx.amount}
                    </span>
                    <button className="edit-btn">✏️</button> 
                    <button className="delete-btn" onClick={() => deleteTransaction(tx.id)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card top-expenses-box">
          <h3 className="section-title">Top Expenses</h3>
          <ul className="top-expenses-list">
            {chartData.map((data, index) => (
              <li key={data.name}>
                <div className="category-label">{data.name}</div>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar" 
                        style={{ 
                            width: `${(data.value / expenseTotal) * 100 || 0}%`, 
                            backgroundColor: COLORS[index] 
                        }}
                    ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* -------------------- Modals -------------------- */}

      {/* Add Income Modal (Image of Add Balance Modal) */}
      {isIncomeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content income-modal">
            <h3 className="modal-header">Add Balance</h3>
            <div className="modal-form-row">
              <input 
                type="number" 
                name="amount" 
                placeholder="Income Amount" 
                value={incomeAmount} 
                onChange={(e) => setIncomeAmount(e.target.value)} 
                className="modal-input"
              />
            </div>
            <div className="modal-actions">
              <button className="btn modal-add-btn primary" onClick={addIncome}>Add Balance</button>
              <button className="btn modal-cancel-btn" onClick={closeIncomeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Expense Modal (Image of Add Expenses Modal) */}
      {isExpenseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content expense-modal">
            <h3 className="modal-header">Add Expenses</h3>
            <div className="modal-form-grid">
              <input 
                type="text" 
                name="title" 
                placeholder="Title" 
                value={expenseForm.title} 
                onChange={handleExpenseChange} 
                className="modal-input"
              />
              <input 
                type="number" 
                name="amount" 
                placeholder="Price" 
                value={expenseForm.amount} 
                onChange={handleExpenseChange} 
                className="modal-input"
              />
              <select 
                name="category" 
                value={expenseForm.category} 
                onChange={handleExpenseChange} 
                className="modal-input"
              >
                <option value="food">Select category</option>
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
              />
            </div>
            <div className="modal-actions">
              <button className="btn modal-add-btn expense-primary" onClick={addExpense}>Add Expense</button>
              <button className="btn modal-cancel-btn" onClick={closeExpenseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;