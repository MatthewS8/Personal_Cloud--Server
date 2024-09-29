const express = require('express');
const { KEY_TOKEN } = require('../config/config');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const authenticateToken = require('../middlewares/authenticatorHandler');

router.post('/', authenticateToken, async (req, res) => {
  try {
        if (req.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }
        const users = await User.findAll();
        
        res.json(users.map(user => delete user.password));
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

router.delete('/delete/:userID', authenticateToken, async (req, res) => {
    try {
        if (req.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).send('User not found');
        }
        await user.destroy();
        res.status(200).send('User deleted successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

router.post('/change_role/:userID', authenticateToken, async (req, res) => {
    try {
        if (req.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.role = req.body.role;
        await user.save();
        res.status(200).send('Role changed successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

router.post('/change_password/:userID', authenticateToken, async (req, res) => {
    try {
        if (req.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        await user.save();
        res.status(200).send('Password changed successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

router.post('/register', authenticateToken, async (req, res) => {
    try {
        if (req.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }
        const { username, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ username, password: hashedPassword, role });
        res.status(200).send('User created successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});


module.exports = router;