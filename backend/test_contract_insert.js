const db = require('./src/config/db');

async function test() {
  const client = await db.pool.connect();
  try {
    const contractSql = `
      INSERT INTO hop_dong_thue (
        ma_hop_dong, 
        phieu_dang_ky_id, 
        giuong_id, 
        ngay_bat_dau, 
        ngay_ket_thuc, 
        thoi_han_thue_thang, 
        gia_thue_thang, 
        tien_coc, 
        ky_thanh_toan, 
        trang_thai, 
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Chờ thanh toán', $10)
    `;

    await client.query(contractSql, [
      'HD-TEST1234',            
      22,       
      null,      
      '2026-07-14',           
      '2027-01-14',          
      6,    
      3000000,         
      3000000,               
      '1_THANG',          
      1              
    ]);
    console.log("Success");
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    client.release();
    process.exit(0);
  }
}
test();
