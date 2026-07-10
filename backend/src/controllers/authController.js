const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret keys from env or fallback
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';

const generateTokens = (user) => {
  // Access Token: 15 minutes
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh Token: 1 day
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Vui lòng cung cấp username, password và vai trò' });
  }

  try {
    // 1. Tìm tài khoản
    const userQuery = `
      SELECT t.id, t.username, t.password_hash, t.trang_thai, v.ten_vai_tro as role 
      FROM tai_khoan t
      JOIN vai_tro v ON t.vai_tro_id = v.id
      WHERE t.username = $1
    `;
    const { rows } = await db.query(userQuery, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const user = rows[0];

    console.log("User:", user);
console.log("Role gửi lên:", role);

    // 2. Kiểm tra vai trò
    if (user.role !== role) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập với vai trò này' });
    }

    // 3. Kiểm tra trạng thái
    if (user.trang_thai !== 'ACTIVE') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa hoặc không hoạt động' });
    }

    // 4. Kiểm tra mật khẩu
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Password nhập:", password);
console.log("Hash:", user.password_hash);
console.log("Password đúng?", isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // 4. Sinh JWT Token
    const tokens = generateTokens(user);

    // 5. Ghi log hoạt động
    await db.query(
      `INSERT INTO nhat_ky_hoat_dong (tai_khoan_id, hanh_dong, noi_dung) VALUES ($1, $2, $3)`,
      [user.id, 'LOGIN', 'Đăng nhập vào hệ thống']
    );

    // 6. Trả về kết quả
    res.json({
      message: 'Đăng nhập thành công',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token không tồn tại' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Nếu verify thành công, cấp lại access token
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc đã hết hạn' });
  }
};

exports.getMe = async (req, res) => {
  const db = require('../config/db');
  try {
    const userId = req.user.id;
    const query = `
      SELECT t.id as account_id, t.username, t.email as account_email, t.trang_thai as account_status, v.ten_vai_tro as role,
             n.id as employee_id, n.ma_nhan_vien, n.ho_ten, n.gioi_tinh, n.so_dien_thoai, n.email as employee_email, n.chi_nhanh_id
      FROM tai_khoan t
      JOIN vai_tro v ON t.vai_tro_id = v.id
      LEFT JOIN nhan_vien n ON n.tai_khoan_id = t.id
      WHERE t.id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message, stack: error.stack });
  }
};
