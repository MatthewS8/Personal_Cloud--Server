const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

router.post('/', async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).send(`${user} registered`);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
