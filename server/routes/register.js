const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await User.create({ username, password: hashedPassword });
    const userDir = path.join(__dirname, '..', 'uploads', username);
    fs.mkdirSync(userDir);
    res.status(201).json({message: `${username} registered`});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
