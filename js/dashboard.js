const apiKey = "gen-lang-client-0709470700"; // Provided at runtime
const CATEGORIES_CONFIG = {
  Accommodation: { color: "bg-indigo-600" },
  "Food & Groceries": { color: "bg-amber-500" },
  Transportation: { color: "bg-emerald-500" },
  "Utilities & Internet": { color: "bg-cyan-500" },
  Personal: { color: "bg-rose-500" },
  "Tuition Fees": { color: "bg-purple-600" },
};

let monthlyBudget = 150;
let expenses = [
  { id: 1, desc: "School Fee", amount: 30, category: "Tuition Fees", date: "2026-01-01" },
  { id: 2, desc: "បាយស្រូប", amount: 1, category: "Food & Groceries", date: "2026-03-03" },
  { id: 3, desc: "សាំង", amount: 2.5, category: "Transportation", date: "2026-03-07" },
  { id: 4, desc: "Invest In Gold", amount: 100, category: "Personal", date: "2026-03-07" },
];

let myChart;
let deleteId = null;

function handleLogout() {
  const logoutMsg = document.createElement("div");
  logoutMsg.className =
    "fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] scale-in";
  logoutMsg.innerText = "Logging out...";
  document.body.appendChild(logoutMsg);

  // Corrected navigation logic
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

function toggleModal() {
  document.getElementById("modal").classList.toggle("hidden");
  document.getElementById("aiErrorMessage").classList.add("hidden");
}
function toggleBudgetModal() {
  document.getElementById("budgetModal").classList.toggle("hidden");
}
function openDeleteModal(id) {
  deleteId = id;
  document.getElementById("deleteModal").classList.remove("hidden");
}
function closeDeleteModal() {
  deleteId = null;
  document.getElementById("deleteModal").classList.add("hidden");
}

function confirmDelete() {
  if (deleteId) {
    expenses = expenses.filter((e) => e.id !== deleteId);
    init();
    closeDeleteModal();
  }
}

function openAddModal() {
  document.getElementById("modalTitle").innerText = "New Expense";
  document.getElementById("saveButton").innerText = "Save Transaction";
  document.getElementById("aiScanContainer").classList.remove("hidden");
  document.getElementById("editId").value = "";
  document.getElementById("expenseForm").reset();
  toggleModal();
}

function openEditModal(id) {
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;
  document.getElementById("modalTitle").innerText = "Edit Transaction";
  document.getElementById("saveButton").innerText = "Update Transaction";
  document.getElementById("aiScanContainer").classList.add("hidden");
  document.getElementById("editId").value = id;
  document.getElementById("desc").value = expense.desc;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("category").value = expense.category;
  toggleModal();
}

function updateStats() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = monthlyBudget - total;
  document.getElementById("monthlyBudgetText").innerText = `$${monthlyBudget.toLocaleString()}`;
  document.getElementById("totalSpentText").innerText = `$${total.toLocaleString()}`;
  document.getElementById("remainingBudgetText").innerText = `Remaining: $${remaining.toLocaleString()}`;
  const cats = {};
  expenses.forEach((e) => (cats[e.category] = (cats[e.category] || 0) + e.amount));
  const sorted = Object.keys(cats).sort((a, b) => cats[b] - cats[a]);
  document.getElementById("topCategoryText").innerText = sorted[0] || "None";
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  list.innerHTML = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (item) => `
            <tr class="hover:bg-slate-50/50 transition-all group">
              <td class="py-4 font-semibold text-slate-800">${item.desc}</td>
              <td class="py-4"><span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">${item.category}</span></td>
              <td class="py-4 text-slate-400 text-sm">${new Date(item.date).toLocaleDateString()}</td>
              <td class="py-4 text-right font-bold text-rose-600">-$${item.amount.toFixed(2)}</td>
              <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button onclick="openEditModal(${item.id})" class="text-slate-400 hover:text-indigo-600 p-2 transition-colors"><i class="fas fa-edit"></i></button>
                  <button onclick="openDeleteModal(${item.id})" class="text-slate-400 hover:text-rose-600 p-2 transition-colors"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
          `,
    )
    .join("");
}

function renderCategoryBreakdown() {
  const container = document.getElementById("categoryBreakdown");
  const totals = {};
  Object.keys(CATEGORIES_CONFIG).forEach((c) => (totals[c] = 0));
  expenses.forEach((e) => {
    if (totals.hasOwnProperty(e.category)) totals[e.category] += e.amount;
  });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  container.innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => {
      const perc = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(0) : 0;
      return `<div><div class="flex justify-between items-center mb-1"><span class="text-xs font-semibold text-slate-600">${name}</span><span class="text-xs font-bold text-slate-900">$${total.toLocaleString()}</span></div><div class="w-full bg-slate-100 h-1.5 rounded-full"><div class="${CATEGORIES_CONFIG[name]?.color || "bg-slate-400"} h-full" style="width: ${perc}%"></div></div></div>`;
    })
    .join("");
}

function initChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const dataMap = {};
  expenses.forEach((e) => {
    dataMap[e.date] = (dataMap[e.date] || 0) + e.amount;
  });
  const labels = Object.keys(dataMap).sort();
  if (myChart) myChart.destroy();
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels.map((l) => new Date(l).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
      datasets: [
        {
          data: labels.map((l) => dataMap[l]),
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.05)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
    },
  });
}

async function apiCallWithRetry(url, options, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function handleAIScan(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const loader = document.getElementById("aiLoader");
  const errorMsg = document.getElementById("aiErrorMessage");

  loader.classList.remove("hidden");
  errorMsg.classList.add("hidden");

  try {
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    const base64Data = await base64Promise;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this receipt. Return ONLY a valid JSON object with EXACTLY these keys: "amount" (number), "description" (string), "category" (string). The category MUST be exactly one of: ${Object.keys(CATEGORIES_CONFIG).join(", ")}.`,
            },
            { inlineData: { mimeType: file.type, data: base64Data } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            amount: { type: "NUMBER" },
            description: { type: "STRING" },
            category: { type: "STRING" },
          },
        },
      },
    };

    // Change this line inside the handleAIScan function:
    const result = await apiCallWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("AI returned empty content");

    const data = JSON.parse(text);

    if (data.description) document.getElementById("desc").value = data.description;
    if (data.amount) document.getElementById("amount").value = data.amount;
    if (CATEGORIES_CONFIG[data.category]) {
      document.getElementById("category").value = data.category;
    }
  } catch (err) {
    console.error("AI Scan Error:", err);
    errorMsg.innerText =
      "Scanning failed. The AI was unable to parse this receipt. Please try another photo or enter manually.";
    errorMsg.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
    input.value = "";
  }
}

function init() {
  updateStats();
  renderTransactions();
  renderCategoryBreakdown();
  initChart();
}

window.onload = function () {
  init();
  document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);

  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const editId = document.getElementById("editId").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const desc = document.getElementById("desc").value;
    const cat = document.getElementById("category").value;

    if (editId) {
      const idx = expenses.findIndex((x) => x.id == editId);
      if (idx !== -1) expenses[idx] = { ...expenses[idx], amount, desc, category: cat };
    } else {
      expenses.push({
        id: Date.now(),
        desc,
        amount,
        category: cat,
        date: new Date().toISOString().split("T")[0],
      });
    }
    init();
    toggleModal();
  });

  document.getElementById("budgetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    monthlyBudget = parseFloat(document.getElementById("newBudgetAmount").value);
    init();
    toggleBudgetModal();
  });
};

async function handleAIScan(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const loader = document.getElementById("aiLoader");
  const errorMsg = document.getElementById("aiErrorMessage");

  loader.classList.remove("hidden");
  errorMsg.classList.add("hidden");

  try {
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    const base64Data = await base64Promise;

    // Use gemini-1.5-flash for broader stability and faster processing
    const modelId = "gemini-1.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this receipt image. 
              1. Identify the total amount (as a number).
              2. Create a short description.
              3. Choose the best category from: ${Object.keys(CATEGORIES_CONFIG).join(", ")}.
              
              Return ONLY a JSON object. No markdown, no explanation.
              Format: {"amount": number, "description": "string", "category": "string"}`,
            },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const result = await apiCallWithRetry(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check for valid candidates in the response
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("The AI could not read the receipt. Please try a clearer photo.");
    }

    // Clean JSON: Remove markdown backticks if present
    const cleanJson = candidateText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const data = JSON.parse(cleanJson);

    // Update UI fields
    if (data.description) document.getElementById("desc").value = data.description;
    if (data.amount) document.getElementById("amount").value = data.amount;

    // Category matching logic
    if (data.category && CATEGORIES_CONFIG[data.category]) {
      document.getElementById("category").value = data.category;
    } else if (data.category) {
      const matchedCat = Object.keys(CATEGORIES_CONFIG).find(
        (cat) => cat.toLowerCase() === data.category.toLowerCase(),
      );
      if (matchedCat) document.getElementById("category").value = matchedCat;
    }
  } catch (err) {
    console.error("AI Scan Error:", err);
    // User-friendly error display
    errorMsg.innerText = `Scan failed: ${err.message}. Please check your internet or enter manually.`;
    errorMsg.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
    input.value = "";
  }
}
