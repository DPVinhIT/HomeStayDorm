const db = require('./src/config/db');
async function run() {
  const client = await db.pool.connect();
  try {
    await client.query("UPDATE hop_dong_thue SET trang_thai = 'Chờ ký' WHERE trang_thai = 'Chờ thanh toán'");
    console.log('Done');
  } finally {
    client.release();
    process.exit(0);
  }
}
run();
