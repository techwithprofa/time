const { Pool } = require('pg');
require('dotenv').config(); // To load environment variables from .env file

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection (optional, but good for immediate feedback)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for connection test', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing query for connection test', err.stack);
    }
    console.log('Database connected successfully:', result.rows[0].now);
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions or direct use
};
