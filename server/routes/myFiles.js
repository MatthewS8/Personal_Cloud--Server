const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// this should be where you have your list of files and can upload, download something or create a share link
router.get('/', async (req, res) => {  
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.userId = decoded.userId;
        req.username = decoded.username;
        console.log("decoded ", decoded);
        res.send('Hello World');
    } catch (err) {
        res.status(400).send('Invalid token');
    }
});

module.exports = router;