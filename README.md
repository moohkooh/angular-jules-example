# Bank Manager Application

A full-stack application to manage multiple bank accounts, import Sparkasse CSV exports, categorize expenses, and track monthly budgets.

## Project Structure

- `backend/`: NestJS application with TypeORM.
- `frontend/`: Angular application with Angular Material and Chart.js.
- `docker-compose.yml`: PostgreSQL database configuration.

## Prerequisites

- Node.js (v20+)
- Docker and Docker Compose
- NPM

## Bootstrapping the Application

Follow these steps to get the application running locally:

### 1. Database Setup

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Update `JWT_SECRET` and database credentials if necessary.
4. Start the backend:
   ```bash
   npm run start:dev
   ```
   The backend will be available at `http://localhost:3000`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`.

## Features

### Authentication
- Register a new account and login.
- Data is secured and private to each user.

### Bank Accounts
- Add multiple bank accounts (Giro, Savings, etc.) by name and IBAN.

### Transaction Management
- **Sparkasse Import**: Export your transactions from Sparkasse (CSV format) and upload them.
- **Auto-Categorization**: The system learns from your manual category assignments and applies them to future imports.
- **Manual Entry**: Add transactions manually for cash payments or missing records.
- **Editing**: Update any transaction to add comments or change its category.

### Dashboard & Budgeting
- Define monthly budgets for each category.
- View a visual comparison of your actual spending versus your budget.
- Identify fixed costs (e.g., rent, insurance).

## Sparkasse CSV Format

The application supports the standard Sparkasse CSV export with the following columns:
`Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Verwendungszweck;Glaeubiger ID;Mandatsreferenz;Kundenreferenz (End-to-End);Sammlerreferenz;Lastschrift Ursprungsbetrag;Auslagenersatz Ruecklastschrift;Beguenstigter/Zahlungspflichtiger;Kontonummer/IBAN;BIC (SWIFT-Code);Betrag;Waehrung;Info`

## Development Notes

- The backend uses TypeORM with `synchronize: true` for easy development.
- The frontend uses `ng2-charts` (Chart.js wrapper) for data visualization.
- Manual category assignments trigger rule creation to improve automation.
