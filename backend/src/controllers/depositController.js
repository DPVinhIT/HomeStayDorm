const depositService = require('../services/depositService');
const AppError = require('../utils/AppError');

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const sendError = (res, error) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  console.error('Deposit controller error:', error);
  return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý phiếu đặt cọc.' });
};

exports.getAlldeposit = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
    };

    const deposits = await depositService.getAllDeposits(filters);
    return sendSuccess(res, deposits);
  } catch (error) {
    return sendError(res, error);
  }
};

exports.getDepositById = async (req, res) => {
  try {
    const deposit = await depositService.getDepositById(req.params.id);
    if (!deposit) {
      throw new AppError('Không tìm thấy phiếu đặt cọc.', 404);
    }

    return sendSuccess(res, deposit);
  } catch (error) {
    return sendError(res, error);
  }
};

exports.createDeposit = async (req, res) => {
  try {
    const deposit = await depositService.createDeposit(req.body, req.user);
    return sendSuccess(res, deposit, 201);
  } catch (error) {
    return sendError(res, error);
  }
};

exports.updateDepositStatus = async (req, res) => {
  try {
    const deposit = await depositService.updateDepositStatus(req.params.id, req.body, req.user);
    return sendSuccess(res, deposit);
  } catch (error) {
    return sendError(res, error);
  }
};