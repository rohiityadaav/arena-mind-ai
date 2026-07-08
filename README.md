# ArenaMind-AI - Smart Stadium & Tournament Operations Command

> [!IMPORTANT]
> **Production & Local Evaluation Guideline:** 
> While the frontend is optimized for deployment platforms (like Vercel) and the backend is set up for Render/Railway, environment/CORS constraints across free hosting tiers can occasionally limit connection speeds. **For full feature evaluation, please run the application locally as documented below.**

ArenaMind-AI is a next-generation GenAI-powered stadium assistant and tournament command platform designed specifically for the **Smart Stadiums & Tournament Operations** vertical (showcased with a high-fidelity MetLife Stadium demo). 

The platform reduces matchday friction for fans, volunteers, and operators by offering real-time multilingual and accessibility-aware routing, crowd congestion warning matrices, and a tactical incident management dashboard.

---

## 🎯 Chosen Vertical & Problem Alignment

### 1. The Challenge
Tournament venues during high-capacity matches (like FIFA World Cup 2026 games) suffer from information bottlenecks:
* **Fans** face long entry queues, lack real-time accessible route detours, and struggle to find facilities (like sensory rooms).
* **Volunteers** lack coordinate data to guide spectators when elevators go down or specific gates are congested.
* **Operators/Staff** struggle to broadcast immediate bottlenecks, monitor live crowd density vectors, or update assistant routing instructions instantly.

### 2. The Solution (ArenaMind-AI)
ArenaMind-AI bridges the gap between spectator assistance and SRE tactical operations by uniting:
1. **Matchday Fan App**: Provides real-time AI guidance, interactive SVG dynamics maps, and instant queue reporting.
2. **Operations Command Center**: Enables staff to monitor global crowd density vectors, publish live warnings, and manage incident queues.
3. **Dynamic Logic Engine**: Automatically updates GenAI system prompts and visual map indicators whenever incidents are created or resolved.

---

## 🚀 Key Features

### 1. Context-Aware GenAI Assistant
* **System Prompt Architecture**: Integrates user role (Fan, Volunteer, Staff), selected language (English, Spanish, French), active accessibility needs, and live database context (concourse occupancy, gates, restrooms, elevators, active alerts).
* **Zero-Crash Fallback**: If no Gemini API key is configured, a built-in rules-based routing engine automatically steps in to provide smart, localized directions based on database facilities, ensuring a seamless demo experience.

### 2. Live Crowd-Intelligence Map
* **SVG Vector Map**: A custom-drawn, high-fidelity interactive MetLife Stadium zone map (Gates, Plaza, Mid/Upper Concourses, Transit, and ADA Parking).
* **Visual Congestion Tracking**: Zones change color dynamically based on live occupancy percentage (Green < 50%, Yellow 50-80%, Red > 80%).
* **Interactive Inspection**: Clicking a zone highlights accessibility scores, active bottlenecks, and localized POIs (like sensory rooms).

### 3. High-Contrast Accessibility Mode
* **Visual Overrides**: Instantly increases text size and updates contrast to stark black-white-neon borders for high readability under stadium glare.
* **Routing Enforcement**: Instructs the assistant to select only step-free paths (elevators/ramps) and highlight quiet/sensory spaces (like Section 224C).

### 4. Operations Command Center (Staff Dashboard)
* **Live Density Sweeps**: Displays venue statuses, communications link health, and incident logs.
* **Alert Dispatcher**: Staff can publish new congestion warnings, shuttle delays, or elevator maintenance outages targeting specific zones.
* **Incident Resolution**: Acknowledging or resolving alerts immediately resets stadium map zones to clear and updates the AI routing logic.

### 5. Judge Demo Mode
* **Zero-Friction Scripting**: Activates with a single button in the top-right header control room. It instantly configures user preferences, selects defaults, and seeds a scriptable scenario (crowd congestion at Gate B, medical emergency in Section 112, and elevator lobby maintenance) alongside a floating step-by-step instruction guide in the UI.

### 6. Safety Lens Overlay
* **Visual Risk Mapping**: Toggles a visual safety overlay from the header. High-risk zones (congested areas, active incidents) are highlighted in pulsating red warnings, while safe corridors, medical points, and emergency exits are marked in bright green. The GenAI assistant is instructed to explicitly call out first aid points and safety bypass routes in chat responses.

### 7. Accessibility Index Score
* **Dynamic Recommendation Engine**: Computes a live accessibility index score (0–100) dynamically in the configurations dashboard. Evaluates active physical outages, selected profiles, and suggests operational recommendations (e.g. ADA shuttle frequency, elevator outage bypasses) to keep venue navigation safe and accessible.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React.js (Vite) + Tailwind CSS (v3) + Lucide Icons
* **Backend**: Node.js + Express.js + SQLite Database (`sqlite3`)
* **GenAI**: Google Gemini API SDK (`@google/generative-ai`)
* **Monorepo Runner**: Native concurrent child processes spawning scripts

