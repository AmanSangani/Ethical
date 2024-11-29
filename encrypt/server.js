const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// Generate RSA Key Pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// API to get Public Key
app.get('/public-key', (req, res) => {
  res.send(publicKey.export({ type: 'pkcs1', format: 'pem' }));
});

// API to Encrypt with RSA
app.post('/encrypt-rsa', (req, res) => {
  try {
    const { data } = req.body;
    const encryptedData = crypto.publicEncrypt(
      publicKey,
      Buffer.from(data)
    );
    res.send({ encryptedData: encryptedData.toString('base64') });
  } catch (err) {
    res.status(500).send('Encryption failed');
  }
});

// API to Decrypt with RSA
app.post('/decrypt-rsa', (req, res) => {
  try {
    const { encryptedData } = req.body;
    const decryptedData = crypto.privateDecrypt(
      privateKey,
      Buffer.from(encryptedData, 'base64')
    );
    res.send({ decryptedData: decryptedData.toString() });
  } catch (err) {
    res.status(500).send('Decryption failed');
  }
});

// API to Encrypt with AES
app.post('/encrypt-aes', (req, res) => {
  try {
    const { data, key } = req.body;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    res.send({ encryptedData, iv: iv.toString('hex') });
  } catch (err) {
    res.status(500).send('AES Encryption failed');
  }
});

// API to Decrypt with AES
app.post('/decrypt-aes', (req, res) => {
  try {
    const { encryptedData, key, iv } = req.body;
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    );
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    res.send({ decryptedData });
  } catch (err) {
    res.status(500).send('AES Decryption failed');
  }
});

// API to Hash with SHA-256
app.post('/hash', (req, res) => {
  try {
    const { data } = req.body;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    res.send({ hash });
  } catch (err) {
    res.status(500).send('Hashing failed');
  }
});

// Start the Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





// curl http://localhost:4000/public-key
// curl -X POST -H "Content-Type: application/json" -d '{"data": "Hello World"}' http://localhost:4000/encrypt-rsa
// curl -X POST -H "Content-Type: application/json" -d '{"encryptedData": "<RSA_ENCRYPTED_DATA>"}' http://localhost:4000/decrypt-rsa
// curl -X POST -H "Content-Type: application/json" -d '{"data": "Hello AES", "key": "<32_BYTE_HEX_KEY>"}' http://localhost:4000/encrypt-aes
// curl -X POST -H "Content-Type: application/json" -d '{"encryptedData": "<AES_ENCRYPTED_DATA>", "key": "<32_BYTE_HEX_KEY>", "iv": "<AES_IV>"}' http://localhost:4000/decrypt-aes
// curl -X POST -H "Content-Type: application/json" -d '{"data": "Hello Hash"}' http://localhost:4000/hash
