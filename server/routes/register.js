const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../db');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

router.post('/', async (req, res) => {
    console.log(req.body);
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      try {
          const result = await pool.query(
              'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
              [username, hashedPassword]
          );
          res.status(201).send('User registered');
      } catch (err) {
          console.error(err);
          res.status(500).send('Error registering user');
      }
  });

module.exports = router;
