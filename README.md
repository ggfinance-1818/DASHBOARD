# 🔵 Valyana Dashboard

A full-stack business intelligence dashboard for Valyana. Pulls live data from Google Sheets and uses AI to generate smart summaries.

---

## 📁 Project Structure

```
valyana-dashboard/
├── backend/          ← Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── railway.toml
│   └── .env.example
├── frontend/         ← React app
│   ├── src/
│   │   ├── pages/    ← Home, SalesReport, JarsReport, IncentiveReport
│   │   ├── components/ ← Navbar, DateFilter, AISummary
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/valyana-dashboard.git
cd valyana-dashboard
```

### 2. Set up the backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev       # runs on http://localhost:4000
```

### 3. Set up the frontend
```bash
cd frontend
cp .env.example .env
# Edit .env → set REACT_APP_API_URL=http://localhost:4000
npm install
npm start         # runs on http://localhost:3000
```

---

## 🚀 Deploy to Railway (Backend)

1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `valyana-dashboard` repo
4. Set the **Root Directory** to `backend`
5. Add this **Environment Variable** in Railway:
   ```
   SHEET_ID = 1pEo8w5LkuKh7lBpioWPcq9imXBPKGN8pWGcr4QGLlcg
   ```
6. Deploy! Railway will give you a URL like `https://valyana-backend.railway.app`

---

## 🌐 Deploy Frontend (Netlify or Vercel — FREE)

### Option A: Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Select your GitHub repo
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm run build`
5. Set **Publish directory**: `frontend/build`
6. Add Environment Variable:
   ```
   REACT_APP_API_URL = https://your-backend.railway.app
   ```
7. Deploy!

### Option B: Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add the same `REACT_APP_API_URL` env variable
4. Deploy!

---

## 📊 Google Sheets Setup

Make sure your sheet is **publicly readable**:
1. Open your Google Sheet
2. Click **Share** (top right)
3. Click **Change to anyone with the link**
4. Set to **Viewer**
5. Click **Done**

Your Sheet ID is already configured: `1pEo8w5LkuKh7lBpioWPcq9imXBPKGN8pWGcr4QGLlcg`

---

## 🤖 AI Summaries

The dashboard uses Claude AI to generate smart business insights on each report page. The AI analyzes your filtered data and gives actionable recommendations.

---

## ➕ Adding Staff Incentive Data

To enable individual staff tracking, add a sheet called **"Staff"** to your Google Sheets with these columns:
```
name | date | sales_amount | target | incentive_rate
```
Then update `backend/server.js` `/api/incentive` endpoint to fetch from that sheet.

---

## 📞 Support

Built for Valyana Business Intelligence Platform.
