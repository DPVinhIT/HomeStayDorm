const db = require('../config/db');

exports.getFinanceOverview = async (req, res) => {
  try {
    res.json({ message: 'Lấy tổng quan thu chi & đặt cọc - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
