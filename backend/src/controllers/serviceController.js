const db = require('../config/db');
const crypto = require('crypto');

// 1. LẤY TẤT CẢ DỊCH VỤ
exports.getAllServices = async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM dich_vu 
      WHERE trang_thai = 'ACTIVE' 
      ORDER BY id ASC
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách dịch vụ' });
  }
};

// 2. LẤY MẪU ĐIỀU KHOẢN HỢP ĐỒNG
exports.getContractTemplates = async (req, res) => {
  try {
    const query = `
      SELECT id, ten_mau, quy_dinh_hoan_coc, noi_quy, dieu_khoan_vi_pham 
      FROM mau_hop_dong 
      WHERE trang_thai = 'ACTIVE'
    `;
    
    const { rows } = await db.query(query);

    const template = rows[0] || { 
      quy_dinh_hoan_coc: '', 
      noi_quy: '', 
      dieu_khoan_vi_pham: '' 
    };
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy mẫu hợp đồng' });
  }
};