'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, FileText, User, Home, Calendar,
  CreditCard, Info, Zap, Droplet,
  Wifi, Car, BookOpen, AlertTriangle, Scale,
  Phone, Mail, Fingerprint, MapPin, Briefcase,
  BedDouble, Building2, Wallet, ChevronRight, ShieldCheck,
  ChevronDown, ChevronUp
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

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
    thoi_han_thue_thang: 6,
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

        // 1. Trích xuất thông tin tài chính & phòng ốc từ Phiếu đăng ký
        const raw = registrationRes.data;
        setServerData(raw);

        const giaThueGoc = Number(raw.phong_gia_thue || raw.muc_gia_mong_muon || 0);
        const tienCocGoc = raw.don_dat_coc && raw.don_dat_coc.length > 0
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
          giuong_id: raw.giuong_id || null,
          ma_phong: raw.ma_phong || 'Chưa xếp phòng',
          ma_giuong: raw.ma_giuong || (raw.hinh_thuc_thue === 'Thuê cả phòng' ? 'Thuê nguyên phòng' : 'Chưa xếp giường'),
          hinh_thuc_thue: raw.hinh_thuc_thue || 'Thuê lẻ giường',
          gia_thue_thang: giaThueGoc,
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

          // ĐÃ SỬA: khớp đúng tên cột trả về từ bảng mau_hop_dong
          // (backend SELECT id, ten_mau, quy_dinh_hoan_coc, noi_quy, dieu_khoan_vi_pham)
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

  // ---------- Trạng thái đang tải: skeleton chỉn chu thay vì dòng chữ đơn thuần ----------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen bg-[#F7F9F8]">
        <div className="flex items-center gap-3 mb-8 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-64 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        </div>
        <p className="text-center text-sm text-slate-400 mt-8 tracking-wide">
          Đang trích xuất dữ liệu phiếu đăng ký, biểu phí dịch vụ và mẫu điều khoản hợp đồng…
        </p>
      </div>
    );
  }

  // Nhãn hiển thị cho bước / mục lục biểu mẫu — có ý nghĩa vì các mục theo đúng trình tự nghiệp vụ lập hợp đồng
  const sections = [
    { n: '01', label: 'Khách thuê', icon: User },
    { n: '02', label: 'Đối tượng thuê', icon: Home },
    { n: '03', label: 'Biểu phí dịch vụ', icon: Zap },
    { n: '04', label: 'Điều khoản pháp lý', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-28">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ===== Header ===== */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
            <span>Đăng ký thuê</span>
            <ChevronRight size={12} />
            <span className="text-[#00502B] font-semibold">Lập hợp đồng chính thức</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Quay lại"
                className="h-11 w-11 shrink-0 flex items-center justify-center border border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-colors"
              >
                <ArrowLeft size={19} />
              </button>
              <div>
                <h1 className="text-[22px] leading-tight font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-lg bg-[#00502B]/10 flex items-center justify-center">
                    <FileText size={17} className="text-[#00502B]" />
                  </span>
                  Lập hợp đồng thuê chính thức
                </h1>
                <p className="text-[13px] text-slate-500 mt-1">
                  Mã phiếu gốc <span className="font-semibold text-slate-700">#{serverData?.ma_phieu}</span>
                  <span className="mx-1.5 text-slate-300">•</span>
                  Ngày tạo hồ sơ {formatDate(serverData?.created_at)}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Chờ khởi tạo
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ================= CỘT NỘI DUNG CHÍNH ================= */}
            <div className="lg:col-span-2 space-y-6">

              {/* KHỐI 1: THÔNG TIN CÁ NHÂN ĐẦY ĐỦ CỦA KHÁCH THUÊ */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader index="01" icon={User} title="Thông tin khách thuê" subtitle="Chủ thể ký kết hợp đồng" />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field icon={User} label="Họ và tên khách hàng">
                    <span className="font-semibold text-slate-800">{serverData?.khach_hang_ten || 'N/A'}</span>
                  </Field>
                  <Field icon={Fingerprint} label="Số CCCD / CMND / Hộ chiếu">
                    <span className="font-semibold text-[#00502B] font-mono tracking-wide">{serverData?.khach_hang_cccd || 'N/A'}</span>
                  </Field>
                  <Field icon={Phone} label="Số điện thoại">
                    <span className="font-medium text-slate-700">{serverData?.khach_hang_sdt || 'N/A'}</span>
                  </Field>
                  <Field icon={Mail} label="Email liên hệ">
                    <span className="font-medium text-slate-700">{serverData?.khach_hang_email || 'N/A'}</span>
                  </Field>
                  <Field icon={Calendar} label="Ngày sinh · Giới tính">
                    <span className="font-medium text-slate-700">
                      {formatDate(serverData?.khach_hang_ngay_sinh)} · {serverData?.khach_hang_gioi_tinh || 'N/A'}
                    </span>
                  </Field>
                  <Field icon={Briefcase} label="Quốc tịch · Nghề nghiệp">
                    <span className="font-medium text-slate-700">
                      {serverData?.khach_hang_quoc_tich || 'Việt Nam'} · {serverData?.khach_hang_nghe_nghiep || 'N/A'}
                    </span>
                  </Field>
                  <div className="md:col-span-2">
                    <Field icon={MapPin} label="Địa chỉ thường trú">
                      <span className="font-medium text-slate-700">{serverData?.khach_hang_dia_chi || 'N/A'}</span>
                    </Field>
                  </div>
                </div>
              </section>

              {/* KHỐI 2: THÔNG TIN PHÒNG BAN & GIƯỜNG THUÊ & GIÁ BÁN */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader index="02" icon={Home} title="Đối tượng thuê" subtitle="Ràng buộc tài chính gốc từ phiếu đăng ký" />
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStat icon={Building2} label="Hình thức bàn giao">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-md text-xs">
                        {formData.hinh_thuc_thue}
                      </span>
                    </MiniStat>
                    <MiniStat icon={Home} label="Mã phòng phân phối">
                      <span className="font-bold text-slate-800 text-base">{formData.ma_phong}</span>
                    </MiniStat>
                    <MiniStat icon={BedDouble} label="Vị trí giường">
                      <span className="font-bold text-slate-800 text-base">{formData.ma_giuong}</span>
                    </MiniStat>
                    <MiniStat icon={Wallet} label="Giá thuê / tháng" highlight>
                      <span className="font-extrabold text-[#00502B] text-base">{formatCurrency(formData.gia_thue_thang)}</span>
                    </MiniStat>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={formData.ngay_bat_dau}
                        onChange={e => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Thời hạn hợp đồng</label>
                      <select
                        value={formData.thoi_han_thue_thang}
                        onChange={e => setFormData({ ...formData, thoi_han_thue_thang: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                      >
                        {thoiHanOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={formData.ngay_ket_thuc}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Kỳ thanh toán</label>
                      <select
                        value={formData.ky_thanh_toan}
                        onChange={e => setFormData({ ...formData, ky_thanh_toan: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors"
                      >
                        <option value="1_THANG">1 tháng / lần</option>
                        <option value="3_THANG">Block 3 tháng / lần</option>
                        <option value="6_THANG">Block 6 tháng / lần</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* KHỐI 3: DANH MỤC CÁC KHOẢN PHÍ DỊCH VỤ ĐI KÈM */}
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <SectionHeader index="03" icon={Zap} title="Biểu phí dịch vụ" subtitle="Đồng bộ tự động từ danh mục Admin — không thể chỉnh sửa" iconColor="text-amber-500" iconBg="bg-amber-50" />
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ServiceFeeField icon={Zap} iconColor="text-amber-500" label="Tiền điện" value={formData.phi_dien} />
                    <ServiceFeeField icon={Droplet} iconColor="text-sky-500" label="Tiền nước sinh hoạt" value={formData.phi_nuoc} />
                    <ServiceFeeField icon={Wifi} iconColor="text-indigo-500" label="Mạng Internet / Wifi" value={formData.phi_wifi} />
                    <ServiceFeeField icon={Car} iconColor="text-emerald-500" label="Gửi xe máy / xe đạp" value={formData.phi_gui_xe} />
                    <ServiceFeeField icon={Info} iconColor="text-purple-500" label="Phí quản lý tiện ích chung" value={formData.phi_quan_ly} />
                  </div>
                  <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-100">
                    <ShieldCheck size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-[11.5px] text-slate-400 leading-relaxed">
                      Biểu phí trên được khóa cố định theo danh mục cài đặt của Admin để đảm bảo tính thống nhất và tránh sai lệch khi nhân viên nhập liệu.
                    </span>
                  </div>
                </div>
              </section>

              {/* KHỐI 4: ĐIỀU KHOẢN TIỀN CỌC, NỘI QUY VÀ XỬ LÝ VI PHẠM PHÁP LÝ */}
              <section className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <SectionHeader
                  index="04"
                  icon={Scale}
                  title="Điều khoản pháp lý"
                  subtitle="Quy định ràng buộc trách nhiệm hai bên"
                  iconColor="text-[#00502B]"
                  iconBg="bg-green-50"
              />

              <div className="p-6 space-y-5">
                  

                  <TermField
                    icon={CreditCard}
                    label="Quy định hoàn trả hoặc khấu trừ tiền đặt cọc"
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
              </section>
            </div>

            {/* ================= CỘT TÓM TẮT (STICKY) ================= */}
            <aside className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-[#00502B] text-white">
                  <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Tóm tắt hợp đồng</p>
                  <p className="text-sm font-bold mt-0.5">{serverData?.khach_hang_ten || 'Khách thuê'}</p>
                </div>
                <div className="p-5 space-y-4 text-sm">
                  <SummaryRow label="Phòng / Giường" value={`${formData.ma_phong} · ${formData.ma_giuong}`} />
                  <SummaryRow label="Hình thức thuê" value={formData.hinh_thuc_thue} />
                  <SummaryRow label="Hiệu lực từ" value={formatDate(formData.ngay_bat_dau)} />
                  <SummaryRow label="Đến ngày" value={formatDate(formData.ngay_ket_thuc)} />
                  <SummaryRow label="Thời hạn" value={`${formData.thoi_han_thue_thang} tháng`} />
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Giá thuê / tháng</span>
                    <span className="font-extrabold text-[#00502B] text-lg">{formatCurrency(formData.gia_thue_thang)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tiền cọc</span>
                    <span className="font-bold text-rose-600">{formatCurrency(formData.tien_coc)}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-[#00502B] text-white font-bold rounded-xl hover:bg-[#003d20] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm shadow-md"
                >
                  {submitting ? 'Đang khởi tạo…' : 'Khởi tạo hợp đồng thuê'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm"
                >
                  Hủy tác vụ
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Hợp đồng sẽ chuyển sang trạng thái <span className="font-semibold text-amber-600">Chờ duyệt</span> sau khi khởi tạo.
                </p>
              </div>
            </aside>
          </div>

          {/* ===== Thanh hành động cố định cho màn hình nhỏ ===== */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] px-4 py-3 bg-[#00502B] text-white font-bold rounded-xl hover:bg-[#003d20] active:scale-[0.99] disabled:opacity-60 transition-all text-sm shadow-md"
            >
              {submitting ? 'Đang khởi tạo…' : 'Khởi tạo hợp đồng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== Các thành phần UI dùng lại (chỉ trình bày, không đổi logic) ==================== */

function SectionHeader({
  index, icon: Icon, title, subtitle, iconColor = 'text-[#00502B]', iconBg = 'bg-[#00502B]/10'
}: { index: string; icon: any; title: string; subtitle: string; iconColor?: string; iconBg?: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
      <span className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={iconColor} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-300 tabular-nums">{index}</span>
          <h2 className="text-[13px] font-bold text-slate-700 uppercase tracking-wide truncate">{title}</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
        <Icon size={12} className="text-slate-300" /> {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, children, highlight = false }: { icon: any; label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`p-3.5 rounded-xl border ${highlight ? 'bg-[#00502B]/[0.04] border-[#00502B]/15' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1 mb-1.5">
        <Icon size={11} /> {label}
      </p>
      {children}
    </div>
  );
}

function ServiceFeeField({ icon: Icon, iconColor, label, value }: { icon: any; iconColor: string; label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1.5">
        <Icon size={13} className={iconColor} /> {label}
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 cursor-not-allowed"
      />
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
      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <Icon size={14} className={iconColor} /> {label}
      </label>

      {expanded ? (
        <>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            autoFocus
            className="w-full p-3.5 border border-slate-200 rounded-xl text-[13px] leading-relaxed text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00502B]/20 focus:border-[#00502B] transition-colors resize-none overflow-hidden"
            style={{ minHeight: '84px' }}
            required
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#00502B] hover:underline"
          >
            Thu gọn <ChevronUp size={13} />
          </button>
        </>
      ) : (
        <>
          <div
            onClick={() => setExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setExpanded(true); }}
            className="w-full p-3.5 border border-slate-200 rounded-xl bg-white text-[13px] leading-relaxed text-slate-600 cursor-text hover:border-slate-300 transition-colors"
          >
            <p className={isLong ? 'line-clamp-3' : ''}>
              {value || <span className="text-slate-400 italic">Chưa có nội dung, bấm để nhập…</span>}
            </p>
          </div>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#00502B] hover:underline"
            >
              Xem thêm <ChevronDown size={13} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-semibold text-slate-700 text-xs text-right">{value}</span>
    </div>
  );
}