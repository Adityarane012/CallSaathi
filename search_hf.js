const https = require('https');

https.get('https://huggingface.co/api/models?search=deepfake&filter=audio-classification&limit=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const models = JSON.parse(data);
      console.log('Found models:', models.map(m => m.id));
    } catch(e) {
      console.log('Error parsing:', e);
    }
  });
}).on('error', console.error);
