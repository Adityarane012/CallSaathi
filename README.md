# 🎙️ CallSaathi

> **Real-time, dual-layer forensic audio deepfake detection engine.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)

CallSaathi is a sophisticated web application designed to combat synthetic voice scams and deepfakes. It captures live audio streams directly from the user's browser, extracts complex mathematical acoustic signatures, and runs them through a dual-layer detection pipeline to accurately identify neural vocoders and synthetic speech in real-time.

---

## ✨ Features

- **🔴 Live Stream Analysis:** Intercepts microphone audio and processes chunks natively in the browser using the Web Audio API.
- **📊 Real-time Acoustic Feature Extraction:** Calculates math-heavy vocal signatures instantly without blocking the UI thread:
  - **RMS Energy** (Loudness & Dynamics)
  - **Zero Crossing Rate (ZCR)** (Synthetic speech tends to have unusually low/flat ZCR)
  - **Spectral Centroid** (Frequency brightness using native C++ FFTs)
  - **MFCC Variance** (Identifies the "fingerprint" of AI voice uniformity)
- **🧠 Dual-Layer Detection Engine:**
  - **Primary Engine:** Hugging Face Inference API (`mo-tts/audio-deepfake-detection`) for state-of-the-art machine learning classification.
  - **Fallback Engine:** Groq LLM API. If the ML model is cold or overloaded, CallSaathi seamlessly falls back to feeding acoustic features (ZCR, MFCCs) into Llama 3 for rapid heuristic analysis.
- **🕵️ Forensic Reporting:** Generates a highly detailed, printable forensic report summarizing the session's peak risk, suspicious artifacts, and detection mechanisms.
- **🎨 Stunning Cyber-Forensic UI:** Built with Framer Motion, Recharts, and Tailwind CSS to deliver an immersive, hacker-style aesthetic.

---

## 🏗️ Architecture & Pipeline

1. **Capture:** `useAudioCapture` hooks into `navigator.mediaDevices.getUserMedia`.
2. **Extract:** The raw PCM stream is fed into a native `AnalyserNode`. `extractAudioFeatures()` pulls time-domain data and FFT frequency data to calculate ZCR and MFCCs.
3. **Analyze:** 
   - A `FormData` audio blob is sent to `/api/analyze-hf` for true ML detection.
   - On timeout (8s) or failure, the JSON acoustic features are instantly routed to `/api/analyze` for LLM-based heuristic scoring.
4. **Visualize:** Results stream back to the UI in real-time via Framer Motion alerts, a Recharts timeline graph, and an animated SVG score meter.
5. **Persist:** Data is pushed to `localStorage` and mapped to a final post-call `<ForensicReport />`.

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 15 (React 19, App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS Variables
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Audio Processing:** Web Audio API (`AnalyserNode`, `MediaRecorder`)

### Backend / APIs
- **Next.js Route Handlers:** Serverless API endpoints
- **Machine Learning:** Hugging Face Inference API
- **Heuristic Engine:** Groq Cloud (`llama-3.3-70b-versatile`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Groq API Key](https://console.groq.com) (Free)
- [Hugging Face Access Token](https://huggingface.co/settings/tokens) (Free, Read-only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/callsaathi.git
   cd callsaathi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   HF_API_TOKEN=your_huggingface_token_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎭 Demo Mode

If you are presenting CallSaathi at a hackathon and want to guarantee a perfectly scripted response without relying on live voice actors, append `?mode=demo` to the monitor URL. 

Demo Mode uses a simulated feature engine (`useSimulation.ts`) to perfectly mimic the progression of a deepfake call—starting safe, detecting anomalies, and eventually triggering a HIGH CONFIDENCE neural vocoder alert.

---

## 📄 License
This project is built for demonstration and hackathon purposes. Feel free to fork and modify!
