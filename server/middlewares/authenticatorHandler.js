const jwt = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET } = require('../config/config');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.userId = payload?.userId;
        req.username = payload?.username;
        req.role = payload?.role;

        next();
    });
};

module.exports = authenticateToken;
