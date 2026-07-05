-- =====================================================
-- KTX / DORMITORY MANAGEMENT SYSTEM - SEED DATA
-- =====================================================

-- 1. VAI TRÒ
INSERT INTO vai_tro (ten_vai_tro, mo_ta) VALUES 
('QUAN_LY', 'Quản lý chi nhánh ký túc xá'),
('SALE', 'Nhân viên tư vấn và chăm sóc khách hàng'),
('KE_TOAN', 'Nhân viên kế toán, phụ trách thu chi'),
('KHACH_HANG', 'Khách hàng thuê phòng/giường')
ON CONFLICT (ten_vai_tro) DO NOTHING;

-- 2. CHI NHÁNH
INSERT INTO chi_nhanh (ten_chi_nhanh, dia_chi, so_dien_thoai) VALUES 
('Chi nhánh 1 - Quận 10', '227 Nguyễn Văn Cừ, Phường 4, Quận 10, TP.HCM', '0123456789'),
('Chi nhánh 2 - Quận 7', 'Nguyễn Hữu Thọ, Tân Phong, Quận 7, TP.HCM', '0987654321');

-- 3. TÀI KHOẢN (Password hash là hash của 'Password@123' bằng bcrypt)
INSERT INTO tai_khoan (username, password_hash, email, trang_thai, vai_tro_id) VALUES 
('quanly01', '$2b$10$BpbLIP.vWBFVbRfW7b0Jne1hkbw7E07Zi5My50esdLUNUwtP1PoDe', 'quanly1@homestay.com', 'ACTIVE', (SELECT id FROM vai_tro WHERE ten_vai_tro='QUAN_LY')),
('sale01', '$2b$10$BpbLIP.vWBFVbRfW7b0Jne1hkbw7E07Zi5My50esdLUNUwtP1PoDe', 'sale1@homestay.com', 'ACTIVE', (SELECT id FROM vai_tro WHERE ten_vai_tro='SALE')),
('ketoan01', '$2b$10$BpbLIP.vWBFVbRfW7b0Jne1hkbw7E07Zi5My50esdLUNUwtP1PoDe', 'ketoan1@homestay.com', 'ACTIVE', (SELECT id FROM vai_tro WHERE ten_vai_tro='KE_TOAN'));

