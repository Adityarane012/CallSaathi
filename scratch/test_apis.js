const fs = require('fs');
const path = require('path');

const envPath = 'c:\\Users\\Aditya Rane\\Downloads\\Coding Projects\\CallSaathi\\.env.local';
let env = {};
try {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
} catch (e) {
  console.error("Failed to read .env.local from path:", envPath, e.message);
  process.exit(1);
}

const GROQ_API_KEY = env.GROQ_API_KEY;
const HF_API_TOKEN = env.HF_API_TOKEN;

async function testHuggingFace() {
  console.log("\n--- Testing Hugging Face Inference API ---");
  try {
    const dummyAudio = Buffer.alloc(1000); // 1KB of empty data
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mo-tts/audio-deepfake-detection',
      {
        headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
        method: 'POST',
        body: dummyAudio
      }
    );

    if (response.status === 503) {
      console.log("HF Response Status: Model is loading (503 Service Unavailable).");
      return;
    }

    if (!response.ok) {
      throw new Error(`HF API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("HF Response Status: SUCCESS");
    console.log("Response Content:", JSON.stringify(data));
  } catch (error) {
    console.error("HF API Test FAILED:", error);
  }
}

testHuggingFace();
