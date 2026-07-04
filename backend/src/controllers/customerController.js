const db = require('../config/db');

exports.searchCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại' });
    }

    const query = `
      SELECT id, ho_ten, TO_CHAR(ngay_sinh, 'YYYY-MM-DD') as ngay_sinh, gioi_tinh, cccd, so_dien_thoai, email, dia_chi, quoc_tich, nghe_nghiep
      FROM khach_hang
      WHERE so_dien_thoai = $1
    `;
    const { rows } = await db.query(query, [phone]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error searching customer:', error);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm khách hàng' });
  }
};
