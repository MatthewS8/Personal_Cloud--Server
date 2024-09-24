const fs = require('fs');
const ACCESS_TOKEN_SECRET = fs.readFileSync('./server.key').toString();

module.exports = { ACCESS_TOKEN_SECRET };