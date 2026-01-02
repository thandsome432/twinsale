const { Pool } = require('pg');

// This tells the app: "If there is a cloud URL, use it. Otherwise, use local."
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://taye:twinsale123@localhost:5432/twinsale',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Cloud needs SSL
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};