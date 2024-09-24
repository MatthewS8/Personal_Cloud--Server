const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { where } = require('sequelize');
const { ACCESS_TOKEN_SECRET } = require('../config/config');

const tokens = new Map();
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
        payload = { userId: user.userID, username: user.username, loginTime: Date.now() }
        const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
        tokens.set(user.id, payload);
        res.send({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
