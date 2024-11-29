const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet()); // Adds security headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/testdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Schema and Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', UserSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.send('User saved successfully!');
  } catch (error) {
    res.status(500).send('Error saving user!');
  }
});

// ----------------------------------------------------------------
// const { body, validationResult } = require('express-validator');

// app.post(
//   '/submit',
//   [
//     body('name').trim().escape(),
//     body('email').isEmail().normalizeEmail(),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//       const { name, email } = req.body;
//       const user = new User({ name, email });
//       await user.save();
//       res.send('User saved successfully!');
//     } catch (error) {
//       res.status(500).send('Error saving user!');
//     }
//   }
// );
// ----------------------------------------------------------------
// const user = await User.findOne({ email: req.body.email });
// if (!user) {
//   res.status(404).send('User not found');
// }
// ----------------------------------------------------------------


// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
