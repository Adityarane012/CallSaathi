const https = require('https');

const req = https.request('https://api-inference.huggingface.co/models/garystafford/wav2vec2-deepfake-voice-detector', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.HF_API_TOKEN || ''}`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', console.error);
req.end('dummy data');
