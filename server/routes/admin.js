const express = require('express');
const { KEY_TOKEN } = require('../config/config');
const router = express.Router();

const User = require('../models/user');

router.post('/', async (req, res) => {  
  const { username, password } = req.body;
  try {
        const user = await User.findOne({where: {username}});
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
        payload = {userId: user.userID, username: user.username, loginTime: Date.now()}
        const token = jwt.sign(payload, KEY_TOKEN);
        tokens.set(user.id, payload);
        res.send({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

module.exports = router;