const db = require('./src/config/db');

async function fix() {
  const client = await db.pool.connect();
  try {
    // Sửa lỗi sequence id
    await client.query(`SELECT setval('don_dat_coc_id_seq', (SELECT MAX(id) FROM don_dat_coc));`);
    console.log("Đã cập nhật sequence ID");

    // Lặp lại logic tạo
    const res = await client.query(`
      SELECT p.id as phieu_id, h.id as hop_dong_id, h.tien_coc, h.giuong_id, h.created_by
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      JOIN hop_dong_thue h ON h.phieu_dang_ky_id = p.id
      WHERE k.ho_ten ILIKE '%Vinh%'
    `);
    
    for (const row of res.rows) {
      const depRes = await client.query('SELECT id FROM don_dat_coc WHERE phieu_dang_ky_id = $1', [row.phieu_id]);
      if (depRes.rows.length === 0) {
        const ma_don_coc = `DDC-${Date.now().toString().slice(-6)}`;
        await client.query(`
          INSERT INTO don_dat_coc (ma_don_coc, phieu_dang_ky_id, giuong_id, so_tien_coc, trang_thai, created_by)
          VALUES ($1, $2, $3, $4, 'CHO_THANH_TOAN', $5)
        `, [ma_don_coc, row.phieu_id, row.giuong_id, row.tien_coc, row.created_by]);
        console.log("Đã tạo đơn đặt cọc thành công cho phiếu ID:", row.phieu_id);
      } else {
        console.log("Phiếu ID", row.phieu_id, "đã có đơn đặt cọc.");
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    process.exit(0);
  }
}
fix();
