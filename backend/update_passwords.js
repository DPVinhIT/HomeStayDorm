require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function update() {
  try {
    const hash = await bcrypt.hash('Password@123', 10);
    console.log('New hash:', hash);
    const result = await pool.query('UPDATE tai_khoan SET password_hash = $1', [hash]);
    console.log(`Updated ${result.rowCount} accounts to Password@123`);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

update();
