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
