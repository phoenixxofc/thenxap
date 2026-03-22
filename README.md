# Arena Dash v2.0 Setup Guide

Follow these steps precisely to get the game running on your local machine.

## Prerequisites
- **Node.js (v18.17.0 or higher)**: [Download here](https://nodejs.org/)
- **Git** (if you're cloning the repository)

---

## Step 1: Install All Dependencies
Open your terminal in the root folder of the project (`arena-dash`) and run:
```bash
npm install
```
*Wait for this to finish. It will install all the libraries for the engine, web app, and server.*

---

## Step 2: Build the Shared Game Engine
The engine is a core dependency that must be compiled first:
```bash
cd packages/engine
npm run build
cd ../..
```
*This creates the `dist` folder. If the command returns to the prompt with no errors, it was successful.*

---

## Step 3: Compile the Smart Contracts
Next, compile the blockchain layer:
```bash
cd packages/contracts
npm run build
cd ../..
```

---

## Step 4: Launch the Web App
Now you're ready to start the game!
```bash
cd apps/web
npm run dev
```

---

## Step 5: Open in Your Browser
Once the terminal says `✓ Ready`, open your browser and visit:
[http://localhost:3000](http://localhost:3000)

---

## (Optional) Step 6: Start the Validator
If you want to use the high-score verification and leaderboard:
1. Copy `apps/server/.env.example` to `apps/server/.env`
2. Run:
```bash
cd apps/server
npm run dev
```

---

## Vercel Deployment

Arena Dash is built on the **Next.js** framework. When deploying to Vercel, use the following settings:

1. **Framework Preset:** `Next.js`
2. **Root Directory:** `apps/web`
3. **Build Command:** `cd ../.. && npm run build`
4. **Install Command:** `cd ../.. && npm install`

**Note:** The `cd ../..` is necessary because Vercel needs to run the workspace-aware install and build from the root of the monorepo to correctly link the `@arena-dash/engine` dependency.

## Troubleshooting
- **Node Version Error:** If it says you're on v16, you **must** update to v18+ to use Next.js 14.
- **Missing File Error:** If the web app says it can't find `@arena-dash/engine`, repeat **Step 2**.
- **Port Busy:** If localhost:3000 is taken, the terminal will tell you the new port (e.g., 3001).
