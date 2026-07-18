const db = require('./src/config/db');

async function test() {
  const client = await db.pool.connect();
  try {
    const res = await client.query('SELECT * FROM hop_dong_thue ORDER BY id DESC LIMIT 5');
    console.log("hop_dong_thue:", res.rows);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}
test();
