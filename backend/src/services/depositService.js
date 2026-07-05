const db = require('../config/db');
const AppError = require('../utils/AppError');
const depositRepository = require('../repositories/depositRepository');
const { validateCreateDeposit, validateStatusUpdate, allowedStatuses } = require('../validators/depositValidator');

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

const getAllDeposits = async (filters = {}) => {
  const rows = await depositRepository.getAllDeposits(db, filters);
  return rows.map(normalizeDeposit);
};

const getDepositById = async (id) => {
  const row = await depositRepository.getDepositById(db, id);
  return normalizeDeposit(row);
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
      status: 'CHO_XU_LY',
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
      status: validation.normalizedStatus,
      confirmedBy,
    });

    await client.query('COMMIT');
    return normalizeDeposit({ ...updatedRow, nguoi_dat: existingDeposit.nguoi_dat, sdt: existingDeposit.sdt, phong: existingDeposit.phong, toa_nha: existingDeposit.toa_nha });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
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
