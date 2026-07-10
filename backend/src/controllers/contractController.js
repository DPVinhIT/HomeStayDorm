const db = require('../config/db');

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
    const created_by = req.user.id; 

    if (!created_by) {
      return res.status(401).json({ message: "Không xác định được người tạo hợp đồng." });
    }
    await client.query('BEGIN');

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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Chờ thanh toán', $10, $11)
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
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ.' });
  } finally {
    client.release();
  }
};