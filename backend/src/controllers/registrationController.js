const db = require('../config/db');
const crypto = require('crypto');

// Sinh mã ngẫu nhiên cho phiếu đăng ký
const generateMaPhieu = () => {
  const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PDK-${randomStr}`;
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const query = `
      SELECT p.*, k.ho_ten as khach_hang_ten, k.so_dien_thoai as khach_hang_sdt 
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      ORDER BY p.created_at DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phiếu đăng ký' });
  }
};

exports.createRegistration = async (req, res) => {
    const { customer, registration, members, appointments } = req.body;

    // 0. Verification - Kiểm tra dữ liệu đầu vào
    if (customer) {
      if (!customer.ho_ten || customer.ho_ten.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập họ và tên khách hàng.' });
      }
      if (!customer.so_dien_thoai || customer.so_dien_thoai.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập số điện thoại khách hàng.' });
      }
      if (customer.so_dien_thoai && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(customer.so_dien_thoai)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ (Phải đúng định dạng SĐT Việt Nam, VD: 0912345678).' });
      }
      if (!customer.cccd || customer.cccd.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập CCCD/CMND khách hàng.' });
      }
      if (!/^[0-9]{9,12}$/.test(customer.cccd)) {
        return res.status(400).json({ message: 'CCCD/CMND không hợp lệ (Phải chứa 9 hoặc 12 chữ số).' });
      }
      if (!customer.email || customer.email.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Email khách hàng.' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        return res.status(400).json({ message: 'Địa chỉ Email không hợp lệ.' });
      }
      if (!customer.dia_chi || customer.dia_chi.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập địa chỉ thường trú khách hàng.' });
      }
      if (!customer.ngay_sinh || customer.ngay_sinh.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng chọn ngày sinh khách hàng.' });
      }
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN'); // Bắt đầu transaction
    
    // Lấy nhan_vien_id thực sự từ bảng nhan_vien dựa vào tai_khoan_id
    const { rows: nvRows } = await client.query('SELECT id FROM nhan_vien WHERE tai_khoan_id = $1', [req.user.id]);
    const sale_id = nvRows.length > 0 ? nvRows[0].id : req.user.id; // Fallback an toàn

    let khachHangId = customer.id;

    // 1. Tạo mới hoặc cập nhật Khách hàng nếu chưa có ID
    if (!khachHangId) {
      const upsertCustomerQuery = `
        INSERT INTO khach_hang (ho_ten, ngay_sinh, gioi_tinh, cccd, so_dien_thoai, email, dia_chi, quoc_tich, nghe_nghiep)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (cccd) 
        DO UPDATE SET 
          ho_ten = EXCLUDED.ho_ten,
          ngay_sinh = EXCLUDED.ngay_sinh,
          gioi_tinh = EXCLUDED.gioi_tinh,
          so_dien_thoai = EXCLUDED.so_dien_thoai,
          email = EXCLUDED.email,
          dia_chi = EXCLUDED.dia_chi,
          quoc_tich = EXCLUDED.quoc_tich,
          nghe_nghiep = EXCLUDED.nghe_nghiep
        RETURNING id
      `;
      const customerValues = [
        customer.ho_ten, customer.ngay_sinh || null, customer.gioi_tinh, customer.cccd, 
        customer.so_dien_thoai, customer.email, customer.dia_chi, customer.quoc_tich, customer.nghe_nghiep
      ];
      const { rows: upsertedCustomer } = await client.query(upsertCustomerQuery, customerValues);
      khachHangId = upsertedCustomer[0].id;
    }

    // 2. Tạo Phiếu đăng ký thuê
    const maPhieu = generateMaPhieu();
    const insertRegistrationQuery = `
      INSERT INTO phieu_dang_ky_thue (
        ma_phieu, khach_hang_id, nhan_vien_sale_id, chi_nhanh_id, hinh_thuc_thue, so_luong_nguoi, 
        gioi_tinh_nhom, khu_vuc_mong_muon, loai_phong_mong_muon, muc_gia_mong_muon, 
        ngay_du_kien_vao_o, thoi_han_thue_thang, tieu_chi_uu_tien, ghi_chu, trang_thai
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'CHO_XU_LY')
      RETURNING id
    `;
    const regValues = [
      maPhieu, khachHangId, sale_id, registration.chi_nhanh_id || null, registration.hinh_thuc_thue, registration.so_luong_nguoi,
      registration.gioi_tinh_nhom, registration.khu_vuc_mong_muon, registration.loai_phong_mong_muon,
      registration.muc_gia_mong_muon || null, registration.ngay_du_kien_vao_o || null, 
      registration.thoi_han_thue_thang || null, registration.tieu_chi_uu_tien, registration.ghi_chu
    ];
    const { rows: newReg } = await client.query(insertRegistrationQuery, regValues);
    const phieuDangKyId = newReg[0].id;

    // 3. Tạo Thành viên ở cùng (nếu có)
    if (members && members.length > 0) {
      const insertMemberQuery = `
        INSERT INTO thanh_vien_o_cung (phieu_dang_ky_id, ho_ten, gioi_tinh, ngay_sinh, cccd, so_dien_thoai, quan_he)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      for (const member of members) {
        if (member.ho_ten) {
          await client.query(insertMemberQuery, [
            phieuDangKyId, member.ho_ten, member.gioi_tinh, member.ngay_sinh || null, 
            member.cccd, member.so_dien_thoai, member.quan_he
          ]);
        }
      }
    }

    // 4. Tạo Lịch hẹn xem nhiều phòng (nếu có)
    // Người dùng chọn nhiều phòng => Tạo nhiều lịch hẹn cho cùng 1 phiếu
    if (appointments && appointments.length > 0) {
      const insertAppointmentQuery = `
        INSERT INTO lich_hen (phieu_dang_ky_id, phong_id, nhan_vien_id, loai_hen, thoi_gian_hen, trang_thai, ghi_chu)
        VALUES ($1, $2, $3, 'XEM_PHONG', $4, 'CHO_XAC_NHAN', $5)
      `;
      for (const appt of appointments) {
        if (appt.thoi_gian_hen) {
          await client.query(insertAppointmentQuery, [
            phieuDangKyId, appt.phong_id || null, sale_id, appt.thoi_gian_hen, appt.ghi_chu
          ]);
        }
      }
    }

    // 5. [ĐÃ BỎ] Không tự động khởi tạo Yêu cầu đặt cọc nữa. Sale sẽ tự tạo sau khi Quản lý duyệt.

    await client.query('COMMIT'); // Hoàn tất transaction
    res.status(201).json({ message: 'Tạo phiếu đăng ký thành công', ma_phieu: maPhieu });

  } catch (error) {
    await client.query('ROLLBACK'); // Hủy transaction nếu lỗi
    console.error('Error creating registration:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo phiếu đăng ký', error: error.message });
  } finally {
    client.release();
  }
};
exports.getRegistrationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Thông tin chính của phiếu đăng ký
    const mainQuery = `
      SELECT 
        p.*,
        k.ho_ten AS khach_hang_ten,
        k.so_dien_thoai AS khach_hang_sdt,
        k.email AS khach_hang_email,
        k.cccd AS khach_hang_cccd,
        k.ngay_sinh AS khach_hang_ngay_sinh,
        k.gioi_tinh AS khach_hang_gioi_tinh,
        k.dia_chi AS khach_hang_dia_chi,
        k.quoc_tich AS khach_hang_quoc_tich,
        k.nghe_nghiep AS khach_hang_nghe_nghiep,
        nv.ho_ten AS nhan_vien_sale_ten,
        cn.ten_chi_nhanh AS chi_nhanh_ten,
        ph.ma_phong AS phong_duoc_gan_ma,
        ph.gia_thue_thang AS phong_duoc_gan_gia,
        g.ma_giuong AS giuong_duoc_gan_ma,
        g.gia_thue_thang AS giuong_duoc_gan_gia
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN nhan_vien nv ON p.nhan_vien_sale_id = nv.id
      LEFT JOIN chi_nhanh cn ON p.chi_nhanh_id = cn.id
      LEFT JOIN phong ph ON p.phong_id = ph.id
      LEFT JOIN giuong g ON p.giuong_id = g.id
      WHERE p.id = $1
    `;
    const { rows: mainRows } = await db.query(mainQuery, [id]);

    if (mainRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    const phieuDangKy = mainRows[0];

    // 2. Thực hiện truy vấn song song. 
    // CHÚ Ý: Phải khớp thứ tự giữa Promise.all và mảng biến bên trái
    const [membersResult, depositsResult, appointmentsResult, contractsResult] = await Promise.all([
      // 0: Thành viên
      db.query(`SELECT * FROM thanh_vien_o_cung WHERE phieu_dang_ky_id = $1 ORDER BY id ASC`, [id]),
      
      // 1: Đơn đặt cọc (đúng vị trí của depositsResult)
      db.query(`
        SELECT 
          dc.*, 
          ph.ma_phong, 
          g.ma_giuong, 
          ph.gia_thue_thang AS phong_gia_thue,
          g.gia_thue_thang AS giuong_gia_thue
        FROM don_dat_coc dc
        LEFT JOIN phong ph ON dc.phong_id = ph.id
        LEFT JOIN giuong g ON dc.giuong_id = g.id
        WHERE dc.phieu_dang_ky_id = $1
      `, [id]),

      // 2: Lịch hẹn (đúng vị trí của appointmentsResult)
      db.query(`
        SELECT 
          lh.*, 
          ph.ma_phong, 
          ph.gia_thue_thang AS phong_gia_thue, 
          g.ma_giuong,
          g.gia_thue_thang AS giuong_gia_thue
        FROM lich_hen lh
        LEFT JOIN phong ph ON lh.phong_id = ph.id
        LEFT JOIN giuong g ON lh.giuong_id = g.id
        WHERE lh.phieu_dang_ky_id = $1
      `, [id]),

      // 3: Hợp đồng
      db.query(`SELECT * FROM hop_dong_thue WHERE phieu_dang_ky_id = $1`, [id])
    ]);

    // 3. Trả về kết quả với các biến đã khớp thứ tự
    res.json({
      ...phieuDangKy,
      thanh_vien_o_cung: membersResult.rows,
      don_dat_coc: depositsResult.rows,
      lich_hen: appointmentsResult.rows,
      hop_dong: contractsResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Error fetching registration detail:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phiếu đăng ký' });
  }
};