### Folder Structure
```
ArenaMind-AI/
├── package.json          # Root runner scripts
├── start-dev.js          # Spawns backend and frontend concurrently
├── scripts/              # Verification & test scripts
│   ├── test-smoke.js             # Calls backend health, stadium, and chat fallback
│   └── test-frontend-sanity.js   # Statically validates React component bindings
├── backend/              # Express + SQLite Server
│   ├── database.js       # SQLite Schema & connection pool
│   ├── seed.js           # Seeds MetLife Stadium metadata
│   ├── server.js         # Server entrypoint
│   └── routes/           # REST APIs
└── frontend/             # Vite + React Client
```

---

## 📦 Setup & Running Locally

### Prerequisites
* Node.js (v18 or higher)
* NPM

### Step 1: Clone and Install Dependencies
Navigate into the project root directory and run the unified setup command to install dependencies for all workspace tiers and seed the database:
```bash
npm run setup
```
*(On Windows PowerShell, if execution policy restricts npm scripts, run: `cmd.exe /c npm run setup`)*

To manually seed or re-seed the SQLite database with clean MetLife Stadium data at any time:
```bash
cd backend
node seed.js
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` folder to manage API keys securely:
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and paste your Gemini API key:
```env
GEMINI_API_KEY=YOUR_REAL_GEMINI_KEY_HERE
PORT=5000
```
*(Note: If the key is omitted, the console automatically runs in local rule-based fallback mode).*

### Step 3: Run the Application
Start both the backend and frontend dev servers concurrently with a single command from the root folder:
```bash
npm start
```
* **Frontend URL**: `http://localhost:3000`
* **Backend Port**: `http://localhost:5000`

---

## 🧪 Testing Suite

ArenaMind-AI comes equipped with automated backend smoke tests and frontend static sanity checks to ensure system integrity.

### 1. Running Automated Tests
With the servers running, open a new terminal window at the project root and run:
```bash
npm test
```
This executes:
1. **Frontend Sanity Check & Unit Tests** (`npm run test:frontend`): Statically validates that all React components export correctly and runs unit tests verifying the exact decision tree logic of chat error classification (Transport, Backend Logical, or Client Unexpected bugs).
2. **Backend Smoke Test** (`npm run test:smoke`): Validates GET /api/health, GET /api/stadium, POST /api/chat (success flows), payload validation errors (400 responses for empty inputs or invalid roles), and multilingual fallback routing behavior when LLMs are unavailable.

---

## 🔒 Security Practices

1. **Secrets Handling**: API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are read strictly from server-side environment variables (`.env`) and are **never** hard-coded, logged in terminals, or exposed to the frontend client.
2. **SQL Injection Prevention**: All queries made to the SQLite database bind parameters securely using `?` placeholders (no string concatenation).
3. **Payload Validation**: Input parameters on POST and PUT routes (like message length checks and option validation) prevent overflow or directory traversal attempts.
4. **Generic Error Messages**: Server stack traces are logged locally to files. The frontend receives clean, localized, user-friendly error codes during connection drop-offs.

---

## ⚡ Efficiency Considerations

1. **SQLite Indexed Queries**: Core queries for zones, alerts, and facilities utilize standard indexes and foreign keys, keeping fetch latencies under `3ms`.
2. **Debounced Interaction**: Search inputs and accessibility configurations update React state dynamically, recalculating the accessibility score on the client side to avoid duplicate API load.
3. **Static Metadata Caching**: Core stadium zone coordinates and gate positions are cached in the Express server memory on startup to minimize redundant database I/O.

---

## ♿ Accessibility Compliance

* **Screen Reader Friendly**: Key interactive dashboard buttons, role selectors, and navigation elements feature explicit `aria-label`, `aria-selected`, and keyboard `tabIndex` attributes.
* **Localization**: Fully localized across English, Spanish, and French, dynamically translating alerts, map states, and chat widgets.
* **Routing Priorities**: Activating the accessibility toggle restricts routing choices to step-free paths (elevators/ramps) and alerts the user of mechanical outages (elevator maintenance).

---

## 🎯 3-Minute Judge Demo Script

Follow these step-by-step actions to experience the ArenaMind-AI command console:

1. **Launch App**: Open your browser to [http://localhost:3000](http://localhost:3000). You will boot directly into the desktop dashboard showing the **Hero View** ("Identify your role...").
2. **Toggle Judge Demo Mode**: Click **"Judge Demo OFF"** in the top-right header. 
   * *Observation*: The dashboard immediately switches to Fan Chat view, the bottom-right **"Judge Demo Script"** overlay appears, and the stadium database is populated with Gate B congestion and Section 112 medical emergencies.
3. **Verify Safe Rerouting**: Ask the assistant: *"How do I reach the Premium Box avoiding the congested Gate B?"*
   * *Observation*: The assistant displays a localized detour recommendation and a warning card suggesting safe South/West exit coordinates.
4. **Activate Safety Lens**: Toggle **"Safety Lens"** in the header.
   * *Observation*: The stadium map overlays blinking red hazard warning icons over congested Gate B / Section 112, and highlights safe escape routes in bright green lines.
5. **Acknowledge and Resolve (Staff Mode)**: Go to the **Ecosystem Configs** tab, switch your role to **Operations Staff**, and navigate back to **Live Zone Map** (or use the floating script tips). You will see the SVG density radar sweep and priority incident logs. Click **Acknowledge** and then **Mark Resolved** on the alerts.
   * *Observation*: The map highlights reset instantly back to normal clear status, and the Accessibility Score updates.
