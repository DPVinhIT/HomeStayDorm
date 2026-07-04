const db = require('../config/db');

exports.getAllContracts = async (req, res) => {
  try {
    res.json({ message: 'Lấy danh sách hợp đồng & phiếu đăng ký - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
