# USG HR Command System — Next.js Frontend

## Architecture
```
Vercel (Next.js UI)  →  fetch()  →  Google Apps Script Web App  →  Google Sheets
```

---

## Setup Instructions

### Step 1 — Update Google Apps Script

1. Open your GAS project
2. Open `Code.gs`
3. **Replace the existing `doGet()` function** with the content from `GAS_doGet_update.gs`
4. Keep everything else exactly as is
5. Click **Deploy → Manage Deployments → New Deployment**
   - Type: Web App
   - Execute as: Me
   - Who has access: **Anyone** ← important for Next.js to call it
6. Copy the new Web App URL

### Step 2 — Configure Environment Variables

Create `.env.local` in the project root:
```
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### Step 3 — Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Step 4 — Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → Import project
3. Add environment variable:
   - Name:  `NEXT_PUBLIC_GAS_URL`
   - Value: your GAS Web App URL
4. Deploy

---

## Pages

| Route | Description |
|---|---|
| `/login` | Futuristic login screen |
| `/dashboard` | Live KPIs — employees, locations, companies |
| `/onboarding` | Candidate pipeline with add modal |
| `/employees` | Active manpower table with filters |
| `/tracker` | 20DS step tracker |
| `/resignations` | Deletion log / ex-employees |
| `/master` | Full master data table |

---

## GAS Compatibility

The Next.js frontend uses the **exact same GAS functions** as your existing system:
- `loginUser(email, password)` → returns token
- `validateSession(token)` → validates session
- `loadAllData(token)` → returns all data
- `runProtected(token, funcName, args)` → all protected calls

Your existing GAS UI continues working unchanged. Next.js is an **additional** frontend.

---

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- No additional database — Google Sheets via GAS

---

## Important Notes

1. **GAS deployment must be set to "Anyone"** for fetch() to work from Vercel
2. Your existing Google Sheets UI continues to work — nothing breaks
3. Sessions are stored in `sessionStorage` (cleared on tab close)
4. All data logic stays in GAS — Next.js is UI only
