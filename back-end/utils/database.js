const mysql = require('mysql2');


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'database_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


module.exports = pool.promise();
