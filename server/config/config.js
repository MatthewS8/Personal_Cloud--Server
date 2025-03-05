const fs = require("fs");
const crypto = require("crypto");
const ACCESS_TOKEN_SECRET = fs.readFileSync("./certificates/ATSecret.pem").toString();
const PUBLIC_RSA_KEY = fs.readFileSync("./certificates/public_key.pem").toString();

// create private key
const privateKeyFromFs = fs
  .readFileSync("./certificates/private_rsa_key.key")
  .toString("utf-8");
const pemHeader = "-----BEGIN PRIVATE KEY-----";
const pemFooter = "-----END PRIVATE KEY-----";
const pemContents = privateKeyFromFs.substring(
  pemHeader.length,
  privateKeyFromFs.length - pemFooter.length
);
const binaryDerString = pemContents.replace(/\s+/g, "");
const binaryDer = Buffer.from(binaryDerString, "base64");

// Import the private key
const PRIVATE_RSA_KEY = crypto.createPrivateKey({
  key: binaryDer,
  format: "der",
  type: "pkcs8",
});

const STORAGE_KEY = fs.readFileSync("./certificates/storage.pem");

module.exports = {
  ACCESS_TOKEN_SECRET,
  PUBLIC_RSA_KEY,
  PRIVATE_RSA_KEY,
  STORAGE_KEY,
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
};
