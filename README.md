# ArenaMind-AI - Smart Stadium & Tournament Operations Command

> [!IMPORTANT]
> Live frontend is deployed on Vercel; backend is deployed on Render but currently facing connection issues due to CORS/env constraints. For full evaluation, please run the app locally as documented below.

ArenaMind-AI is a next-generation GenAI-powered stadium assistant and tournament command platform designed for FIFA World Cup 2026-style venues (showcased with a high-fidelity MetLife Stadium demo). 


The platform reduces matchday friction for fans, volunteers, and operators by offering real-time multilingual and accessibility-aware routing, crowd congestion warnings, and an operational incident management dashboard.

---

## 🚀 Key Features

### 1. Context-Aware GenAI Assistant
- **System Prompt Architecture**: Integrates user role (Fan, Volunteer, Staff), selected language (English, Spanish, French), accessibility profile, and live stadium data (concourse occupancy, gates, restrooms, elevators, active alerts).
- **Short Actionable Outputs**: Tailored directions using bullet points.
- **Fail-Safe Fallback**: If no Gemini API key is configured, a local rules-based routing engine automatically steps in to provide smart, localized directions based on database facilities, ensuring a zero-crash demo experience.

### 2. Live Crowd-Intelligence Map
- **SVG Vector Map**: A custom-drawn, high-fidelity interactive MetLife Stadium zone map (Gates, Plaza, Mid/Upper Concourses, Transit, and ADA Parking).
- **Visual Congestion Tracking**: Zones change color dynamically based on live occupancy percentage (Green < 50%, Yellow 50-80%, Red > 80%).
- **Interactive Inspection**: Clicking a zone highlights accessibility scores, active bottlenecks, and localized POIs (like sensory rooms).

### 3. High-Contrast Accessibility Mode
- **Visual Enhancements**: Increases text sizes and converts layout to stark high-contrast colors (solid black/white/neon borders) to optimize readability.
- **Routing Enforcement**: Instructs the GenAI assistant to select only step-free paths (elevators/ramps) and highlight quiet/sensory spaces (like Section 224C).

### 4. Operations Command Center (Staff Dashboard)
- **Live Metrics**: Tracks overall capacities, active security incidents, queue metrics, and ADA routes requested.
- **Alert Dispatcher**: Staff can publish new congestion warnings, shuttle delays, or elevator maintenance outages targeting specific zones.
- **Incident Resolution**: Staff can acknowledge or resolve bottlenecks. Resolving an incident immediately restores the stadium map zone to clear status and updates the AI routing logic.

### 5. Multilingual Localization
- Complete support for English (EN), Español (ES), and Français (FR) across the entire UI and the AI assistant's responses.

### 6. Interactive Crowd Incident Reporting
- Fans and volunteers can report live queue bottlenecks, elevator outages, or maintenance emergencies directly from the UI, raising alarms instantly on the staff dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js (Vite) + Tailwind CSS (v3) + Lucide Icons
- **Backend**: Node.js + Express.js + SQLite Database (`sqlite3`)
- **GenAI**: Google Gemini API SDK (`@google/generative-ai`)
- **Monorepo Runner**: Native concurrent child processes spawning scripts

### Folder Structure
```
ArenaMind-AI/
├── package.json          # Root runner scripts
├── start-dev.js          # Spawns backend and frontend concurrently
├── backend/              # Express + SQLite Server
│   ├── database.js       # SQLite Schema & connection pool
│   ├── seed.js           # Seeds MetLife Stadium metadata
│   ├── server.js         # Server entrypoint
│   └── routes/           # REST APIs
│       ├── chat.js       # GenAI / Fallback Chat Assistant
│       ├── stadium.js    # Stadium metadata loader
│       ├── alerts.js     # Alerts creator & updater
│       └── feedback.js   # Rating database logger
└── frontend/             # Vite + React Client
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── index.css     # Global styles & Accessibility classes
    │   ├── App.jsx       # State orchestration & polling
    │   ├── components/   # Modular React Components
    │   │   ├── LandingPage.jsx
    │   │   ├── Header.jsx
    │   │   ├── StadiumMap.jsx
    │   │   ├── ChatAssistant.jsx
    │   │   ├── LiveStatus.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── FeedbackModal.jsx
    │   └── services/
    │       └── api.js    # Network requests
```

---

## 📦 Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- NPM

### Step 1: Clone the repository (or extract files)
Navigate into the project root directory:
```bash
cd ArenaMind-AI
```

### Step 2: Install Dependencies and Seed Database
We've set up a root command that automatically installs all frontend and backend node modules, and seeds the SQLite database:
```bash
npm run setup
```
If you encounter script execution restrictions in PowerShell on Windows, run:
```bash
cmd.exe /c npm run setup
```

To manually seed or re-seed the SQLite database with clean MetLife Stadium data at any time:
```bash
cd backend
node seed.js
```

### Step 3: Configure environment variables (Optional)

Create a `.env` file in the `backend/` folder to manage your API keys securely.

```bash
cd backend
cp .env.example .env
# Edit .env and configure your keys:
GEMINI_API_KEY=YOUR_REAL_KEY_HERE
OPENAI_API_KEY=OPTIONAL_OPENAI_KEY_HERE
PORT=5000
```

#### 🔑 API Keys & Configuration

