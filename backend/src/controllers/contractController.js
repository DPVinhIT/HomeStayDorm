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

exports.getAllRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const status = req.query.status;
    const roomType = req.query.roomType;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'Tất cả trạng thái') {
      whereClause += ` AND p.trang_thai = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (roomType && roomType !== 'Loại phòng') {
      // In the mock UI it's 'Studio', '1 Phòng ngủ'. Use ILIKE for partial match.
      whereClause += ` AND p.loai_phong_mong_muon ILIKE $${paramIndex}`;
      queryParams.push(`%${roomType}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM phieu_dang_ky_thue p ${whereClause}`;
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
        status: row.trang_thai || 'Mới'
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

exports.getAllContracts = async (req, res) => {
  try {
    res.json({ message: 'Lấy danh sách hợp đồng - Tính năng đang phát triển', data: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
