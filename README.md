# 💰 Expense Tracker

A professional web-based **Expense Tracker Application** built with **Python, Flask, SQLAlchemy, Bootstrap, and PostgreSQL**. The application helps users manage expenses, track budgets, analyze spending patterns, and export reports.


  ------                       
    upgrade Version    http://127.0.0.1:5000 
---
  upgrade Version    http://127.0.0.1:5000 

  
## 🚀 Features

### 👤 User Authentication

* User Registration
* Secure Login & Logout
* Password Hashing using Werkzeug

### 💵 Expense Management

* Add New Expenses
* Edit Existing Expenses
* Delete Expenses
* View Expense History

### 📊 Dashboard Analytics

* Total Expenses Counter
* Total Spending Amount
* Budget Tracking
* Remaining Budget Calculation
* Category-wise Expense Analysis
* Monthly Expense Trends
* Top Spending Category

### 🔍 Search & Filter

* Search expenses by category
* Filter expenses by date

### 📄 Reports Export

* Export Expenses to CSV
* Export Expenses to PDF

### 🎨 User Interface

* Responsive Bootstrap Design
* Mobile-Friendly Layout
* Flash Success/Error Messages

---

## 🛠️ Technologies Used

| Technology        | Purpose               |
| ----------------- | --------------------- |
| Python            | Backend Programming   |
| Flask             | Web Framework         |
| SQLAlchemy        | Database ORM          |
| SQLite/PostgreSQL | Database              |
| Bootstrap 5       | Frontend UI           |
| ReportLab         | PDF Report Generation |
| Gunicorn          | Production Server     |
| Render            | Cloud Deployment      |

---

## 📂 Project Structure

```text
ExpenseTracker/
│
├── app.py
├── requirements.txt
├── Procfile
├── runtime.txt
│
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── add_expense.html
│   ├── edit_expense.html
│   ├── view_expenses.html
│   └── profile.html
│
├── static/
│   ├── css/
│   └── images/
│
└── expense_tracker.db
```

---


> Replace the placeholders above with actual screenshots from your project.

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/harshitasaini0108-star/ExpenseTracker.git
cd ExpenseTracker
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

### 3️⃣ Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### 4️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 5️⃣ Run Application

```bash
python app.py
```

Application will run on:

```text
http://127.0.0.1:5000
```

---

## 🌐 Deployment

This project is deployed on **Render**.

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
gunicorn app:app
```

---

## 📊 Database Models

### User

| Field    | Type    |
| -------- | ------- |
| id       | Integer |
| name     | String  |
| email    | String  |
| password | String  |
| budget   | Float   |

### Expense

| Field       | Type        |
| ----------- | ----------- |
| id          | Integer     |
| category    | String      |
| amount      | Float       |
| description | String      |
| date        | Date        |
| user_id     | Foreign Key |

---

## 🔐 Security Features

* Password Hashing
* Session Management
* User-Based Expense Access
* Protected Routes

---

## 📈 Future Improvements

* Expense Charts using Chart.js
* Email Verification
* Password Reset
* Dark Mode
* Recurring Expenses
* Multi-User Analytics
* AI Expense Insights

---

## 👩‍💻 Author

**Harshita Saini**

GitHub:
[https://github.com/harshitasaini0108-star](https://github.com/harshitasaini0108-star)

Project Repository:
[https://github.com/harshitasaini0108-star/ExpenseTracker](https://github.com/harshitasaini0108-star/ExpenseTracker)

---

## ⭐ Support

If you like this project:

⭐ Star the repository on GitHub

🍴 Fork the project

📢 Share it with others

---

### License

This project is open-source and available under the MIT License.
