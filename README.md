# La Rose — Dashboard project

Pages included:

- `login.html` — Login
- `index.html` — Dashboard
- `inventory.html` — Inventory
- `pos.html` — POS
- `sales.html` — Sales
- `purchases.html` — Purchases
- `accounting.html` — Accounting
- `reports.html` — Reports
- `users.html` — Users
- `payroll.html` — Payroll
- `truck.html` — Truck
- `settings.html` — Settings
- `apps.html` — Installed Apps

Files:

- `styles.css` — styles
- `app.js` — frontend interactions, auth, page notes, and page data UI
- `server.js` — Node/Express backend for login and notes storage
- `server-data.json` — backend persistence store

Authentication:

- Default login: `admin` / `admin123`
- Login is handled by the backend at `/api/login`
- Session token is stored in browser `localStorage` and validated via `/api/validate`
- Page notes are saved to the backend at `/api/notes`

Running the app:

1. Open a terminal in `c:\Users\USER\Desktop\la  rose project\.sixth`
1. Install dependencies:

```powershell
npm install
```

1. Start the backend server:

```powershell
npm start
```

1. Open the app in your browser at:

```text
http://localhost:3000/login.html
```

1. Sign in with `admin` / `admin123`.

Notes:

- The server serves the static frontend files from the `.sixth` folder.
- If you want the backend to run from the root folder, move `package.json`, `server.js`, and `server-data.json` into the root.
