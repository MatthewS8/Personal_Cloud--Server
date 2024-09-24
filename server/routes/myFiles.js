const express = require('express');
const router = express.Router();
const File = require('../models/file');

const authenticateToken = require('../middlewares/authenticatorHandler');

router.get('/', authenticateToken, async (req, res) => {  
    try {
        const fileList = await File.findAll({ where: { ownerId: req.userId } });

        if (fileList.length === 0) {
            res.json({});
        } else {
            console.log("Found these files");
            res.json(fileList);
        }
    } catch (err) {
        console.error('Error on validating token: ', err);
        res.status(400).send('Invalid token');
    }
});

module.exports = router;