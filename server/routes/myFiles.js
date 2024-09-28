const express = require('express');
const router = express.Router();
const File = require('../models/file');
const fs = require('fs');

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

router.get('/download/:uuid', authenticateToken, async (req, res) => {
    try {
        console.log(" req is ", req);
        const file = await File.findOne({ where: { uuid: req.params.uuid, ownerId: req.userId } });

        if (!file) {
            return res.status(404).send('File not found');
        }

        res.download(file.filePath, file.fileName);
    } catch (err) {
        console.error('Error downloading file: ', err);
        res.status(500).send('Error downloading file');
    }
});


router.delete('/delete/:uuid', authenticateToken, async (req, res) => {
    try {
        const file = await File.findOne({whre: {uuid: req.params.uuid, ownerId: req.userId}});
        if (!file) {
            return res.status(404).send('File not found');
        }
        fs.unlinkSync(file.filePath);

        await File.destroy({where: {uuid: req.params.uuid, ownerId: req.userId}});
        res.status(200).send('File deleted successfully');
    } catch (err) {
        console.error('Error deleting file: ', err);
        res.status(500).send('Error deleting file');
    }
});

module.exports = router;