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
        p.phong_id, p.giuong_id,
        k.ho_ten, k.so_dien_thoai, k.email, k.cccd, k.nghe_nghiep,
        c.ten_chi_nhanh, c.id as chi_nhanh_id,
        ph.ma_phong, g.ma_giuong
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN chi_nhanh c ON p.chi_nhanh_id = c.id
      LEFT JOIN phong ph ON p.phong_id = ph.id
      LEFT JOIN giuong g ON p.giuong_id = g.id
      WHERE p.ma_phieu = $1
    `;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    // Lấy thông tin các phòng đã chọn (lịch hẹn)
    const appointmentsQuery = `
      SELECT ph.id, ph.ma_phong, ph.loai_phong, ph.gia_thue_thang, cn.ten_chi_nhanh, cn.id as chi_nhanh_id
      FROM lich_hen lh
      JOIN phong ph ON lh.phong_id = ph.id
      LEFT JOIN chi_nhanh cn ON ph.chi_nhanh_id = cn.id
      JOIN phieu_dang_ky_thue p ON lh.phieu_dang_ky_id = p.id
      WHERE p.ma_phieu = $1
    `;
    const appointmentsResult = await db.query(appointmentsQuery, [id]);
    const row = rows[0];
    const selectedRooms = appointmentsResult.rows;
    
    // Fallback thông tin phòng từ danh sách phòng đã xem nếu phiếu đăng ký chưa cập nhật
    const fallbackRoom = selectedRooms.length > 0 ? selectedRooms[0] : null;

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
        branch: row.ten_chi_nhanh || (fallbackRoom ? fallbackRoom.ten_chi_nhanh : 'Chưa phân bổ'),
        chi_nhanh_id: row.chi_nhanh_id || (fallbackRoom ? fallbackRoom.chi_nhanh_id : null),
        type: row.loai_phong_mong_muon || (fallbackRoom ? fallbackRoom.loai_phong : 'Chưa cập nhật'),
        price: row.muc_gia_mong_muon ? `${parseInt(row.muc_gia_mong_muon).toLocaleString('vi-VN')} VNĐ` : (fallbackRoom ? `${parseInt(fallbackRoom.gia_thue_thang).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'),
        moveInDate: row.ngay_du_kien_vao_o ? new Date(row.ngay_du_kien_vao_o).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
        duration: row.thoi_han_thue_thang ? `${row.thoi_han_thue_thang} tháng` : 'Chưa cập nhật',
        note: row.ghi_chu || 'Không có ghi chú',
        phong_id: row.phong_id,
        giuong_id: row.giuong_id,
        ma_phong: row.ma_phong,
        ma_giuong: row.ma_giuong
      },
      attachments: [], // Dữ liệu tệp đính kèm sẽ được lấy từ bảng đính kèm nếu có (tạm thời để mảng rỗng)
      selected_rooms: selectedRooms // Các phòng Sale đã chọn
    };

    // Lấy thông tin phiếu đặt cọc tương ứng nếu có
    const depositQuery = `SELECT * FROM don_dat_coc WHERE phieu_dang_ky_id = (SELECT id FROM phieu_dang_ky_thue WHERE ma_phieu = $1 LIMIT 1)`;
    const depositResult = await db.query(depositQuery, [id]);
    if (depositResult.rows.length > 0) {
      formattedData.don_dat_coc = depositResult.rows[0];
    } else {
      formattedData.don_dat_coc = null;
    }

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
    const { status, phong_id, giuong_id } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
    }

    const query = `
      UPDATE phieu_dang_ky_thue
      SET trang_thai = $1, phong_id = COALESCE($3, phong_id), giuong_id = COALESCE($4, giuong_id)
      WHERE ma_phieu = $2
      RETURNING id, ma_phieu, trang_thai, phong_id, giuong_id
    `;
    const { rows } = await db.query(query, [status, id, phong_id || null, giuong_id || null]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    const updatedReg = rows[0];

    // Xử lý tự động cập nhật Phiếu Đặt Cọc (don_dat_coc) khi phiếu được Duyệt và Xếp phòng
    if (status === 'Đã duyệt' && phong_id) {
      // Lấy thông tin phòng để tính tiền cọc
      const roomRes = await db.query('SELECT gia_thue_thang FROM phong WHERE id = $1', [phong_id]);
      if (roomRes.rows.length > 0) {
        const giaThue = Number(roomRes.rows[0].gia_thue_thang);
        const tienCoc = giaThue * 2; // Tiền cọc mặc định = 2 tháng tiền phòng

        // Cập nhật phiếu đặt cọc tương ứng (chuyển sang CHO_THANH_TOAN để Kế toán thấy)
        await db.query(`
          UPDATE don_dat_coc
          SET phong_id = $1, giuong_id = $2, so_tien_coc = $3, trang_thai = 'CHO_THANH_TOAN'
          WHERE phieu_dang_ky_id = $4 AND trang_thai = 'KHOI_TAO'
        `, [phong_id, giuong_id || null, tienCoc, updatedReg.id]);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái thành công',
      data: updatedReg
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái phiếu đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const query = `
      SELECT 
        h.ma_hop_dong, 
        p.ma_phieu AS ma_phieu_dang_ky, 
        k.ho_ten AS ten_khach_hang, 
        h.trang_thai, 
        nv1.ho_ten AS nguoi_tao, 
        nv2.ho_ten AS nguoi_phe_duyet, 
        h.created_at
      FROM hop_dong_thue h
      JOIN phieu_dang_ky_thue p ON h.phieu_dang_ky_id = p.id
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN nhan_vien nv1 ON h.created_by = nv1.id
      LEFT JOIN nhan_vien nv2 ON h.approved_by = nv2.id
      ORDER BY h.created_at DESC;
    `;

    const result = await db.pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hợp đồng:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống máy chủ.' 
    });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params; // id = ma_hop_dong
    const query = `
      SELECT 
        h.*,
        p.ma_phieu AS ma_phieu_dang_ky,
        p.id AS phieu_dang_ky_id_num,
        k.ho_ten AS khach_hang_ten,
        k.so_dien_thoai AS khach_hang_sdt,
        k.email AS khach_hang_email,
        k.cccd AS khach_hang_cccd,
        k.dia_chi AS khach_hang_dia_chi,
        nv1.ho_ten AS nguoi_tao_ten,
        nv2.ho_ten AS nguoi_phe_duyet_ten,
        ph.ma_phong,
        ph.loai_phong,
        ph.gia_thue_thang AS phong_gia_thue,
        ph.tang AS phong_tang,
        cn.ten_chi_nhanh,
        g.ma_giuong,
        g.gia_thue_thang AS giuong_gia_thue
      FROM hop_dong_thue h
      JOIN phieu_dang_ky_thue p ON h.phieu_dang_ky_id = p.id
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN nhan_vien nv1 ON h.created_by = nv1.id
      LEFT JOIN nhan_vien nv2 ON h.approved_by = nv2.id
      LEFT JOIN giuong g ON h.giuong_id = g.id
      LEFT JOIN phong ph ON g.phong_id = ph.id
      LEFT JOIN chi_nhanh cn ON ph.chi_nhanh_id = cn.id
      WHERE h.ma_hop_dong = $1
    `;
    const result = await db.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hợp đồng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ.' });
  }
};

