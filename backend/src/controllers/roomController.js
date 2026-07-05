const db = require('../config/db');

exports.getAllRooms = async (req, res) => {
  try {
    // Scaffold example
    res.json({ message: 'Lấy danh sách phòng - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const { chi_nhanh_id, loai_phong, muc_gia, gioi_tinh } = req.query;

    let query = `
      SELECT id, ma_phong, loai_phong, suc_chua, gia_thue_thang, gioi_tinh_ap_dung 
      FROM phong 
      WHERE trang_thai = 'TRONG'
    `;
    const params = [];
    let paramIndex = 1;

    if (chi_nhanh_id) {
      query += ` AND chi_nhanh_id = $${paramIndex++}`;
      params.push(chi_nhanh_id);
    }
    if (loai_phong) {
      query += ` AND loai_phong ILIKE $${paramIndex++}`;
      params.push(`%${loai_phong}%`);
    }
    if (gioi_tinh) {
      query += ` AND (gioi_tinh_ap_dung = $${paramIndex++} OR gioi_tinh_ap_dung = 'Nam/Nữ' OR gioi_tinh_ap_dung IS NULL)`;
      params.push(gioi_tinh);
    }
    if (muc_gia) {
      query += ` AND gia_thue_thang <= $${paramIndex++}`;
      params.push(muc_gia);
    }

    query += ` ORDER BY gia_thue_thang ASC`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ message: 'Lỗi server khi tìm phòng trống' });
  }
};
