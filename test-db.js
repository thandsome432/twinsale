const db = require('./db');

async function testConnection() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('🎉 Database Connection Successful!');
    console.log('Server Time:', res.rows[0].now);
  } catch (err) {
    console.error('Connection Failed:', err);
  }
}

testConnection();