exports.createContract = async (req, res) => {
  const { 
      phieu_dang_ky_id, 
      giuong_id, 
      ngay_bat_dau, 
      ngay_ket_thuc, 
      thoi_han_thue_thang,
      gia_thue_thang, 
      tien_coc, 
      ky_thanh_toan,
      mau_hop_dong_id
  } = req.body;


  // 1. Kiểm tra đầu vào bắt buộc
  if (!phieu_dang_ky_id || !ngay_bat_dau || !ngay_ket_thuc) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
  }

  const client = await db.pool.connect();
  try {
    const account_id = req.user.id; 

    if (!account_id) {
      return res.status(401).json({ message: "Không xác định được người tạo hợp đồng." });
    }
    await client.query('BEGIN');

    // Get nhan_vien id from tai_khoan id
    const nvRes = await client.query('SELECT id FROM nhan_vien WHERE tai_khoan_id = $1', [account_id]);
    const created_by = nvRes.rows.length > 0 ? nvRes.rows[0].id : null;

    // 2. Kiểm tra phiếu đăng ký (tên bảng là phieu_dang_ky_thue)
    const resReg = await client.query(
      'SELECT trang_thai FROM phieu_dang_ky_thue WHERE id = $1 FOR UPDATE',
      [phieu_dang_ky_id]
    );

    const registration = resReg.rows[0];

    if (!registration) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đăng ký.' });
    }

    if (registration.trang_thai !== 'Đã duyệt') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Phiếu đăng ký chưa được duyệt!' });
    }

    // 2.5 Kiểm tra xem phiếu đăng ký đã có hợp đồng chưa
    const existingContract = await client.query(
      'SELECT id FROM hop_dong_thue WHERE phieu_dang_ky_id = $1',
      [phieu_dang_ky_id]
    );

    if (existingContract.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Hợp đồng cho phiếu đăng ký này đã tồn tại!' });
    }

    // 2.6 Kiểm tra Phiếu đặt cọc đã được phê duyệt chưa
    const existingDeposit = await client.query('SELECT trang_thai FROM don_dat_coc WHERE phieu_dang_ky_id = $1', [phieu_dang_ky_id]);
    if (existingDeposit.rows.length > 0) {
      const depositStatus = existingDeposit.rows[0].trang_thai;
      if (depositStatus !== 'DA_PHE_DUYET') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Không thể lập hợp đồng vì Tiền cọc chưa được phê duyệt!' });
      }
    }

    // 3. Tạo mã hợp đồng
    const ma_hop_dong = `HD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Câu lệnh INSERT đầy đủ
    const contractSql = `
      INSERT INTO hop_dong_thue (
        ma_hop_dong, 
        phieu_dang_ky_id, 
        giuong_id, 
        ngay_bat_dau, 
        ngay_ket_thuc, 
        thoi_han_thue_thang, 
        gia_thue_thang, 
        tien_coc, 
        ky_thanh_toan, 
        trang_thai, 
        created_by,
        mau_hop_dong_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Chờ ký', $10, $11)
    `;

    // Mảng giá trị truyền vào (phải đúng thứ tự với danh sách cột ở trên)
    await client.query(contractSql, [
      ma_hop_dong,            // $1
      phieu_dang_ky_id,       // $2
      giuong_id || null,      // $3
      ngay_bat_dau,           // $4
      ngay_ket_thuc,          // $5
      thoi_han_thue_thang,    // $6
      gia_thue_thang,         // $7
      tien_coc,               // $8
      ky_thanh_toan,          // $9
      created_by,             // $10 (ID nhân viên từ req.user.id)
      mau_hop_dong_id || null // $11
    ]);

    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: 'Lập hợp đồng thành công!',
      data: { ma_hop_dong }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi Transaction:', error);
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ: ' + error.message });
  } finally {
    client.release();
  }
};