const db = require('../config/db');
const AppError = require('../utils/AppError');
const depositRepository = require('../repositories/depositRepository');
const { validateCreateDeposit, validateStatusUpdate, allowedStatuses } = require('../validators/depositValidator');

// Hàm format cho dạng danh sách (phẳng)
const normalizeDeposit = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    ma_don_coc: row.ma_don_coc,
    phieu_dang_ky_id: row.phieu_dang_ky_id,
    nguoi_dat: row.nguoi_dat,
    sdt: row.sdt,
    phong: row.phong || 'Chưa có phòng',
    toa_nha: row.toa_nha || 'Chưa có tòa nhà',
    so_tien: Number(row.so_tien_coc ?? row.so_tien ?? 0),
    trang_thai: depositRepository.mapStatusToDisplay(row.trang_thai),
    trang_thai_code: row.trang_thai,
    created_at: row.created_at,
    confirmed_at: row.confirmed_at,
  };
};

// MỚI: Hàm format cho dạng chi tiết (nested JSON) khớp 100% với Frontend
const normalizeDepositDetail = (row) => {
  if (!row) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return {
    id: row.id,
    phieu_dang_ky_id: row.phieu_dang_ky_id,
    ma_phieu: row.ma_don_coc,
    ngay_tao: formatDate(row.created_at),
    nguoi_tao: row.nguoi_tao || 'Hệ thống',
    trang_thai: depositRepository.mapStatusToDisplay(row.trang_thai),
    
    khach_thue: {
      ho_ten: row.nguoi_dat || '',
      so_dien_thoai: row.sdt || '',
      cccd: row.cccd || '',
      email: row.email || '',
      dia_chi: row.dia_chi || ''
    },
    
    thong_tin_phong: {
      ten_phong: row.phong || 'Chưa chọn',
      toa_nha_tang: `${row.toa_nha || 'Chưa có tòa nhà'} - Tầng ${row.tang || '--'}`,
      loai_phong: row.loai_phong || '',
      dien_tich: 'Chưa cập nhật', 
      gia_thue: Number(row.gia_thue || 0),
      noi_that: 'Đầy đủ cơ bản'
    },
    
    thanh_toan: {
      tien_coc_yeu_cau: Number(row.so_tien_coc || 0),
      da_thanh_toan: Number(row.da_thanh_toan || 0),
      phuong_thuc: row.phuong_thuc || 'Chưa có thông tin',
      thoi_han_giu_phong: row.han_thanh_toan ? `Đến ${formatShortDate(row.han_thanh_toan)}` : 'Không có',
      ghi_chu: row.ghi_chu || '',
      chung_tu: 'Chưa có chứng từ'
    }
  };
};

const getAllDeposits = async (filters = {}) => {
  const rows = await depositRepository.getAllDeposits(db, filters);
  return rows.map(normalizeDeposit);
};

const getDepositById = async (id) => {
  const row = await depositRepository.getDepositById(db, id);
  // SỬA ĐỔI: Sử dụng hàm format chi tiết thay vì hàm format danh sách
  return normalizeDepositDetail(row);
};

const createDeposit = async (payload, user) => {
  const validation = validateCreateDeposit(payload);
  if (!validation.valid) {
    throw new AppError(validation.errors.join(' '), 400);
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const existingDeposit = await depositRepository.getDepositByRegistrationId(client, payload.phieu_dang_ky_id);
    if (existingDeposit) {
      throw new AppError('Phiếu đăng ký này đã có phiếu đặt cọc.', 409);
    }

    const createdBy = await depositRepository.getNhanVienIdByTaiKhoanId(client, user?.id || null);
    const maDonCoc = `DDC-${Date.now().toString().slice(-6)}`;

    const newRow = await depositRepository.createDeposit(client, {
      maDonCoc,
      phieuDangKyId: payload.phieu_dang_ky_id,
      phongId: payload.phong_id || null,
      giuongId: payload.giuong_id || null,
      soGiuongThue: payload.so_giuong_thue || null,
      soTienCoc: Number(payload.so_tien_coc),
      hanThanhToan: payload.han_thanh_toan || null,
      status: 'CHO_THANH_TOAN', // Đẩy thẳng sang Kế toán
      createdBy,
    });

    await client.query('COMMIT');
    return normalizeDeposit({ ...newRow, nguoi_dat: null, sdt: null, phong: null, toa_nha: null });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Không thể tạo phiếu đặt cọc.', 500);
  } finally {
    client.release();
  }
};

const updateDepositStatus = async (id, payload, user) => {
  const validation = validateStatusUpdate(payload);
  if (!validation.valid) {
    throw new AppError(validation.errors.join(' '), 400);
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const existingDeposit = await depositRepository.getDepositById(client, id);
    if (!existingDeposit) {
      throw new AppError('Không tìm thấy phiếu đặt cọc.', 404);
    }

    const confirmedBy = await depositRepository.getNhanVienIdByTaiKhoanId(client, user?.id || null);
    
    const updatedRow = await depositRepository.updateDepositStatus(client, {
      id,
      // SỬA DÒNG NÀY: Ưu tiên lấy trực tiếp payload.status từ frontend gửi lên
      status: payload.status, 
      confirmedBy,
    });

    await client.query('COMMIT');
    return { ...updatedRow }; // Trả về thông tin cơ bản sau khi update
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    // Ghi log ra console để dễ debug nếu còn lỗi khác
    console.error("Lỗi Database khi cập nhật:", error); 
    throw new AppError('Không thể cập nhật trạng thái phiếu đặt cọc.', 500);
  } finally {
    client.release();
  }
}; 

module.exports = {
  getAllDeposits,
  getDepositById,
  createDeposit,
  updateDepositStatus,
  allowedStatuses,
};