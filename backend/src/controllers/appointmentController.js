const db = require('../config/db');

exports.getAppointments = async (req, res) => {
  try {
    res.json({ message: 'Lấy danh sách lịch hẹn & bàn giao - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
