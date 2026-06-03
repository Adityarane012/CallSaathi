async function checkOllama() {
  console.log("--- Checking Local Ollama Service ---");
  try {
    const response = await fetch('http://127.0.0.1:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }
    const data = await response.json();
    console.log("Ollama Status: ACTIVE");
    console.log("Available Models:");
    data.models.forEach(m => {
      console.log(`- ${m.name} (Size: ${(m.size / (1024*1024*1024)).toFixed(2)} GB, Family: ${m.details?.family || "unknown"})`);
    });
  } catch (error) {
    console.error("Ollama connection FAILED:", error.message);
    console.log("Ensure Ollama is running on http://127.0.0.1:11434");
  }
}

checkOllama();
