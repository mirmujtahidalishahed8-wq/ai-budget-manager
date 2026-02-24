# Money Mentor: AI-Driven Autonomous Budgeting & Debt Management System

A complete full-stack web application for tracking finances, managing debts, and receiving AI-powered budget insights.

## 🚀 Features

*   **User Dashboard**: Visual overview of financial health (Income vs Expense, Savings).
*   **Expense Tracker**: Log and categorize daily transactions.
*   **Debt & EMI Manager**: Track loans, remaining balances, and upcoming EMI dates.
*   **AI Financial Agent**:
    *   Analyzes spending patterns.
    *   Predicts future cash flow.
    *   Provides actionable recommendations (e.g., 50/30/20 rule).
    *   Alerts for overspending or detailed bill reminders.
*   **Secure Authentication**: JWT-based login and signup.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), Chart.js, Glassmorphism CSS (Custom Design System).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose).
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt.

## 📦 Project Structure

```
ai-budget-manager/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context provider
│   │   ├── pages/          # Application pages (Dashboard, Tracker, etc.)
│   │   └── styles/         # Global CSS (Design System)
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route logic (Optional separation)
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose Schemas (User, Transaction, Debt)
│   ├── routes/             # API Endpoints (Auth, Finance, AI)
│   └── seed.js             # Script to populate demo data
└── README.md
```

## ⚡ Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas URI)

### Quick Start (Automated)

1.  **Ensure MongoDB is running**.
2.  Run the helper script from the project root:
    ```bash
    node start.js
    ```
    This will start both backend and frontend.

### Manual Setup


1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Seed the Database** (Important for Demo):
    *   Make sure MongoDB is running.
    *   Run the seed script to create a sample user and data:
    ```bash
    npm run seed
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```
    *   Server runs on `http://localhost:5000`

### 2. Frontend Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *   Client runs on `http://localhost:5173` (typically)

## 🧪 Demo Credentials

After running `npm run seed` in the server folder, use these credentials to log in:

*   **Email**: `john@example.com`
*   **Password**: `password123`

## 🔮 AI Features Explained

The AI Agent (located in `server/routes/ai.js`) performs the following:

1.  **Rule-Based Analysis**: Calculates Savings Rate and adherence to the 50/30/20 budget rule.
2.  **Predictive Logic**: Estimates next month's balance based on current spending velocity.
3.  **Risk Detection**: Scans upcoming Debt due dates and compares against current balance to issue proactive alerts.
