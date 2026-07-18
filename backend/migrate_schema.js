const db = require('./src/config/db');

async function migrate() {
  const client = await db.pool.connect();
  try {
    await client.query(`
      ALTER TABLE phieu_dang_ky_thue 
      ADD COLUMN IF NOT EXISTS phong_id BIGINT REFERENCES phong(id),
      ADD COLUMN IF NOT EXISTS giuong_id BIGINT REFERENCES giuong(id);
    `);
    console.log("Migration successful");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
