const db = require('./src/config/db');

async function run() {
  try {
    await db.query('ALTER TABLE don_dat_coc DROP CONSTRAINT IF EXISTS chk_don_dat_coc_trang_thai');
    await db.query("ALTER TABLE don_dat_coc ADD CONSTRAINT chk_don_dat_coc_trang_thai CHECK (trang_thai IN ('KHOI_TAO', 'CHO_XU_LY', 'CHO_THANH_TOAN', 'DA_THANH_TOAN', 'DA_PHE_DUYET', 'DA_HUY', 'HET_HAN'))");
    console.log("Constraint updated successfully");
  } catch (err) {
    console.error("Error updating constraint:", err);
  } finally {
    process.exit(0);
  }
}
run();