* **GEMINI_API_KEY**:
  * **What it does**: Enables ArenaMind-AI to use Google Gemini for the smart stadium assistant.
  * **How to obtain**:
    1. Go to Google AI Studio at [aistudio.google.com](https://aistudio.google.com).
    2. Create an API key for your project.
    3. Copy the key.
  * **Where to put it**: Open `backend/.env` and paste your key into `GEMINI_API_KEY=YOUR_KEY`.

* **OPENAI_API_KEY**:
  * **What it does**: Alternative LLM provider for the assistant (uses `gpt-4o-mini`).
  * **How to obtain**:
    1. Go to the OpenAI API Keys Dashboard at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
    2. Create a new secret key.
    3. Copy the key.
  * **Where to put it**: Open `backend/.env` and paste your key into `OPENAI_API_KEY=YOUR_KEY`.

#### 📋 Behavior & Precedence
- If `GEMINI_API_KEY` is set and valid $\rightarrow$ ArenaMind-AI uses Gemini.
- If `GEMINI_API_KEY` is missing/invalid but `OPENAI_API_KEY` is set $\rightarrow$ uses OpenAI.
- If neither is set $\rightarrow$ uses built-in local smart routing logic.
- The app remains fully functional in local mode; AI suggestions are advisory and not safety-certified.
- Logs will print in the backend terminal at server startup and during query routing to clearly state which provider answered (e.g. `LLM mode: Gemini` or `LLM mode: Local fallback`).



### Step 4: Run the Application
Start both the backend and frontend dev servers concurrently with a single command from the root folder:
```bash
npm start
```
Or via cmd on Windows:
```bash
cmd.exe /c npm start
```
- **Frontend URL**: `http://localhost:3000`
- **Backend Port**: `http://localhost:5000`

---

## 🎯 Judge Demo Script (Under 3 Minutes)

Follow these step-by-step actions to experience the ArenaMind-AI command console:

1. **Access Console**: Open your browser to [http://localhost:3000](http://localhost:3000). Set language to **English**, select **Matchday Fan**, and click **Enter Stadium Assistant**.
2. **Query Facility (PMR / Quiet Room)**: In the AI Chat Assistant, click the quick action chip: **"🤫 Sensory Room"** (or type `"Where is the quiet room?"`).
   - *Observation*: The assistant instantly generates a luxury B&W structured card displaying the priority steps, warnings, and recommended zone (**Section 224C**).
3. **Escalate to Command**: Click **Staff** in the quick role switcher in the header to access the operator control room.
4. **Publish Operational Alert**: Under the **Create Live Operational Alert** form:
   - **Title**: `Gate B congestion bottleneck`
   - **Zone**: `Gate B (East Entrance)`
   - **Type / Severity**: `Congestion` / `High`
   - Click **Publish Operational Alert**.
5. **Inspect Live Map**: Switch back to **Fan** mode. Look at the interactive SVG stadium map. **Gate B** has turned **Red** (signaling heavy queues).
6. **Query Congested Route**: Ask the AI assistant: *"How do I reach Gate B?"*.
   - *Observation*: The assistant detects the bottleneck and issues an active redirect warning: *"⚠️ Gate B is congested. Redirect to Gate D (ADA priority) or Gate A."*
7. **Submit Feedback**: Rate the answer helpfulness by clicking the star rating inline. Submit a brief comment.
8. **Resolve Incident**: Return to the **Staff** panel. Click **Acknowledge**, and then **Mark Resolved** on the Gate B incident. Watch the map zone reset back to clear.

---

## 📸 Screenshots

*(Add your images to the root folder using these exact names)*

* **`screenshot_landing_page.png`**:
  * *Caption*: Sleek, luxury landing page for preferences, role selection, and accessibility.
* **`screenshot_fan_dashboard.png`**:
  * *Caption*: Stark black-white Fan Console displaying the interactive SVG MetLife stadium layout.
* **`screenshot_structured_routing.png`**:
  * *Caption*: Structured priority routing card returned by the local rules-based engine.
* **`screenshot_staff_command.png`**:
  * *Caption*: Operations dashboard containing capacity metrics, incident resolution cards, and alert creators.

---

## 📋 Submission Checklist

* **Public Repository & Branching**:
  - The project is hosted on a public GitHub repository.
  - Development conforms to a single-branch commit workflow.
* **Launch Commands**:
  - Install dependencies and seed the database: `cmd.exe /c npm run setup` (or `npm run setup`)
  - Run concurrent dev servers: `cmd.exe /c npm start` (or `npm start`)
* **Files to Inspect First**:
  - `README.md` (this file) - Setup instructions, API keys, and demo guide.
  - [task.md](file:///C:/Users/lenovo/OneDrive/Desktop/ArenaMind-AI/task.md) - Living log of completed MVP features.
  - [walkthrough.md](file:///C:/Users/lenovo/OneDrive/Desktop/ArenaMind-AI/walkthrough.md) - Registry of created files and verification logs.
* **AI Modes & Safety**:
  - Fully supports Google Gemini (`GEMINI_API_KEY`) and OpenAI (`OPENAI_API_KEY`) with an automated rules-based local engine fallback.
  - API keys are handled strictly on the server and are never exposed to the client, terminal outputs, or console logs.

---

## 🔧 Production Deployment Troubleshooting

If you encounter the error *"Sorry, I had trouble reaching the command server"* during a live production deployment (e.g. Vercel for Frontend and Render/Railway for Backend):

1. **Frontend API URL (`VITE_API_BASE_URL`)**:
   - In your frontend hosting platform's dashboard (e.g., Vercel), add an Environment Variable named `VITE_API_BASE_URL`.
   - Set its value to the URL of your deployed Express backend (e.g., `https://your-backend-app.onrender.com`).
   - If `VITE_API_BASE_URL` is omitted, the frontend defaults to `''` (empty string) to route requests via the local Vite dev server proxy (`localhost:3000 -> localhost:5000`).

2. **CORS Configuration**:
   - The Express server in `server.js` initiates `app.use(cors())` directly, permitting cross-origin requests from the client.

3. **API Routing Paths**:
   - Confirm all endpoints route strictly under `/api/**` (e.g. `${BASE_URL}/api/chat`), matching the Express routes defined in `backend/server.js`.


