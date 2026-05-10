const https = require('https');

const options = {
  hostname: 'rjnutnbgeqesyzokqrdmx.supabase.co',
  port: 443,
  method: 'GET',
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  const cert = res.socket.getPeerCertificate();
  console.log('Valid from:', cert.valid_from);
  console.log('Valid to:', cert.valid_to);
  console.log('Issuer:', cert.issuer);
  console.log('Subject:', cert.subject);
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
