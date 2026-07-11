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
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN'); // Bắt đầu transaction

    const { customer, registration, members, appointments } = req.body;
    
    // Lấy nhan_vien_id thực sự từ bảng nhan_vien dựa vào tai_khoan_id
    const { rows: nvRows } = await client.query('SELECT id FROM nhan_vien WHERE tai_khoan_id = $1', [req.user.id]);
    const sale_id = nvRows.length > 0 ? nvRows[0].id : req.user.id; // Fallback an toàn

    let khachHangId = customer.id;

    // 1. Tạo mới Khách hàng nếu chưa có ID
    if (!khachHangId) {
      const insertCustomerQuery = `
        INSERT INTO khach_hang (ho_ten, ngay_sinh, gioi_tinh, cccd, so_dien_thoai, email, dia_chi, quoc_tich, nghe_nghiep)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      const customerValues = [
        customer.ho_ten, customer.ngay_sinh || null, customer.gioi_tinh, customer.cccd, 
        customer.so_dien_thoai, customer.email, customer.dia_chi, customer.quoc_tich, customer.nghe_nghiep
      ];
      const { rows: newCustomer } = await client.query(insertCustomerQuery, customerValues);
      khachHangId = newCustomer[0].id;
    }

    // 2. Tạo Phiếu đăng ký thuê
    const maPhieu = generateMaPhieu();
    const insertRegistrationQuery = `
      INSERT INTO phieu_dang_ky_thue (
        ma_phieu, khach_hang_id, nhan_vien_sale_id, hinh_thuc_thue, so_luong_nguoi, 
        gioi_tinh_nhom, khu_vuc_mong_muon, loai_phong_mong_muon, muc_gia_mong_muon, 
        ngay_du_kien_vao_o, thoi_han_thue_thang, tieu_chi_uu_tien, ghi_chu, trang_thai
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'CHO_XU_LY')
      RETURNING id
    `;
    const regValues = [
      maPhieu, khachHangId, sale_id, registration.hinh_thuc_thue, registration.so_luong_nguoi,
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

    // 1. Thông tin chính của phiếu đăng ký + khách hàng + sale + chi nhánh
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
        cn.ten_chi_nhanh AS chi_nhanh_ten
      FROM phieu_dang_ky_thue p
      JOIN khach_hang k ON p.khach_hang_id = k.id
      LEFT JOIN nhan_vien nv ON p.nhan_vien_sale_id = nv.id
      LEFT JOIN chi_nhanh cn ON p.chi_nhanh_id = cn.id
      WHERE p.id = $1
    `;
    const { rows: mainRows } = await db.query(mainQuery, [id]);

    if (mainRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đăng ký' });
    }

    const phieuDangKy = mainRows[0];

    // 2. Chạy song song tất cả các truy vấn phụ thuộc còn lại để tối ưu tốc độ phản hồi
    const [membersResult, appointmentsResult, depositsResult, contractsResult] = await Promise.all([
      db.query(
        `SELECT * FROM thanh_vien_o_cung WHERE phieu_dang_ky_id = $1 ORDER BY id ASC`,
        [id]
      ),
      db.query(
        `SELECT 
           lh.*,
           ph.ma_phong,
           ph.loai_phong,
           ph.gia_thue_thang AS phong_gia_thue,
           nv.ho_ten AS nhan_vien_ten
         FROM lich_hen lh
         LEFT JOIN phong ph ON lh.phong_id = ph.id
         LEFT JOIN nhan_vien nv ON lh.nhan_vien_id = nv.id
         WHERE lh.phieu_dang_ky_id = $1
         ORDER BY lh.thoi_gian_hen ASC`,
        [id]
      ),
      db.query(
        `SELECT * FROM don_dat_coc WHERE phieu_dang_ky_id = $1 ORDER BY created_at DESC`,
        [id]
      ),
      db.query(
        `SELECT * FROM hop_dong_thue WHERE phieu_dang_ky_id = $1`,
        [id]
      )
    ]);

    // 3. Gộp dữ liệu và trả về cho client
    res.json({
      ...phieuDangKy,
      thanh_vien_o_cung: membersResult.rows,
      lich_hen: appointmentsResult.rows,
      don_dat_coc: depositsResult.rows,
      hop_dong: contractsResult.rows[0] || null,
    });
  } catch (error) {
    console.error('Error fetching registration detail:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phiếu đăng ký' });
  }
};