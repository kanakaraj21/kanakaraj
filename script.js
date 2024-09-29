const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const incomeAmount = document.getElementById("income-amount");
const expenseAmount = document.getElementById("expense-amount");
const notification = document.getElementById("notification");
const expenseTableBody = document.querySelector("#expense-table tbody");
const expenseChartCtx = document.getElementById("expense-chart")?.getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Function to update local storage
function updateLocaleStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Function to show notifications
function showNotification(message) {
  notification.innerText = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Function to generate unique IDs for transactions
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Function to add transactions
function addTransaction(e) {
  e.preventDefault();

  const description = text.value.trim();
  const incomeValue = +incomeAmount.value;
  const expenseValue = -Math.abs(+expenseAmount.value); // Make expense a negative value

  if (description === "" || (incomeValue === 0 && expenseValue === 0)) {
    showNotification("Please enter a valid description and amount.");
    return;
  }

  if (incomeValue > 0) {
    transactions.push({
      id: generateID(),
      text: description,
      amount: incomeValue,
    });
  }

  if (expenseValue < 0) {
    transactions.push({
      id: generateID(),
      text: description,
      amount: expenseValue,
    });
  }

  addTransactionDOM(incomeValue > 0 ? { text: description, amount: incomeValue } : { text: description, amount: expenseValue });
  if (expenseTableBody) {
    addTransactionTable(incomeValue > 0 ? { text: description, amount: incomeValue } : { text: description, amount: expenseValue });
  }

  updateValues();
  if (expenseChartCtx) {
    updateChart();
  }
  updateLocaleStorage();

  // Clear input fields
  text.value = "";
  incomeAmount.value = "";
  expenseAmount.value = "";
}

// Function to add transaction to the DOM
function addTransactionDOM(transaction) {
  if (!list) return;

  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(sign === "+" ? "plus" : "minus");
  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa fa-times"></i></button>
  `;
  list.appendChild(item);
}

// Function to add transaction to the table
function addTransactionTable(transaction) {
  if (transaction.amount < 0 && expenseTableBody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaction.text}</td>
      <td>RS${Math.abs(transaction.amount).toFixed(2)}</td>
    `;
    expenseTableBody.appendChild(row);
  }
}

// Function to update balance, income, and expense values
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((accumulator, value) => (accumulator += value), 0).toFixed(2);
  const income = amounts.filter(value => value > 0).reduce((accumulator, value) => (accumulator += value), 0).toFixed(2);
  const expense = (-amounts.filter(value => value < 0).reduce((accumulator, value) => (accumulator += value), 0)).toFixed(2);

  if (balance) balance.innerText = `RS ${total}`;
  if (moneyPlus) moneyPlus.innerText = `RS ${income}`;
  if (moneyMinus) moneyMinus.innerText = `RS ${expense}`;
}

// Function to remove a transaction
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocaleStorage();
  init();
}

// Pie Chart Setup
let expenseChart;
function updateChart() {
  if (!expenseChartCtx) return;

  const expenseMap = transactions.filter(transaction => transaction.amount < 0).reduce((acc, transaction) => {
    acc[transaction.text] = (acc[transaction.text] || 0) + Math.abs(transaction.amount);
    return acc;
  }, {});

  const labels = Object.keys(expenseMap);
  const values = Object.values(expenseMap);

  if (values.length === 0) return;

  const backgroundColors = values.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(expenseChartCtx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{ label: "Expenses", data: values, backgroundColor: backgroundColors }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.label}: RS${tooltipItem.raw.toFixed(2)}`,
          },
        },
      },
    },
  });
}

// Init function to load transactions on page load
function init() {
  if (list) list.innerHTML = "";
  if (expenseTableBody) expenseTableBody.innerHTML = "";

  transactions.forEach(transaction => {
    addTransactionDOM(transaction);
    if (expenseTableBody) {
      addTransactionTable(transaction);
    }
  });

  updateValues();
  if (expenseChartCtx) {
    updateChart();
  }
}

init();

if (form) {
  form.addEventListener("submit", addTransaction);
}
