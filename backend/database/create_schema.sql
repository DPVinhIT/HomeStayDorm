-- =====================================================
-- KTX / DORMITORY MANAGEMENT SYSTEM
-- PostgreSQL / Neon
-- =====================================================

-- ======================
-- VAI TRO
-- ======================

CREATE TABLE vai_tro (
    id BIGSERIAL PRIMARY KEY,
    ten_vai_tro VARCHAR(50) NOT NULL UNIQUE,
    mo_ta TEXT
);

-- ======================
-- CHI NHANH
-- ======================

CREATE TABLE chi_nhanh (
    id BIGSERIAL PRIMARY KEY,
    ten_chi_nhanh VARCHAR(255) NOT NULL,
    dia_chi TEXT,
    so_dien_thoai VARCHAR(20)
);

-- ======================
-- TAI KHOAN
-- ======================

CREATE TABLE tai_khoan (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255),
    trang_thai VARCHAR(30) DEFAULT 'ACTIVE',
    vai_tro_id BIGINT NOT NULL REFERENCES vai_tro(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- NHAN VIEN
-- ======================

CREATE TABLE nhan_vien (
    id BIGSERIAL PRIMARY KEY,
    tai_khoan_id BIGINT UNIQUE REFERENCES tai_khoan(id),
    chi_nhanh_id BIGINT REFERENCES chi_nhanh(id),

    ma_nhan_vien VARCHAR(50) UNIQUE,

    ho_ten VARCHAR(255) NOT NULL,
    gioi_tinh VARCHAR(20),
    ngay_sinh DATE,

    so_dien_thoai VARCHAR(20),
    email VARCHAR(255),

    trang_thai VARCHAR(30) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- NHAT KY
-- ======================

CREATE TABLE nhat_ky_hoat_dong (
    id BIGSERIAL PRIMARY KEY,
    tai_khoan_id BIGINT REFERENCES tai_khoan(id),

    hanh_dong VARCHAR(255),
    doi_tuong VARCHAR(100),
    doi_tuong_id BIGINT,

    noi_dung TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- KHACH HANG
-- ======================

CREATE TABLE khach_hang (
    id BIGSERIAL PRIMARY KEY,

    ho_ten VARCHAR(255) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(20),

    cccd VARCHAR(20) UNIQUE,

    so_dien_thoai VARCHAR(20),
    email VARCHAR(255),

    dia_chi TEXT,
    quoc_tich VARCHAR(100),
    nghe_nghiep VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- PHONG
-- ======================

CREATE TABLE phong (
    id BIGSERIAL PRIMARY KEY,

    chi_nhanh_id BIGINT NOT NULL REFERENCES chi_nhanh(id),

    ma_phong VARCHAR(50) UNIQUE NOT NULL,
    tang INTEGER,

    loai_phong VARCHAR(100),

    suc_chua INTEGER,

    gia_thue_thang NUMERIC(15,2),

    gioi_tinh_ap_dung VARCHAR(20),

    trang_thai VARCHAR(50) NOT NULL
);

-- ======================
-- GIUONG
-- ======================

CREATE TABLE giuong (
    id BIGSERIAL PRIMARY KEY,

    phong_id BIGINT NOT NULL REFERENCES phong(id),

    ma_giuong VARCHAR(50) UNIQUE NOT NULL,

    vi_tri VARCHAR(100),

    gia_thue_thang NUMERIC(15,2),

    trang_thai VARCHAR(50)
);

-- ======================
-- PHIEU DANG KY THUE
-- ======================

CREATE TABLE phieu_dang_ky_thue (
    id BIGSERIAL PRIMARY KEY,

    ma_phieu VARCHAR(50) UNIQUE NOT NULL,

    khach_hang_id BIGINT NOT NULL REFERENCES khach_hang(id),

    nhan_vien_sale_id BIGINT REFERENCES nhan_vien(id),

    chi_nhanh_id BIGINT REFERENCES chi_nhanh(id),

    hinh_thuc_thue VARCHAR(50),

    so_luong_nguoi INTEGER,

    gioi_tinh_nhom VARCHAR(20),

    khu_vuc_mong_muon VARCHAR(255),

    loai_phong_mong_muon VARCHAR(255),

    muc_gia_mong_muon NUMERIC(15,2),

    ngay_du_kien_vao_o DATE,

    thoi_han_thue_thang INTEGER,

    tieu_chi_uu_tien TEXT,

    ghi_chu TEXT,

    trang_thai VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- THANH VIEN O CUNG
-- ======================

CREATE TABLE thanh_vien_o_cung (
    id BIGSERIAL PRIMARY KEY,

    phieu_dang_ky_id BIGINT NOT NULL REFERENCES phieu_dang_ky_thue(id),

    ho_ten VARCHAR(255),

    gioi_tinh VARCHAR(20),

    ngay_sinh DATE,

    cccd VARCHAR(20),

    so_dien_thoai VARCHAR(20),

    quan_he VARCHAR(100),

    trang_thai_xac_minh VARCHAR(50),

    ly_do_tu_choi TEXT,

    verified_by BIGINT REFERENCES nhan_vien(id),

    verified_at TIMESTAMP
);

-- ======================
-- LICH XEM PHONG
-- ======================

CREATE TABLE lich_hen (
    id BIGSERIAL PRIMARY KEY,

    phieu_dang_ky_id BIGINT REFERENCES phieu_dang_ky_thue(id),

    hop_dong_id BIGINT,

    phong_id BIGINT REFERENCES phong(id),

    giuong_id BIGINT REFERENCES giuong(id),

    nhan_vien_id BIGINT REFERENCES nhan_vien(id),

    loai_hen VARCHAR(30) NOT NULL,

    thoi_gian_hen TIMESTAMP NOT NULL,

    trang_thai VARCHAR(50),

    ghi_chu TEXT
);

-- ======================
-- KET QUA XEM PHONG
-- ======================

CREATE TABLE ket_qua_lich_hen (
    id BIGSERIAL PRIMARY KEY,

    lich_hen_id BIGINT UNIQUE NOT NULL REFERENCES lich_hen(id),

    khach_hai_long BOOLEAN,

    quyet_dinh VARCHAR(50),

    phan_hoi TEXT,

    nhu_cau_moi TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- DON DAT COC
-- ======================

CREATE TABLE don_dat_coc (
    id BIGSERIAL PRIMARY KEY,

    ma_don_coc VARCHAR(50) UNIQUE NOT NULL,

    phieu_dang_ky_id BIGINT NOT NULL REFERENCES phieu_dang_ky_thue(id),

    phong_id BIGINT REFERENCES phong(id),

    giuong_id BIGINT REFERENCES giuong(id),

    so_giuong_thue INTEGER,

    so_tien_coc NUMERIC(15,2),

    han_thanh_toan TIMESTAMP,

    trang_thai VARCHAR(50) CHECK (trang_thai IN ( 'DA_THANH_TOAN', 'CHO_THANH_TOAN', 'DA_HUY', 'HET_HAN' )),

    created_by BIGINT REFERENCES nhan_vien(id),

    confirmed_by BIGINT REFERENCES nhan_vien(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    confirmed_at TIMESTAMP
);

-- ======================
-- HOP DONG THUE
-- ======================

CREATE TABLE hop_dong_thue (
    id BIGSERIAL PRIMARY KEY,

    ma_hop_dong VARCHAR(50) UNIQUE NOT NULL,

    phieu_dang_ky_id BIGINT UNIQUE REFERENCES phieu_dang_ky_thue(id),

    giuong_id BIGINT REFERENCES giuong(id),

    ngay_bat_dau DATE,

    ngay_ket_thuc DATE,

    thoi_han_thue_thang INTEGER,

    gia_thue_thang NUMERIC(15,2),

    tien_coc NUMERIC(15,2),

    ky_thanh_toan VARCHAR(50),

    trang_thai VARCHAR(50),

    created_by BIGINT REFERENCES nhan_vien(id),

    approved_by BIGINT REFERENCES nhan_vien(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_at TIMESTAMP
);


-- ======================
-- DICH VU
-- ======================

CREATE TABLE dich_vu (
    id BIGSERIAL PRIMARY KEY,

    ma_dich_vu VARCHAR(50) UNIQUE NOT NULL,

    ten_dich_vu VARCHAR(255) NOT NULL,

    loai_dich_vu VARCHAR(50),

    don_vi_tinh VARCHAR(50),

    don_gia NUMERIC(15,2) NOT NULL,

    mo_ta TEXT,

    trang_thai VARCHAR(30) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- PHIEU THU
-- ======================

CREATE TABLE phieu_thu (
    id BIGSERIAL PRIMARY KEY,

    ma_phieu_thu VARCHAR(50) UNIQUE NOT NULL,

    khach_hang_id BIGINT REFERENCES khach_hang(id),

    hop_dong_id BIGINT,

    don_dat_coc_id BIGINT REFERENCES don_dat_coc(id),

    loai_thu VARCHAR(50),

    so_tien NUMERIC(15,2),

    phuong_thuc VARCHAR(50),

    noi_dung TEXT,

    trang_thai VARCHAR(50),

    created_by BIGINT REFERENCES nhan_vien(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- PHIEU CHI
-- ======================

CREATE TABLE phieu_chi (
    id BIGSERIAL PRIMARY KEY,

    ma_phieu_chi VARCHAR(50) UNIQUE NOT NULL,

    khach_hang_id BIGINT REFERENCES khach_hang(id),

    hop_dong_id BIGINT,

    loai_chi VARCHAR(50),

    so_tien NUMERIC(15,2),

    phuong_thuc VARCHAR(50),

    noi_dung TEXT,

    trang_thai VARCHAR(50),

    created_by BIGINT REFERENCES nhan_vien(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- BIEN BAN BAN GIAO
-- ======================

CREATE TABLE bien_ban_ban_giao (
    id BIGSERIAL PRIMARY KEY,

    ma_bien_ban VARCHAR(50) UNIQUE NOT NULL,

    hop_dong_id BIGINT,

    phong_id BIGINT REFERENCES phong(id),

    giuong_id BIGINT REFERENCES giuong(id),

    loai_bien_ban VARCHAR(30),

    ngay_ban_giao DATE,

    tinh_trang_phong TEXT,

    ghi_chu TEXT,

    quan_ly_id BIGINT REFERENCES nhan_vien(id),

    khach_hang_id BIGINT REFERENCES khach_hang(id),

    trang_thai VARCHAR(50)
);

-- ======================
-- TAI SAN
-- ======================

CREATE TABLE tai_san (
    id BIGSERIAL PRIMARY KEY,

    ten_tai_san VARCHAR(255),

    loai_tai_san VARCHAR(100),

    don_vi_tinh VARCHAR(50),

    gia_tri_boi_thuong_mac_dinh NUMERIC(15,2)
);

-- ======================
-- CHI TIET BAN GIAO
-- ======================

CREATE TABLE chi_tiet_ban_giao (
    id BIGSERIAL PRIMARY KEY,

    bien_ban_ban_giao_id BIGINT REFERENCES bien_ban_ban_giao(id),

    tai_san_id BIGINT REFERENCES tai_san(id),

    so_luong INTEGER,

    tinh_trang VARCHAR(255),

    ghi_chu TEXT
);

-- ======================
-- YEU CAU TRA PHONG
-- ======================

CREATE TABLE yeu_cau_tra_phong (
    id BIGSERIAL PRIMARY KEY,

    ma_yeu_cau VARCHAR(50) UNIQUE NOT NULL,

    hop_dong_id BIGINT,

    ngay_yeu_cau DATE,

    ngay_tra_du_kien DATE,

    ly_do TEXT,

    trang_thai VARCHAR(50),

    sale_id BIGINT REFERENCES nhan_vien(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- HO SO TRA PHONG
-- ======================

CREATE TABLE ho_so_tra_phong (
    id BIGSERIAL PRIMARY KEY,

    yeu_cau_tra_phong_id BIGINT UNIQUE REFERENCES yeu_cau_tra_phong(id),

    quan_ly_id BIGINT REFERENCES nhan_vien(id),

    ngay_kiem_tra DATE,

    tinh_trang_phong TEXT,

    ghi_chu_hu_hong TEXT,

    chi_phi_sua_chua NUMERIC(15,2),

    chi_phi_phat_sinh NUMERIC(15,2),

    trang_thai VARCHAR(50)
);

-- ======================
-- DOI SOAT
-- ======================

CREATE TABLE bang_doi_soat (
    id BIGSERIAL PRIMARY KEY,

    ma_bang_doi_soat VARCHAR(50) UNIQUE NOT NULL,

    yeu_cau_tra_phong_id BIGINT UNIQUE REFERENCES yeu_cau_tra_phong(id),

    ke_toan_id BIGINT REFERENCES nhan_vien(id),

    tien_coc_ban_dau NUMERIC(15,2),

    ty_le_hoan_coc NUMERIC(5,2),

    tien_coc_duoc_hoan NUMERIC(15,2),

    tong_khau_tru NUMERIC(15,2),

    so_tien_con_lai NUMERIC(15,2),

    so_tien_khach_phai_tra_them NUMERIC(15,2),

    ket_qua VARCHAR(50),

    trang_thai VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chi_tiet_doi_soat (
    id BIGSERIAL PRIMARY KEY,

    bang_doi_soat_id BIGINT REFERENCES bang_doi_soat(id),

    loai_khoan VARCHAR(100),

    mo_ta TEXT,

    so_tien NUMERIC(15,2)
);

-- ======================
-- CHINH SACH HE THONG
-- ======================

CREATE TABLE chinh_sach_he_thong (
    id BIGSERIAL PRIMARY KEY,

    ten_chinh_sach VARCHAR(255),

    loai_chinh_sach VARCHAR(100),

    gia_tri VARCHAR(255),

    don_vi VARCHAR(50),

    ngay_bat_dau DATE,

    ngay_ket_thuc DATE,

    trang_thai VARCHAR(50)
);

-- ======================
-- FK LICH HEN -> HOP DONG THUE
-- ======================

ALTER TABLE lich_hen
ADD CONSTRAINT fk_lich_hen_hop_dong
FOREIGN KEY (hop_dong_id)
REFERENCES hop_dong_thue(id);

-- =====================================================
-- HÓA ĐƠN DỊCH VỤ (Đã cập nhật khóa ngoại phong_id)
-- =====================================================
-- =====================================================
-- CHI TIẾT KIỂM TRA PHÒNG (Đã cập nhật chính xác các trường)
-- =====================================================

CREATE TABLE chi_tiet_kiem_tra_phong (
    id BIGSERIAL PRIMARY KEY,
    
    -- Khóa ngoại giữ nguyên dựa trên các đường liên kết của ERD tổng
    ho_so_tra_phong_id BIGINT NOT NULL REFERENCES ho_so_tra_phong(id),
    tai_san_id BIGINT NOT NULL REFERENCES tai_san(id),
    
    -- Các trường dữ liệu được cập nhật theo hình ảnh chi tiết
    so_luong_thieu INTEGER,
    
    tinh_trang_hu_hong VARCHAR(255),
    
    loi_do_khach BOOLEAN,
    
    chi_phi_den_bu NUMERIC(15,2)
);



CREATE TABLE hoa_don_dich_vu (
    id BIGSERIAL PRIMARY KEY,
    
    ma_hoa_don VARCHAR(50) UNIQUE NOT NULL,
    
    hop_dong_id BIGINT NOT NULL REFERENCES hop_dong_thue(id),
    
    phong_id BIGINT NOT NULL REFERENCES phong(id),
    
    chi_so_dien_cu NUMERIC(10,2),
    
    chi_so_dien_moi NUMERIC(10,2),
    
    chi_so_nuoc_cu NUMERIC(10,2),
    
    chi_so_nuoc_moi NUMERIC(10,2),
    
    tien_dien NUMERIC(15,2),
    
    tien_nuoc NUMERIC(15,2),
    
    tien_dich_vu_khac NUMERIC(15,2),
    
    tong_tien NUMERIC(15,2),
    
    trang_thai VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);