const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'ArthurSonin',
    password: process.env.DB_PASSWORD || '56756727127ger!',
    database: process.env.DB_NAME || 'gg',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
