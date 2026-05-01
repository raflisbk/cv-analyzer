const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

const form = new FormData();
form.append('file', fs.createReadStream('package.json'));

const options = {
  method: 'POST',
  host: 'localhost',
  port: 8000,
  path: '/api/v1/upload',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', (err) => console.error('Error:', err.message));
form.pipe(req);
