const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret';

const normalizeRole = (role) => {
  if (!role) return '';

  const normalized = String(role).trim().toUpperCase();
  const roleMap = {
    QUAN_LY: 'MANAGER',
    QUANLY: 'MANAGER',
    MANAGER: 'MANAGER',
    SALE: 'SALE',
    ADMIN: 'ADMIN',
    KE_TOAN: 'ACCOUNTANT',
    KETOAN: 'ACCOUNTANT',
  };

  return roleMap[normalized] || normalized;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded; // { id, username, role, ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token đã hết hạn hoặc không hợp lệ' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  normalizeRole,
};
