# TradeLog — Setup Guide

## Quick Start (5 minutes)

### Prerequisites
You need **Node.js** installed on your computer (version 18 or newer).

**Don't have Node.js?** Download it from: https://nodejs.org
- Click the big green "LTS" button
- Run the installer
- That's it

To check if you have it, open Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
```
If you see a number like `v18.x.x` or higher, you're good.

---

### Step 1: Download and unzip this project

Put the `tradelog-project` folder somewhere on your computer, like your Desktop.

### Step 2: Open Terminal in the project folder

**Mac:**
- Open Terminal app
- Type `cd ` (with a space after cd)
- Drag the `tradelog-project` folder into the Terminal window
- Press Enter

**Windows:**
- Open the `tradelog-project` folder in File Explorer
- Click the address bar at the top
- Type `cmd` and press Enter

You should now be inside the project folder.

### Step 3: Install dependencies

```bash
npm install
```

This downloads all the libraries the app needs. Takes about 30-60 seconds.

### Step 4: Start the development server

```bash
npm run dev
```

You'll see something like:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 5: Open your browser

Go to **http://localhost:3000**

That's it — your trading journal is running! 🎉

---

## Deploying to the Internet (Free)

### Option A: Vercel (Easiest — 2 minutes)

Vercel is made by the same team that makes Next.js. Free tier is generous.

1. **Push to GitHub:**
   - Create a GitHub account if you don't have one: https://github.com
   - Install GitHub Desktop: https://desktop.github.com
   - Create a new repository and push this project

2. **Deploy on Vercel:**
   - Go to https://vercel.com and sign in with GitHub
   - Click "New Project"
   - Select your tradelog repository
   - Click "Deploy"
   - Done! You get a URL like `tradelog-yourname.vercel.app`

### Option B: Netlify (Also Easy)

1. Go to https://netlify.com
2. Sign in with GitHub
3. Click "Add new site" → "Import from Git"
4. Select your repo
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Deploy

### Option C: Railway / Render

Both support Next.js apps. Connect your GitHub repo and deploy.

---

## Project Structure

```
tradelog-project/
├── package.json              ← Dependencies and scripts
├── next.config.js            ← Next.js configuration
├── tailwind.config.js        ← Tailwind CSS setup
├── postcss.config.js         ← PostCSS for Tailwind
├── src/
│   ├── app/
│   │   ├── globals.css       ← Global styles + fonts
│   │   ├── layout.js         ← HTML wrapper (title, metadata)
│   │   └── page.js           ← Main page (loads TradingJournal)
│   └── components/
│       └── TradingJournal.js  ← The entire app (all-in-one)
└── public/                    ← Static files (favicon, etc.)
```

## Adding a Database (Optional — for saving data)

Right now data lives in browser memory and resets on refresh.
To make it persistent, you can add Supabase:

1. Go to https://supabase.com and create a free project
2. Run the SQL schema (from the schema.sql file) in the SQL Editor
3. Install the client: `npm install @supabase/supabase-js`
4. Connect it to the app by replacing `useState` with Supabase queries

---

## Common Issues

**"command not found: npm"**
→ You need to install Node.js from https://nodejs.org

**"EACCES permission denied"**
→ On Mac, try: `sudo npm install`

**Page is blank**
→ Make sure the dev server is running (`npm run dev`)
→ Check the terminal for error messages

**Port 3000 already in use**
→ Either stop whatever's using it, or: `npm run dev -- -p 3001`
