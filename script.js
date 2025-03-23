// DOM elements
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const dashboardPage = document.getElementById('dashboard-page');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const incomeForm = document.getElementById('income-form');
const expenseForm = document.getElementById('expense-form');

const loginAlert = document.getElementById('login-alert');
const registerAlert = document.getElementById('register-alert');
const dashboardAlert = document.getElementById('dashboard-alert');

const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const logoutBtn = document.getElementById('logout-btn');
const clearAllBtn = document.getElementById('clear-all');

const welcomeMessage = document.getElementById('welcome-message');
const totalIncomeElement = document.getElementById('total-income');
const totalExpenseElement = document.getElementById('total-expense');
const balanceElement = document.getElementById('balance');
const transactionList = document.getElementById('transaction-list');

// Helper functions
function showPage(page) {
    // Hide all pages
    loginPage.classList.remove('active');
    registerPage.classList.remove('active');
    dashboardPage.classList.remove('active');
    
    // Show the requested page
    page.classList.add('active');
}

function showAlert(alertElement, message, type) {
    alertElement.textContent = message;
    alertElement.className = 'alert alert-' + type;
    alertElement.style.display = 'block';
    
    // Auto-hide alert after 3 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Local storage functions
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUser(username, password) {
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return false;
    }
    
    // Add new user
    const userId = generateId();
    users.push({
        id: userId,
        username: username,
        password: password
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    return userId;
}

function authenticateUser(username, password) {
    const users = getUsers();
    const user = users.find(user => user.username === username);
    
    if (user && user.password === password) {
        return user.id;
    }
    
    return null;
}

function getTransactions(userId) {
    const key = 'transactions_' + userId;
    const transactions = localStorage.getItem(key);
    return transactions ? JSON.parse(transactions) : [];
}

function saveTransaction(userId, transaction) {
    const transactions = getTransactions(userId);
    transaction.id = generateId();
    transactions.push(transaction);
    localStorage.setItem('transactions_' + userId, JSON.stringify(transactions));
}

function clearTransactions(userId) {
    localStorage.setItem('transactions_' + userId, JSON.stringify([]));
}

// Dashboard functions
function updateDashboard() {
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    
    if (!userId) {
        showPage(loginPage);
        return;
    }
    
    // Update welcome message
    welcomeMessage.textContent = 'Welcome, ' + username;
    
    // Get transactions and update display
    const transactions = getTransactions(userId);
    updateTransactionList(transactions);
    updateBudgetSummary(transactions);
}

function updateTransactionList(transactions) {
    // Clear current list
    transactionList.innerHTML = '';
    
    // Add each transaction to the list
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = transaction.type;
        
        const descCell = document.createElement('td');
        descCell.textContent = transaction.description;
        if (transaction.type === 'expense' && transaction.category) {
            descCell.textContent += ' (' + transaction.category + ')';
        }
        
        const amountCell = document.createElement('td');
        amountCell.textContent = '$' + parseFloat(transaction.amount).toFixed(2);
        
        const typeCell = document.createElement('td');
        typeCell.textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        
        row.appendChild(descCell);
        row.appendChild(amountCell);
        row.appendChild(typeCell);
        
        transactionList.appendChild(row);
    });
}

function updateBudgetSummary(transactions) {
    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += parseFloat(transaction.amount);
        } else if (transaction.type === 'expense') {
            totalExpense += parseFloat(transaction.amount);
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    // Update display
    totalIncomeElement.textContent = totalIncome.toFixed(2);
    totalExpenseElement.textContent = totalExpense.toFixed(2);
    balanceElement.textContent = balance.toFixed(2);
    
    // Update balance color
    if (balance >= 0) {
        balanceElement.className = 'positive';
    } else {
        balanceElement.className = 'negative';
    }
}

// Event Listeners
window.addEventListener('load', () => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    
    if (userId) {
        showPage(dashboardPage);
        updateDashboard();
    } else {
        showPage(loginPage);
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const userId = authenticateUser(username, password);
    
    if (userId) {
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('username', username);
        
        showAlert(dashboardAlert, 'Login successful!', 'success');
        showPage(dashboardPage);
        updateDashboard();
        
        // Clear form
        loginForm.reset();
    } else {
        showAlert(loginAlert, 'Invalid credentials!', 'danger');
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    const userId = saveUser(username, password);
    
    if (userId) {
        showAlert(loginAlert, 'Account created! Please login.', 'success');
        showPage(loginPage);
        
        // Clear form
        registerForm.reset();
    } else {
        showAlert(registerAlert, 'Username already exists!', 'danger');
    }
});

incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    const description = document.getElementById('incomeDescription').value;
    const amount = document.getElementById('incomeAmount').value;
    
    if (userId && description && amount) {
        saveTransaction(userId, {
            description: description,
            amount: amount,
            type: 'income'
        });
        
        showAlert(dashboardAlert, 'Income added successfully!', 'success');
        updateDashboard();
        
        // Clear form
        incomeForm.reset();
    }
});

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    const description = document.getElementById('expenseDescription').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = document.getElementById('expenseAmount').value;
    
    if (userId && description && amount) {
        saveTransaction(userId, {
            description: description,
            category: category,
            amount: amount,
            type: 'expense'
        });
        
        showAlert(dashboardAlert, 'Expense added successfully!', 'success');
        updateDashboard();
        
        // Clear form
        expenseForm.reset();
    }
});

clearAllBtn.addEventListener('click', () => {
    const userId = sessionStorage.getItem('userId');
    
    if (userId) {
        clearTransactions(userId);
        showAlert(dashboardAlert, 'All transactions cleared!', 'info');
        updateDashboard();
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    showAlert(loginAlert, 'Logged out successfully!', 'info');
    showPage(loginPage);
});

goToRegister.addEventListener('click', () => {
    showPage(registerPage);
});

goToLogin.addEventListener('click', () => {
    showPage(loginPage);
});