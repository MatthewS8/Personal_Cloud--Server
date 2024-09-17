const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');

const pool = require('../db');

const tokens = new Map();
router.post('/', async (req, res) => {  
  const { username, password } = req.body;
  try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
        payload = {userId: user.id, username: user.username, loginTime: Date.now()}
        const token = jwt.sign(payload, 'secretkey');
        tokens.set(user.id, payload);
        res.send({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
