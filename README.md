# AgentForge: Autonomous Agent Builder & Red-Team Security Lab

An enterprise AI Agent workflow visual builder, execution engine, and automated adversarial red-teaming lab powered by Gemini and TypeScript.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agentforge.git
cd agentforge

# Install packages
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Inside `.env`, add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Run

To build the optimized client bundle and server bundle:

```bash
# Build frontend and compile backend
npm run build

# Launch production server
npm start
```
The server will bind to `0.0.0.0:3000` (or the `PORT` environment variable) serving both the REST APIs and static SPA.

---

## 🐳 Deploying to Cloud & Hosting Platforms

### Option A: Google Cloud Run (Recommended)
1. In Google Cloud Console or using `gcloud`:
```bash
gcloud run deploy agentforge \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_api_key_here"
```

### Option B: Render / Railway / Fly.io
1. Connect your GitHub repository to **Render** or **Railway**.
2. Set the Build Command:
   ```bash
   npm install && npm run build
   ```
3. Set the Start Command:
   ```bash
   npm start
   ```
4. Add the Environment Variable `GEMINI_API_KEY` in your provider's dashboard.

---

## 📂 Project Architecture

- `server.ts` - Express backend proxying Gemini API calls, executing dynamic workflows, and providing `/api/v1/agents/:id/run` REST endpoints and `/api/v1/security/evaluate-probe` test runner.
- `src/components/Canvas.tsx` - Interactive visual node canvas for building multi-agent DAGs.
- `src/components/SecurityAttackLab.tsx` - Automated Red-Team adversarial attack lab mapped to OWASP LLM Top 10 & NIST AI RMF.
- `src/components/DeployModal.tsx` - Production deployment console with live cURL testing and webhook endpoints.
