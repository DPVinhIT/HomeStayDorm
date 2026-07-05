const db = require('../config/db');

// Helper function to get initials from a name
const getInitials = (name) => {
  if (!name) return 'UN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper function to assign a consistent random color based on initials
const getColorClass = (initials) => {
  const colors = [
    'bg-green-100 text-green-700',
    'bg-blue-100 text-blue-700',
    'bg-red-100 text-red-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-gray-200 text-gray-700'
  ];
  let sum = 0;
  for (let i = 0; i < initials.length; i++) {
    sum += initials.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

// Helper để đồng bộ hóa các trạng thái rác trong DB thành chuẩn Tiếng Việt
const formatStatus = (status) => {
  if (!status) return 'Mới';
  const s = status.trim().toUpperCase();
  if (s === 'CHO_XU_LY' || s === 'CHỜ XỬ LÝ') return 'Chờ xử lý';
  if (s === 'DANG_XU_LY' || s === 'ĐANG XỬ LÝ' || s === 'DANG XU LY') return 'Đang xử lý';
  if (s === 'DA_DUYET' || s === 'ĐÃ DUYỆT' || s === 'DA DUYET') return 'Đã duyệt';
  if (s === 'TU_CHOI' || s === 'TỪ CHỐI' || s === 'TU CHOI') return 'Từ chối';
  if (s === 'MOI' || s === 'MỚI') return 'Mới';
  
  // Format chữ hoa chữ cái đầu cho các trạng thái khác nếu có
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const status = req.query.status;
    const roomType = req.query.roomType;
    const search = req.query.search;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'Tất cả trạng thái') {
      whereClause += ` AND p.trang_thai = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (roomType && roomType !== 'Loại phòng') {
      whereClause += ` AND p.loai_phong_mong_muon ILIKE $${paramIndex}`;
      queryParams.push(`%${roomType}%`);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      const isPhoneNumber = /^\d+$/.test(search.trim());
      if (isPhoneNumber) {
        whereClause += ` AND k.so_dien_thoai LIKE $${paramIndex}`;
      } else {
        whereClause += ` AND k.ho_ten ILIKE $${paramIndex}`;
      }
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      ${whereClause}
    `;
    const { rows: countRows } = await db.query(countQuery, queryParams);
    const total = parseInt(countRows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    queryParams.push(limit);
    const limitIndex = paramIndex;
    paramIndex++;
    queryParams.push(offset);
    const offsetIndex = paramIndex;

    const query = `
      SELECT 
        p.ma_phieu, 
        k.ho_ten, 
        k.so_dien_thoai, 
        p.loai_phong_mong_muon, 
        p.created_at, 
        p.trang_thai
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    const { rows } = await db.query(query, queryParams);

    const formattedData = rows.map(row => {
      const dateObj = new Date(row.created_at);
      const dateStr = dateObj.toLocaleDateString('vi-VN');
      const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const initials = getInitials(row.ho_ten);

      return {
        id: row.ma_phieu,
        customer: {
          name: row.ho_ten,
          phone: row.so_dien_thoai || 'Chưa cập nhật',
          initials: initials,
          color: getColorClass(initials)
        },
        roomType: row.loai_phong_mong_muon || 'Chưa cập nhật',
        date: dateStr,
        time: timeStr,
        status: formatStatus(row.trang_thai)
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách phiếu đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phiếu đăng ký' });
  }
};

exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.ma_phieu, p.trang_thai, p.loai_phong_mong_muon, p.muc_gia_mong_muon, 
        p.ngay_du_kien_vao_o, p.thoi_han_thue_thang, p.ghi_chu, p.so_luong_nguoi,
        k.ho_ten, k.so_dien_thoai, k.email, k.cccd, k.nghe_nghiep,
        c.ten_chi_nhanh
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN chi_nhanh c ON p.chi_nhanh_id = c.id
      WHERE p.ma_phieu = $1
    `;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    const row = rows[0];
    const formattedData = {
      id: row.ma_phieu,
      status: formatStatus(row.trang_thai),
      customer: {
        name: row.ho_ten,
        phone: row.so_dien_thoai || 'Chưa cập nhật',
        email: row.email || 'Chưa cập nhật',
        cccd: row.cccd || 'Chưa cập nhật',
        job: row.nghe_nghiep || 'Chưa cập nhật'
      },
      room: {
        branch: row.ten_chi_nhanh || 'Chưa phân bổ',
        type: row.loai_phong_mong_muon || 'Chưa cập nhật',
        price: row.muc_gia_mong_muon ? `${parseInt(row.muc_gia_mong_muon).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật',
        moveInDate: row.ngay_du_kien_vao_o ? new Date(row.ngay_du_kien_vao_o).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
        duration: row.thoi_han_thue_thang ? `${row.thoi_han_thue_thang} tháng` : 'Chưa cập nhật',
        note: row.ghi_chu || 'Không có ghi chú'
      },
      attachments: [] // Dữ liệu tệp đính kèm sẽ được lấy từ bảng đính kèm nếu có (tạm thời để mảng rỗng)
    };

    res.status(200).json({
      status: 'success',
      data: formattedData
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết phiếu đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
    }

    const query = `
      UPDATE phieu_dang_ky_thue
      SET trang_thai = $1
      WHERE ma_phieu = $2
      RETURNING ma_phieu, trang_thai
    `;
    const { rows } = await db.query(query, [status, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái thành công',
      data: rows[0]
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái phiếu đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    res.json({ message: 'Lấy danh sách hợp đồng - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
