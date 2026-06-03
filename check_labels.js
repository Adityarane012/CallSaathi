const https = require('https');

https.get('https://huggingface.co/garystafford/wav2vec2-deepfake-voice-detector/resolve/main/config.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', console.error);
