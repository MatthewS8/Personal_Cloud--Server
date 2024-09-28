const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authenticateToken = require('../middlewares/authenticatorHandler');
const File = require('../models/file');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }

        const fileUUID = uuidv4();
        // add the uuid to the file
        const newFile = await File.create({
            fileName: file.originalname,
            uuid: fileUUID,
            filePath: file.path,
            createdAt: new Date(),
            ownerId: req.userId
        });
        
        res.status(201).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;