-- 4. NHÂN VIÊN
INSERT INTO nhan_vien (tai_khoan_id, chi_nhanh_id, ma_nhan_vien, ho_ten, gioi_tinh, ngay_sinh, so_dien_thoai, email, trang_thai) VALUES 
((SELECT id FROM tai_khoan WHERE username='quanly01'), (SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'NVQL001', 'Nguyễn Quản Lý', 'Nam', '1990-01-01', '0901234567', 'quanly1@homestay.com', 'ACTIVE'),
((SELECT id FROM tai_khoan WHERE username='sale01'), (SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'NVBH001', 'Trần Thị Sale', 'Nữ', '1995-05-05', '0907654321', 'sale1@homestay.com', 'ACTIVE'),
((SELECT id FROM tai_khoan WHERE username='ketoan01'), (SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'NVKT001', 'Lê Kế Toán', 'Nam', '1992-02-02', '0901112223', 'ketoan1@homestay.com', 'ACTIVE');

-- 5. KHÁCH HÀNG
INSERT INTO khach_hang (ho_ten, ngay_sinh, gioi_tinh, cccd, so_dien_thoai, email, dia_chi, quoc_tich, nghe_nghiep) VALUES 
('Phạm Văn Khách', '2000-10-10', 'Nam', '079099123456', '0933111222', 'khach1@gmail.com', 'TP.HCM', 'Việt Nam', 'Sinh viên'),
('Lý Thị Thuê', '2001-11-11', 'Nữ', '079099654321', '0933222333', 'khach2@gmail.com', 'Bình Dương', 'Việt Nam', 'Nhân viên văn phòng');

-- 6. PHÒNG (Cho chi nhánh 1)
INSERT INTO phong (chi_nhanh_id, ma_phong, tang, loai_phong, suc_chua, gia_thue_thang, gioi_tinh_ap_dung, trang_thai) VALUES 
((SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'P101', 1, 'Phòng 4 người', 4, 1500000.00, 'Nam', 'TRONG'),
((SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'P102', 1, 'Phòng 6 người', 6, 1200000.00, 'Nữ', 'TRONG');

-- 7. GIƯỜNG (Cho phòng P101 và P102)
INSERT INTO giuong (phong_id, ma_giuong, vi_tri, gia_thue_thang, trang_thai) VALUES 
((SELECT id FROM phong WHERE ma_phong='P101'), 'G101-1', 'Giường tầng 1 - Trong', 1600000.00, 'TRONG'),
((SELECT id FROM phong WHERE ma_phong='P101'), 'G101-2', 'Giường tầng 2 - Trong', 1400000.00, 'TRONG'),
((SELECT id FROM phong WHERE ma_phong='P101'), 'G101-3', 'Giường tầng 1 - Ngoài', 1600000.00, 'TRONG'),
((SELECT id FROM phong WHERE ma_phong='P101'), 'G101-4', 'Giường tầng 2 - Ngoài', 1400000.00, 'TRONG'),

((SELECT id FROM phong WHERE ma_phong='P102'), 'G102-1', 'Giường 1', 1300000.00, 'TRONG'),
((SELECT id FROM phong WHERE ma_phong='P102'), 'G102-2', 'Giường 2', 1100000.00, 'TRONG');

-- 8. DỊCH VỤ
INSERT INTO dich_vu (ma_dich_vu, ten_dich_vu, loai_dich_vu, don_vi_tinh, don_gia, mo_ta) VALUES 
('DV_DIEN', 'Tiền Điện', 'BẮT_BUỘC', 'kWh', 3500.00, 'Tính theo chỉ số đồng hồ riêng của phòng'),
('DV_NUOC', 'Tiền Nước', 'BẮT_BUỘC', 'Khối', 20000.00, 'Tính theo chỉ số đồng hồ nước'),
('DV_WIFI', 'Internet Wifi', 'CỐ_ĐỊNH', 'Tháng', 50000.00, 'Phí sử dụng internet không giới hạn'),
('DV_GUI_XE', 'Gửi xe máy', 'TÙY_CHỌN', 'Chiếc/Tháng', 120000.00, 'Gửi xe máy tại bãi xe nội bộ');

-- 9. TÀI SẢN
INSERT INTO tai_san (ten_tai_san, loai_tai_san, don_vi_tinh, gia_tri_boi_thuong_mac_dinh) VALUES 
('Máy lạnh Daikin 1.5 HP', 'ĐIỆN_LẠNH', 'Cái', 8000000.00),
('Tủ quần áo sắt 2 cánh', 'NỘI_THẤT', 'Cái', 1500000.00),
('Giường sắt 2 tầng', 'NỘI_THẤT', 'Cái', 2000000.00),
('Nệm cao su non', 'NỘI_THẤT', 'Tấm', 500000.00),
('Thẻ từ ra vào', 'PHỤ_KIỆN', 'Thẻ', 100000.00);

-- 10. PHIẾU ĐĂNG KÝ THUÊ
INSERT INTO phieu_dang_ky_thue (ma_phieu, khach_hang_id, chi_nhanh_id, hinh_thuc_thue, so_luong_nguoi, gioi_tinh_nhom, loai_phong_mong_muon, muc_gia_mong_muon, ngay_du_kien_vao_o, thoi_han_thue_thang, trang_thai, created_at) VALUES 
('#PDK-2023-001', (SELECT id FROM khach_hang WHERE ho_ten='Phạm Văn Khách'), (SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'Thuê giường', 1, 'Nam', 'Phòng 4 người', 1600000.00, '2023-11-01', 6, 'Mới', '2023-10-24 09:30:00'),
('#PDK-2023-002', (SELECT id FROM khach_hang WHERE ho_ten='Lý Thị Thuê'), (SELECT id FROM chi_nhanh WHERE ten_chi_nhanh='Chi nhánh 1 - Quận 10'), 'Thuê phòng', 2, 'Nữ', 'Phòng 2 người', 3000000.00, '2023-11-15', 12, 'Đang xử lý', '2023-10-23 14:15:00');
