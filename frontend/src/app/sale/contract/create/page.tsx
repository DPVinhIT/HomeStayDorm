'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, FileText, User, Home, Calendar,
  CreditCard, Info, Zap, Droplet,
  Wifi, Car, BookOpen, AlertTriangle, Scale,
  Phone, Mail, Fingerprint, MapPin, Briefcase,
  BedDouble, Building2, Wallet, ChevronRight, ShieldCheck,
  ChevronDown, ChevronUp, Printer, Ruler
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverData, setServerData] = useState<any>(null);
  const [showLegalTerms, setShowLegalTerms] = useState(false); // Chỉ điều khiển hiển thị UI — không ảnh hưởng dữ liệu form

  // Form State đầy đủ thông tin chi tiết hợp đồng
  const [formData, setFormData] = useState({
    phieu_dang_ky_id: '',
    giuong_id: null as string | null,
    ma_phong: '',
    ma_giuong: '',
    hinh_thuc_thue: '', // Thuê cả phòng hoặc Thuê giường lẻ

    // Thời hạn & Giá thuê
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    thoi_han_thue_thang: 12,
    gia_thue_thang: 0,
    tien_coc: 0,
    ky_thanh_toan: '1_THANG',

    // Các khoản phí dịch vụ (Sẽ được load động từ Database)
    phi_dien: 'Đang tải...',
    phi_nuoc: 'Đang tải...',
    phi_wifi: 'Đang tải...',
    phi_gui_xe: 'Đang tải...',
    phi_quan_ly: 'Đang tải...',

    // Điều khoản & Chính sách pháp lý (Ưu tiên load từ CSDL mau_hop_dong)
    mau_hop_dong_id: '',
    chinh_sach_hoan_coc: '',
    noi_quy_nha_chung: '',
    xu_ly_vi_pham: ''
  });

  const thoiHanOptions = [
    { label: '1 Tháng', value: 1 },
    { label: '3 Tháng', value: 3 },
    { label: '6 Tháng (Nửa năm)', value: 6 },
    { label: '12 Tháng (1 Năm)', value: 12 },
    { label: '24 Tháng (2 Năm)', value: 24 },
  ];

  const tinhNgayKetThuc = (ngayBatDauStr: string, soThang: number) => {
    if (!ngayBatDauStr) return '';
    const date = new Date(ngayBatDauStr);
    if (isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + soThang);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.ngay_bat_dau) {
      const ngayKetThucMoi = tinhNgayKetThuc(formData.ngay_bat_dau, formData.thoi_han_thue_thang);
      setFormData(prev => ({ ...prev, ngay_ket_thuc: ngayKetThucMoi }));
    }
  }, [formData.ngay_bat_dau, formData.thoi_han_thue_thang]);

  useEffect(() => {
    const fetchAllRequiredData = async () => {
      if (!registrationId) {
        alert('Thiếu thông tin mã phiếu đăng ký thuê!');
        router.back();
        return;
      }
      try {
        setLoading(true);

        // Gọi đồng thời 3 API: Phiếu đăng ký, Bảng giá dịch vụ, và Mẫu điều khoản hợp đồng
        const [registrationRes, servicesRes, templatesRes] = await Promise.all([
          axiosInstance.get(`/registration/${registrationId}`),
          axiosInstance.get('/services'),
          axiosInstance.get('/services/contract-templates')
        ]);

        // --- THÊM CÁC DÒNG LOG NÀY ĐỂ DEBUG ---
      console.log('--- Dữ liệu từ API Registration ---');
      console.log(registrationRes.data);
        
        // 1. Trích xuất thông tin tài chính & phòng ốc từ Phiếu đăng ký
      const raw = registrationRes.data;
      setServerData(raw);

      // Lấy thông tin phòng/giường ưu tiên từ Đơn đặt cọc (mảng), nếu không có thì lấy từ Lịch hẹn
      // Dùng optional chaining để tránh lỗi nếu mảng trống
      const infoSource = (raw.don_dat_coc && raw.don_dat_coc.length > 0) 
        ? raw.don_dat_coc[0] 
        : (raw.lich_hen && raw.lich_hen.length > 0 ? raw.lich_hen[0] : {});

      console.log('Nguồn dữ liệu phòng/giường:', infoSource);

      const giaThueGoc = Number(infoSource.phong_gia_thue || raw.muc_gia_mong_muon || 0);
      const tienCocGoc = (raw.don_dat_coc && raw.don_dat_coc.length > 0)
        ? Number(raw.don_dat_coc[0].so_tien_coc)
        : giaThueGoc;

      const ngayVaoODuKien = raw.ngay_du_kien_vao_o
        ? new Date(raw.ngay_du_kien_vao_o).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const thoiHanGoc = Number(raw.thoi_han_thue_thang || 6);

      // 2. Định dạng chuỗi hiển thị biểu phí dịch vụ động từ Database
      const servicesList = servicesRes.data || [];
      const getServiceValue = (code: string, fallbackText: string) => {
        const item = servicesList.find((s: any) => s.ma_dich_vu === code);
        if (!item) return fallbackText;
        const formattedPrice = typeof item.don_gia === 'number'
          ? new Intl.NumberFormat('vi-VN').format(item.don_gia) + 'đ'
          : item.don_gia;
        return `${formattedPrice}/${item.don_vi_tinh || 'tháng'}`;
      };

      // 3. Trích xuất mẫu điều khoản mặc định đầu tiên đang kích hoạt
      const activeTemplate = templatesRes.data?.[0] || {};

      setFormData({
        phieu_dang_ky_id: registrationId,
        // Lấy giuong_id từ infoSource để đảm bảo khớp với ma_giuong
        giuong_id: infoSource.giuong_id || null, 
        ma_phong: infoSource.ma_phong || '',
        ma_giuong: infoSource.ma_giuong || '',
        gia_thue_thang: infoSource.phong_gia_thue || giaThueGoc,
        hinh_thuc_thue: raw.hinh_thuc_thue || 'Thuê lẻ giường',
        tien_coc: tienCocGoc,
        ngay_bat_dau: ngayVaoODuKien,
        thoi_han_thue_thang: thoiHanGoc,
        ngay_ket_thuc: tinhNgayKetThuc(ngayVaoODuKien, thoiHanGoc),
        ky_thanh_toan: '1_THANG',

        // Giá trị động từ bảng dịch vụ backend
        phi_dien: getServiceValue('DV_DIEN', '4.000đ/kWh (Theo đồng hồ)'),
        phi_nuoc: getServiceValue('DV_NUOC', '100.000đ/người/tháng'),
        phi_wifi: getServiceValue('DV_WIFI', 'Miễn phí'),
        phi_gui_xe: getServiceValue('DV_GUI_XE', '100.000đ/xe/tháng'),
        phi_quan_ly: getServiceValue('QUAN_LY', '50.000đ/người/tháng'),

        mau_hop_dong_id: activeTemplate.id,
        chinh_sach_hoan_coc: activeTemplate.quy_dinh_hoan_coc,
        noi_quy_nha_chung: activeTemplate.noi_quy,
        xu_ly_vi_pham: activeTemplate.dieu_khoan_vi_pham,
      });
      } catch (error) {
        console.error('Failed to fetch master data for contract setup', error);
        alert('Có lỗi xảy ra trong quá trình đồng bộ dữ liệu hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllRequiredData();
  }, [registrationId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        trang_thai: 'CHO_DUYET'
      };
      console.log(payload);
      const res = await axiosInstance.post('/contracts', payload);
      if (res.data) {
        alert('🎉 Khởi tạo hợp đồng thành công! Đang chờ Quản lý phê duyệt.');
        router.push('/sale/contract');
      }
    } catch (error: any) {
      console.error('Lỗi khi tạo hợp đồng:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu hợp đồng.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getInitial = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1]?.[0]?.toUpperCase() || '?';
  };

  // ---------- Trạng thái đang tải: skeleton chỉn chu thay vì dòng chữ đơn thuần ----------
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-5 min-h-screen bg-[#F7F9F8]">
        <div className="flex items-center gap-3 mb-4 animate-pulse">
          <div className="h-9 w-9 rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3.5 w-56 bg-slate-200 rounded" />
            <div className="h-3 w-36 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="h-32 bg-white rounded-xl border border-slate-100 animate-pulse" />
          <div className="lg:col-span-2 h-32 bg-white rounded-xl border border-slate-100 animate-pulse" />
          <div className="h-44 bg-white rounded-xl border border-slate-100 animate-pulse" />
          <div className="lg:col-span-2 h-44 bg-white rounded-xl border border-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <div className="max-w-7xl mx-auto px-5 py-4">

        {/* ===== Header (thu gọn) ===== */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Quay lại"
              className="h-9 w-9 shrink-0 flex items-center justify-center border border-slate-200 rounded-lg bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>Đăng ký thuê</span>
                <ChevronRight size={10} />
                <span className="text-[#00502B] font-semibold">Lập hợp đồng</span>
                <span className="mx-1 text-slate-300">•</span>
                <span>#{serverData?.ma_phieu}</span>
              </div>
              <h1 className="text-[17px] leading-tight font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <span className="h-6 w-6 rounded-md bg-[#00502B]/10 flex items-center justify-center">
                  <FileText size={13} className="text-[#00502B]" />
                </span>
                Lập hợp đồng thuê chính thức
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Chờ khởi tạo
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-full bg-white text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Printer size={11} /> In nháp
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* ===== HÀNG 1: Trạng thái | Banner phòng + 4 ô thông số ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Trạng thái</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                  <span className="h-1 w-1 rounded-full bg-amber-500" /> Chờ khởi tạo
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-center gap-2 text-xs">
                <RowKV label="Mã phiếu đăng ký" value={`#${formData.phieu_dang_ky_id || '—'}`} mono />
                <RowKV label="Ngày lập hồ sơ" value={formatDate(serverData?.created_at)} />
                <RowKV label="Người lập" value={serverData?.nhan_vien_lap || 'Nhân viên Sale'} />
              </div>
            </div>

            <section className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gradient-to-br from-[#00502B] to-[#00311a] px-4 py-2.5 text-white relative">
                <span className="absolute top-2.5 right-3.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] font-bold">
                  <Ruler size={10} /> {formData.hinh_thuc_thue}
                </span>
                <h2 className="text-base font-bold leading-tight">{formData.ma_phong}</h2>
                <p className="text-white/70 text-[11px] mt-0.5">Vị trí giường: {formData.ma_giuong}</p>
              </div>
              <div className="p-3 flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 h-full">
                  <MiniStat icon={Building2} label="Hình thức">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px]">
                      {formData.hinh_thuc_thue}
                    </span>
                  </MiniStat>
                  <MiniStat icon={Home} label="Mã phòng">
                    <span className="font-bold text-slate-800 text-sm">{formData.ma_phong}</span>
                  </MiniStat>
                  <MiniStat icon={BedDouble} label="Vị trí giường">
                    <span className="font-bold text-slate-800 text-sm">{formData.ma_giuong}</span>
                  </MiniStat>
                  <MiniStat icon={Wallet} label="Giá thuê/tháng" highlight>
                    <span className="font-extrabold text-[#00502B] text-sm">{formatCurrency(formData.gia_thue_thang)}</span>
                  </MiniStat>
                </div>
              </div>
            </section>
          </div>

          {/* ===== HÀNG 2: Thông tin khách thuê | Điều khoản thuê + Chi phí khác ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">

            <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <SectionHeader icon={User} title="Khách thuê" subtitle="Chủ thể ký kết" />
              <div className="p-3.5 flex-1">
                <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-[#00502B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitial(serverData?.khach_hang_ten)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-[13px] truncate">{serverData?.khach_hang_ten || 'N/A'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{serverData?.khach_hang_nghe_nghiep || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <FieldCompact icon={Fingerprint} label="CCCD">
                    <span className="font-semibold text-[#00502B] font-mono">{serverData?.khach_hang_cccd || 'N/A'}</span>
                  </FieldCompact>
                  <FieldCompact icon={Phone} label="Điện thoại">
                    <span className="font-medium text-slate-700">{serverData?.khach_hang_sdt || 'N/A'}</span>
                  </FieldCompact>
                  <FieldCompact icon={Mail} label="Email">
                    <span className="font-medium text-slate-700 truncate block">{serverData?.khach_hang_email || 'N/A'}</span>
                  </FieldCompact>
                  <FieldCompact icon={Calendar} label="Ngày Sinh Giới Tính">
                    <span className="font-medium text-slate-700">
                      {formatDate(serverData?.khach_hang_ngay_sinh)} · {serverData?.khach_hang_gioi_tinh || 'N/A'}
                    </span>
                  </FieldCompact>
                  <FieldCompact icon={Briefcase} label="Quốc tịch">
                    <span className="font-medium text-slate-700">{serverData?.khach_hang_quoc_tich || 'Việt Nam'}</span>
                  </FieldCompact>
                  <FieldCompact icon={MapPin} label="Địa chỉ">
                    <span className="font-medium text-slate-700 truncate block">{serverData?.khach_hang_dia_chi || 'N/A'}</span>
                  </FieldCompact>
                </div>
              </div>
            </section>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">

              {/* Điều khoản thuê (chỉnh sửa được) */}
              <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <SectionHeader icon={Scale} title="Điều khoản thuê" subtitle="Thời hạn & thanh toán" />
                <div className="p-3.5 flex-1 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-0.5">Bắt đầu</label>
                      <input
                        type="date"
                        value={formData.ngay_bat_dau}
                        onChange={e => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-300 mb-0.5">Kết thúc</label>
                      <input
                        type="date"
                        value={formData.ngay_ket_thuc}
                        disabled
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-0.5">Thời hạn</label>
                      <select
                        value={formData.thoi_han_thue_thang}
                        onChange={e => setFormData({ ...formData, thoi_han_thue_thang: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                      >
                        {thoiHanOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-0.5">Kỳ thanh toán</label>
                      <select
                        value={formData.ky_thanh_toan}
                        onChange={e => setFormData({ ...formData, ky_thanh_toan: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                      >
                        <option value="1_THANG">1 tháng/lần</option>
                        <option value="3_THANG">3 tháng/lần</option>
                        <option value="6_THANG">6 tháng/lần</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Giá thuê/tháng</p>
                      <p className="font-extrabold text-[#00502B] text-[13px]">{formatCurrency(formData.gia_thue_thang)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">Tiền cọc</p>
                      <p className="font-bold text-rose-600 text-[13px]">{formatCurrency(formData.tien_coc)}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chi phí dịch vụ khác (chỉ đọc, đồng bộ từ Admin) */}
              <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <SectionHeader icon={Zap} title="Chi phí khác" subtitle="Đồng bộ từ Admin" iconColor="text-amber-500" iconBg="bg-amber-50" />
                <div className="flex-1 flex flex-col justify-center divide-y divide-slate-100">
                  <FeeRow icon={Zap} iconColor="text-amber-500" label="Điện" value={formData.phi_dien} />
                  <FeeRow icon={Droplet} iconColor="text-sky-500" label="Nước" value={formData.phi_nuoc} />
                  <FeeRow icon={Wifi} iconColor="text-indigo-500" label="Wifi" value={formData.phi_wifi} />
                  <FeeRow icon={Car} iconColor="text-emerald-500" label="Gửi xe" value={formData.phi_gui_xe} />
                  <FeeRow icon={Info} iconColor="text-purple-500" label="Phí dịch vụ chung" value={formData.phi_quan_ly} />
                </div>
              </section>
            </div>
          </div>

          {/* ===== Điều khoản pháp lý — thu gọn dạng accordion, mặc định đóng để tiết kiệm chiều cao ===== */}
          <section className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLegalTerms(prev => !prev)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-50/60 transition-colors"
            >
              <span className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Scale size={14} className="text-[#00502B]" />
              </span>
              <div className="min-w-0 text-left flex-1">
                <h2 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Điều khoản pháp lý</h2>
                <p className="text-[11px] text-slate-400">Cọc, nội quy & xử lý vi phạm — bấm để {showLegalTerms ? 'thu gọn' : 'xem/chỉnh sửa'}</p>
              </div>
              {showLegalTerms ? (
                <ChevronUp size={16} className="text-slate-400 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-400 shrink-0" />
              )}
            </button>

            {showLegalTerms && (
              <div className="p-3.5 pt-0 space-y-3 border-t border-slate-100">
                <TermField
                  icon={CreditCard}
                  label="Quy định hoàn trả / khấu trừ tiền đặt cọc"
                  value={formData.chinh_sach_hoan_coc}
                  onChange={(v: string) => setFormData({ ...formData, chinh_sach_hoan_coc: v })}
                />
                <TermField
                  icon={BookOpen}
                  label="Nội quy nhà chung (co-living rules)"
                  value={formData.noi_quy_nha_chung}
                  onChange={(v: string) => setFormData({ ...formData, noi_quy_nha_chung: v })}
                />
                <TermField
                  icon={AlertTriangle}
                  label="Biện pháp chế tài xử lý vi phạm hợp đồng"
                  value={formData.xu_ly_vi_pham}
                  onChange={(v: string) => setFormData({ ...formData, xu_ly_vi_pham: v })}
                  iconColor="text-rose-500"
                />
              </div>
            )}
          </section>

          {/* ===== Hành động cuối trang — góc dưới bên phải (desktop) ===== */}
          <div className="hidden lg:flex justify-end items-center gap-2.5 pt-0.5 pb-2">
            <p className="text-[10.5px] text-slate-400 mr-auto">
              Hợp đồng sẽ chuyển sang trạng thái <span className="font-semibold text-amber-600">Chờ duyệt</span> sau khi khởi tạo.
            </p>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 text-[12.5px]"
            >
              Hủy tác vụ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#00502B] text-white font-bold rounded-lg hover:bg-[#003d20] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-[12.5px] shadow-md"
            >
              {submitting ? 'Đang khởi tạo…' : 'Khởi tạo hợp đồng thuê'}
            </button>
          </div>

          {/* ===== Thanh hành động cố định cho màn hình nhỏ ===== */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center gap-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-[13px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] px-4 py-2.5 bg-[#00502B] text-white font-bold rounded-lg hover:bg-[#003d20] active:scale-[0.99] disabled:opacity-60 transition-all text-[13px] shadow-md"
            >
              {submitting ? 'Đang khởi tạo…' : 'Khởi tạo hợp đồng'}
            </button>
          </div>
          <div className="lg:hidden h-16" />
        </form>
      </div>
    </div>
  );
}

/* ==================== Các thành phần UI dùng lại (chỉ trình bày, không đổi logic) ==================== */

function SectionHeader({
  icon: Icon, title, subtitle, iconColor = 'text-[#00502B]', iconBg = 'bg-[#00502B]/10'
}: { icon: any; title: string; subtitle: string; iconColor?: string; iconBg?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-100">
      <span className={`h-7 w-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={13} className={iconColor} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[11.5px] font-bold text-slate-700 uppercase tracking-wide truncate">{title}</h2>
        <p className="text-[10.5px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldCompact({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={11} className="text-slate-300 shrink-0" />
      <span className="text-slate-400 shrink-0 w-[64px]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function RowKV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold text-slate-700 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function MiniStat({ icon: Icon, label, children, highlight = false }: { icon: any; label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`p-2.5 rounded-lg border flex flex-col justify-center ${highlight ? 'bg-[#00502B]/[0.04] border-[#00502B]/15' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-[9.5px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-1 mb-1">
        <Icon size={10} /> {label}
      </p>
      {children}
    </div>
  );
}

function FeeRow({ icon: Icon, iconColor, label, value }: { icon: any; iconColor: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-1.5">
      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
        <Icon size={12} className={iconColor} /> {label}
      </span>
      <span className="text-[12px] font-bold text-slate-700 text-right">{value}</span>
    </div>
  );
}

function TermField({
  icon: Icon, label, value, onChange, iconColor = 'text-[#00502B]'
}: { icon: any; label: string; value: string; onChange: (v: string) => void; iconColor?: string }) {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLong = value.length > 150;

  // Textarea tự giãn theo nội dung khi ở chế độ chỉnh sửa — không dùng thanh cuộn nội bộ
  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [expanded, value]);

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
        <Icon size={12} className={iconColor} /> {label}
      </label>

      {expanded ? (
        <>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            autoFocus
            className="w-full p-2.5 border border-slate-200 rounded-lg text-[12px] leading-relaxed text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors resize-none overflow-hidden"
            style={{ minHeight: '72px' }}
            required
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#00502B] hover:underline"
          >
            Thu gọn <ChevronUp size={12} />
          </button>
        </>
      ) : (
        <>
          <div
            onClick={() => setExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setExpanded(true); }}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-[12px] leading-relaxed text-slate-600 cursor-text hover:border-slate-300 transition-colors"
          >
            <p className={isLong ? 'line-clamp-2' : ''}>
              {value || <span className="text-slate-400 italic">Chưa có nội dung, bấm để nhập…</span>}
            </p>
          </div>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#00502B] hover:underline"
            >
              Xem thêm <ChevronDown size={12} />
            </button>
          )}
        </>
      )}
    </div>
  );
}