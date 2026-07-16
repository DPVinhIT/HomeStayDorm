const db = require('../config/db');

const mapStatusToDisplay = (status) => {
  switch (status) {
    case 'DA_THANH_TOAN':
      return 'Đã thanh toán';
    case 'CHO_THANH_TOAN':
      return 'Chờ thanh toán';
    case 'DA_HUY':
      return 'Đã hủy';
    case 'HET_HAN':
      return 'Hết hạn';
    // Dự phòng các trạng thái cũ
    case 'DA_PHE_DUYET':
      return 'Đã phê duyệt';
    case 'DA_DUYET':
      return 'Đã duyệt';
    case 'TU_CHOI':
      return 'Từ chối';
    case 'CHO_XU_LY':
    default:
      return 'Chờ xử lý';
  }
};

const getAllDeposits = async (client = db, filters = {}) => {
  const { search = '', status = '' } = filters;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(`(
      dc.ma_don_coc ILIKE $${params.length + 1}
      OR kh.ho_ten ILIKE $${params.length + 2}
      OR kh.so_dien_thoai ILIKE $${params.length + 3}
    )`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push(`dc.trang_thai = $${params.length + 1}`);
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      dc.id,
      dc.ma_don_coc,
      dc.phieu_dang_ky_id,
      dc.phong_id,
      dc.giuong_id,
      dc.so_tien_coc,
      dc.han_thanh_toan,
      dc.trang_thai,
      dc.created_at,
      dc.confirmed_at,
      kh.ho_ten AS nguoi_dat,
      kh.so_dien_thoai AS sdt,
      p.ma_phong AS phong,
      c.ten_chi_nhanh AS toa_nha
    FROM don_dat_coc dc
    JOIN phieu_dang_ky_thue pdk ON dc.phieu_dang_ky_id = pdk.id
    JOIN khach_hang kh ON pdk.khach_hang_id = kh.id
    LEFT JOIN phong p ON dc.phong_id = p.id
    LEFT JOIN chi_nhanh c ON c.id = COALESCE(p.chi_nhanh_id, pdk.chi_nhanh_id)
    ${whereClause}
    ORDER BY dc.trang_thai, dc.created_at DESC
  `;

  const result = await client.query(query, params);
  return result.rows;
};

const getDepositById = async (client = db, id) => {
  const query = `
    SELECT
      -- 1. Thông tin chung phiếu cọc
      dc.id,
      dc.phieu_dang_ky_id,
      dc.ma_don_coc,
      dc.so_tien_coc,
      dc.han_thanh_toan,
      dc.trang_thai,
      dc.created_at,
      
      -- 2. Thông tin người tạo (từ bảng nhan_vien)
      nv.ho_ten AS nguoi_tao,
      
      -- 3. Thông tin khách hàng
      kh.ho_ten AS nguoi_dat,
      kh.so_dien_thoai AS sdt,
      kh.cccd,
      kh.email,
      kh.dia_chi,
      
      -- 4. Thông tin phòng (Không có dien_tich và noi_that trong DB nên ta lấy những gì có)
      p.ma_phong AS phong,
      p.tang,
      p.loai_phong,
      p.gia_thue_thang AS gia_thue,
      
      -- 5. Thông tin chi nhánh (Tòa nhà)
      c.ten_chi_nhanh AS toa_nha,
      
      -- 6. Thông tin thanh toán (LEFT JOIN sang bảng phieu_thu)
      COALESCE(pt.so_tien, 0) AS da_thanh_toan,
      pt.phuong_thuc,
      
      -- 7. Ghi chú (Lấy từ phieu_dang_ky_thue)
      pdk.ghi_chu
      
    FROM don_dat_coc dc
    JOIN phieu_dang_ky_thue pdk ON dc.phieu_dang_ky_id = pdk.id
    JOIN khach_hang kh ON pdk.khach_hang_id = kh.id
    LEFT JOIN phong p ON dc.phong_id = p.id
    LEFT JOIN chi_nhanh c ON c.id = COALESCE(p.chi_nhanh_id, pdk.chi_nhanh_id)
    
    -- Các JOIN mới thêm vào theo chuẩn Lược đồ
    LEFT JOIN nhan_vien nv ON dc.created_by = nv.id
    LEFT JOIN phieu_thu pt ON pt.don_dat_coc_id = dc.id
    
    WHERE dc.ma_don_coc = $1 OR dc.id::text = $1
    LIMIT 1
  `;

  const result = await client.query(query, [id]);
  return result.rows[0] || null;
};

const getDepositByRegistrationId = async (client = db, registrationId) => {
  const query = `
    SELECT id, ma_don_coc, trang_thai
    FROM don_dat_coc
    WHERE phieu_dang_ky_id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [registrationId]);
  return result.rows[0] || null;
};

const getNhanVienIdByTaiKhoanId = async (client = db, taiKhoanId) => {
  if (!taiKhoanId) {
    return null;
  }

  const query = `
    SELECT id
    FROM nhan_vien
    WHERE tai_khoan_id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [taiKhoanId]);
  return result.rows[0]?.id || null;
};

const createDeposit = async (client = db, payload) => {
  const query = `
    INSERT INTO don_dat_coc (
      ma_don_coc,
      phieu_dang_ky_id,
      phong_id,
      giuong_id,
      so_giuong_thue,
      so_tien_coc,
      han_thanh_toan,
      trang_thai,
      created_by,
      confirmed_by,
      confirmed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, ma_don_coc, phieu_dang_ky_id, phong_id, giuong_id, so_giuong_thue, so_tien_coc, han_thanh_toan, trang_thai, created_at
  `;

  const values = [
    payload.maDonCoc,
    payload.phieuDangKyId,
    payload.phongId || null,
    payload.giuongId || null,
    payload.soGiuongThue || null,
    payload.soTienCoc,
    payload.hanThanhToan || null,
    payload.status,
    payload.createdBy || null,
    null,
    null,
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};

const updateDepositStatus = async (client = db, payload) => {
  const query = `
    UPDATE don_dat_coc
    SET
      trang_thai = $1,
      confirmed_by = $2,
      confirmed_at = CURRENT_TIMESTAMP
    -- SỬA DÒNG DƯỚI ĐÂY: Hỗ trợ tìm theo cả ID (số) và ma_don_coc (chuỗi)
    WHERE ma_don_coc = $3 OR id::text = $3
    RETURNING id, ma_don_coc, phieu_dang_ky_id, phong_id, giuong_id, so_giuong_thue, so_tien_coc, han_thanh_toan, trang_thai, created_at, confirmed_at
  `;

  const result = await client.query(query, [payload.status, payload.confirmedBy || null, payload.id]);
  return result.rows[0];
};

module.exports = {
  getAllDeposits,
  getDepositById,
  getDepositByRegistrationId,
  getNhanVienIdByTaiKhoanId,
  createDeposit,
  updateDepositStatus,
  mapStatusToDisplay,
};
