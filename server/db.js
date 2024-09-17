const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

const connectWithRetry = () => {
    pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `, (err, res) => {
        if (err) {
        console.error( "create table error ", err);
        setTimeout(connectWithRetry, 3000);
        } else {
            console.log('Users table is ready');
        }
    });
};
  
connectWithRetry();

module.exports = pool;