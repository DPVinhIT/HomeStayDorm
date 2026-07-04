const db = require('../config/db');

exports.getCheckoutRequests = async (req, res) => {
  try {
    res.json({ message: 'Lấy danh sách yêu cầu trả phòng - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
