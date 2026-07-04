<h1 align="center">
  ⚡ Lights, Fans, and Discord!
</h1>

<p align="center">
  <strong>An end-to-end IoT smart office simulation built for the Techathon Nationals: Rover Summit.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-000?style=for-the-badge" />
</p>

## 📖 Overview
"Lights, Fans, Discord" is a fully integrated IoT simulator designed to monitor, track, and interact with a virtual smart office. The system continuously tracks the real-time power consumption of 15 distinct virtual devices distributed across 3 rooms. It dynamically analyzes power load, tracks device uptime, and automatically throws high-usage and after-hours alerts straight to the frontend dashboard. 

## ✨ Key Features
- **Real-Time Dashboard**: A blazing fast React frontend utilizing Server-Sent Events (SSE) to display sub-second power consumption updates.
- **Dynamic CSS-Grid Blueprint**: An interactive, automatically reflowing architectural layout containing dynamically glowing and animating devices.
- **Continuous Anomaly Engine**: A rigorous backend calculation utility tracking active device duration, triggering dynamic overhead and after-hours alerts when usage exceeds configured thresholds.
- **LLM-Powered Discord Integration**: An integrated bot utilizing the `Groq SDK` and the lightning-fast `llama3-8b-8192` model to converse with managers naturally regarding current electrical status.

## 🛠️ Tech Stack
This project leverages a modern, decoupled microservice architecture consisting of three primary modules:
- **Frontend**: React 19, Vite, Tailwind CSS (v3), Lucide React, Custom Shadcn UI components.
- **Backend (API + Simulator)**: Node.js, Express.js, CORS.
- **Discord Bot**: `discord.js`, `groq-sdk`, `axios`, `dotenv`.

## 🏗️ System Architecture & Hardware

### System Overview
![System Architecture](./hardware%20diagram/systemdiagram.png)

### Hardware Schematic
![Hardware Schematic](./hardware%20diagram/hardwareschematic.png) *(Note: Replace with your final schematic)*

## 🚀 Setup & Installation

You will need three separate terminal windows to run the complete environment. Ensure you have Node.js installed.

### 1. Clone & Install
Clone the repository and install dependencies in all three microservice folders:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Bot
cd ../bot
npm install
```

### 2. Environment Variables (Bot)
Before running the bot, configure the environment variables.
In the `/bot` directory, create a `.env` file containing:
```env
DISCORD_TOKEN=your_discord_bot_token_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the System
Start all three microservices in their respective terminal tabs:
```bash
# Terminal 1: Start Backend (Runs on http://localhost:5000)
cd backend
node server.js

# Terminal 2: Start Frontend (Runs on http://localhost:5173)
cd frontend
npm run dev

# Terminal 3: Start Discord Bot
cd bot
node bot.js
```

## 💬 Usage & Bot Commands

Interact with the IoT system natively through Discord using the following commands:
- `!status` - Fetches the live electrical state from the backend and summarizes it via Groq LLM into a concise, natural status report.
- `!room [name]` - Filters the electrical status for a specific room (e.g., `!room Work Room 1`).
- `!usage` - Queries the current live wattage and estimates the daily kWh footprint.

### Hackathon Debug / Simulation Routes
To force anomalies for demonstrations or judging, use these debug endpoints:
- **Trigger After-Hours Anomaly**:
  ```bash
  curl -X POST http://localhost:5000/api/debug/force-after-hours
  ```
- **Trigger Continuous Overhead Anomaly**:
  ```bash
  curl -X POST http://localhost:5000/api/debug/force-overhead -H "Content-Type: application/json" -d "{\"room\":\"Work Room 1\"}"
  ```

## 🎥 Video Demo
Check out the final 3-minute hackathon demonstration video here:
[**Watch Demo (Google Drive)**](https://drive.google.com/drive/folders/1cUbWFDSGWfxKgny3tfuURVOy_0QI_DgY?usp=sharing)
