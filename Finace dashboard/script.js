const roleEl = document.getElementById("role");
const form = document.getElementById("form");
const clearBtn = document.getElementById("clearData");
const themeBtn = document.getElementById("toggleTheme");

let transactions = JSON.parse(localStorage.getItem("data")) || [];

/* Dark Mode Load */
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* Toggle Theme */
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

/* Role */
roleEl.addEventListener("change", () => {
  form.classList.toggle("hidden", roleEl.value !== "admin");
});

/* Clear Data */
clearBtn.onclick = () => {
  if (confirm("Clear all data?")) {
    transactions = [];
    save();
    render();
  }
};

/* Add */
function addTransaction() {
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!amount || !category) {
    alert("Fill all fields");
    return;
  }

  transactions.push({
    date: new Date().toLocaleDateString(),
    amount: Number(amount),
    category,
    type
  });

  save();
  render();
}

/* Delete */
function deleteTransaction(index) {
  if (confirm("Delete this transaction?")) {
    transactions.splice(index, 1);
    save();
    render();
  }
}

/* Edit */
function editTransaction(index) {
  const t = transactions[index];

  const amount = prompt("Edit amount:", t.amount);
  const category = prompt("Edit category:", t.category);

  if (!amount || !category) return;

  transactions[index].amount = Number(amount);
  transactions[index].category = category;

  save();
  render();
}

/* Render */
function render() {
  const list = document.getElementById("transactionList");
  const empty = document.getElementById("empty");

  let search = document.getElementById("search").value.toLowerCase();
  let filter = document.getElementById("filterType").value;

  let filtered = transactions.filter(t =>
    t.category.toLowerCase().includes(search) &&
    (filter === "all" || t.type === filter)
  );

  list.innerHTML = "";

  if (filtered.length === 0) empty.classList.remove("hidden");
  else empty.classList.add("hidden");

  filtered.forEach((t, index) => {
    list.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.category}</td>
        <td>₹${t.amount}</td>
        <td>${t.type}</td>
        <td>
          ${roleEl.value === "admin" ? `
            <button onclick="editTransaction(${index})">✏️</button>
            <button onclick="deleteTransaction(${index})">🗑️</button>
          ` : ""}
        </td>
      </tr>
    `;
  });

  updateSummary();
  updateInsights();
  updateChart();
}

/* Summary */
function updateSummary() {
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.getElementById("income").innerText = "₹" + income;
  document.getElementById("expense").innerText = "₹" + expense;
  document.getElementById("balance").innerText = "₹" + (income - expense);
}

/* Insights */
function updateInsights() {
  const map = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });

  let highest = "";
  let max = 0;

  for (let k in map) {
    if (map[k] > max) {
      max = map[k];
      highest = k;
    }
  }

  document.getElementById("insight").innerText =
    highest ? "Highest Spending: " + highest : "No data";
}

/* Chart */
function updateChart() {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  const map = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
  });

  for (let key in map) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = map[key] / 5 + "px";
    bar.innerText = key;
    chart.appendChild(bar);
  }
}

/* Save */
function save() {
  localStorage.setItem("data", JSON.stringify(transactions));
}

/* Init */
render();