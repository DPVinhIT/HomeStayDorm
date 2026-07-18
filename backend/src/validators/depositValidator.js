const allowedStatuses = [ 
  'DA_THANH_TOAN',
  'CHO_THANH_TOAN',
  'DA_PHE_DUYET',
  'DA_HUY',
  'HET_HAN'
];
const validateCreateDeposit = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload không hợp lệ.'] };
  }

  if (!payload.phieu_dang_ky_id) {
    errors.push('phieu_dang_ky_id là bắt buộc.');
  }

  const amount = Number(payload.so_tien_coc);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('so_tien_coc phải là số lớn hơn 0.');
  }

  if (payload.han_thanh_toan && Number.isNaN(Date.parse(payload.han_thanh_toan))) {
    errors.push('han_thanh_toan không hợp lệ.');
  }

  return { valid: errors.length === 0, errors };
};

const validateStatusUpdate = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload không hợp lệ.'] };
  }

  const normalizedStatus = String(payload.status || '').toUpperCase();
  if (!allowedStatuses.includes(normalizedStatus)) {
    errors.push('status phải là một trong các giá trị cho phép.');
  }

  return { valid: errors.length === 0, errors, normalizedStatus };
};

module.exports = {
  allowedStatuses,
  validateCreateDeposit,
  validateStatusUpdate,
};
