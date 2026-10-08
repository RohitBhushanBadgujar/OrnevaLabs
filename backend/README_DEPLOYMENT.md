# ORNEVA LABS — BACKEND & DATABASE DEPLOYMENT GUIDE

Orneva Labs uses a hybrid architecture:
1. **Cloud Production Backend**: Google Sheets as the relational database + Google Apps Script (GAS) as the serverless REST API layer.
2. **Offline & Edge Fail-Safe Engine**: Built-in client-side database simulation in `js/api.js` that provides instant local testing, offline caching, and automatic fallback if the Google Apps Script endpoint is unreachable or empty.

---

## 1. Google Sheets Database Setup

1. Create a new Google Spreadsheet at [sheets.new](https://sheets.new).
2. Name it **"Orneva Labs Production Database"**.
3. In the top menu, go to **Extensions** → **Apps Script**.
4. In the Apps Script editor:
   - Delete any default code in `Code.gs`.
   - Copy and paste the entire contents of `backend/Code.gs` into `Code.gs`.
5. Select the function dropdown at the top and choose **`setupOrnevaDatabase`**.
6. Click **Run**.
   - Review permissions and click **Allow**.
   - This will automatically create all 8 required sheets (`Courses`, `Students`, `Payments`, `Enrollments`, `Progress`, `Logs`, `Settings`, `Admins`), apply headers, and seed the initial 5 flagship courses!

---

## 2. Deploying the Web App REST API

1. In the Apps Script editor, click the blue **Deploy** button (top right) → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment settings:
   - **Description**: `Orneva Labs Production API v1`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial for public website requests)*
4. Click **Deploy**.
5. Copy the **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 3. Connecting the Frontend

1. Open `js/utils.js`.
2. Locate the `CONFIG` object near the top:
   ```javascript
   const CONFIG = {
     APP_NAME: "Orneva Labs",
     UPI_ID: "9172750062@fam",
     PAYEE_NAME: "Orneva Labs",
     WHATSAPP_NUMBER: "9172750062",
     API_URL: "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec", // <- Paste your URL here
     ...
   };
   ```
3. Save the file. Your website is now connected live to Google Sheets!

---

## 4. Admin Access & Initial Setup

- **Admin Login Page**: `/admin-login.html`
- **Default Admin Email**: `admin@ornevalabs.com`
- **Initial Setup**: Configurable via Google Apps Script **Project Settings** → **Script Properties** key `INITIAL_ADMIN_PASSWORD` (defaults to bootstrap password `orneva2026!` if omitted).
- **Security Recommendation**: Change your password immediately upon initial deployment directly in the `Admins` sheet by updating the salted SHA-256 hash or via script properties.

---

## 5. Security & Verification Policy

- **Manual UPI Verification**: In accordance with Orneva Labs' policy, payments are received via UPI ID `9172750062@fam` and verified manually by the admin team in `/admin.html`.
- **Server-Side Price Validation**: Even if an attacker attempts to alter the price on the client, the backend recalculates and enforces the exact course tuition price from the database.
- **Duplicate Prevention**: The system enforces uniqueness on transaction reference IDs (`ORN-YYYYMMDD-XXXXXX`) and UTR reference codes.
