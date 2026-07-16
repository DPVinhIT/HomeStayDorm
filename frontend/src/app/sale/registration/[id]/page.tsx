'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, User, Users, FileText, 
  CreditCard, Home, Mail, Phone, MapPin, 
  Briefcase, Compass, DollarSign, Clock, Info
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function RegistrationDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);

  const onCreateDeposit = async () => {
    try {
      if (!data?.room?.phong_id) {
        alert("Lỗi: Quản lý chưa xếp phòng chính thức.");
        return;
      }
      setIsCreatingDeposit(true);
      
      const rawPrice = data.room.price ? parseInt(String(data.room.price).replace(/\D/g, '')) : 0;
      const soTienCoc = rawPrice * 2;

      const payload = {
        phieu_dang_ky_id: data.id,
        phong_id: data.room.phong_id,
        giuong_id: data.room.giuong_id || null,
        so_tien_coc: soTienCoc,
        han_thanh_toan: new Date(Date.now() + 86400000).toISOString() // + 1 day
      };

      await axiosInstance.post('/deposits', payload);
      alert('Tạo đơn đặt cọc thành công! Kế toán đã nhận được yêu cầu.');
      fetchDetail();
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo đơn đặt cọc.');
    } finally {
      setIsCreatingDeposit(false);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/registration/${id}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch registration detail', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const formatStatus = (status: string) => {
    if (!status) return 'N/A';
    if (status === 'Đã duyệt') return 'Đã duyệt';
    const statusMap: Record<string, string> = {
      'KHOI_TAO': 'Khởi tạo',
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_THANH_TOAN': 'Đã thanh toán',
      'CHO_PHE_DUYET': 'Chờ phê duyệt',
      'DA_PHE_DUYET': 'Đã duyệt',
      'TU_CHOI': 'Từ chối',
      'DA_HUY': 'Đã hủy',
      'HOAN_THANH': 'Hoàn thành',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'CHO_XU_LY': 'Mới',
      'DANG_XU_LY': 'Đang xử lý',
      'DA_CHUYEN_DOI': 'Đã chuyển đổi',
      'CHO_DUYET': 'Chờ duyệt',
      'DA_DAT_COC': 'Đã đặt cọc',
      'HET_HAN': 'Hết hạn',
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const formatted = formatStatus(status);
    let bg = 'bg-gray-100';
    let text = 'text-gray-600';
    const textLower = formatted.toLowerCase();

    if (textLower === 'mới' || textLower.includes('đã duyệt') || textLower.includes('hoàn thành') || textLower.includes('đã đặt cọc') || textLower.includes('đã thanh toán') || textLower.includes('đã xác nhận')) {
      bg = 'bg-green-100';
      text = 'text-green-700';
    } else if (textLower.includes('chờ') || textLower.includes('đang xử lý') || textLower.includes('khởi tạo')) {
      bg = 'bg-amber-100';
      text = 'text-amber-700';
    } else if (textLower.includes('hủy') || textLower.includes('từ chối')) {
      bg = 'bg-red-100';
      text = 'text-red-700';
    } else if (textLower.includes('đã chuyển đổi') || textLower.includes('đang thực hiện')) {
      bg = 'bg-blue-100';
      text = 'text-blue-700';
    } else {
      bg = 'bg-gray-200';
      text = 'text-gray-700';
    }

    return <span className={`px-3 py-1 ${bg} ${text} text-xs font-semibold rounded-full whitespace-nowrap`}>{formatted}</span>;
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return 'Chưa cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-gray-500">
        <div className="animate-pulse font-medium text-lg">Đang tải chi tiết hồ sơ...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <p className="text-gray-500 mb-4">Không tìm thấy thông tin phiếu đăng ký.</p>
        <button onClick={() => router.back()} className="text-[#00502B] font-semibold flex items-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }
return (
    <div className="max-w-7xl mx-auto pb-24 relative"> {/* Tăng pb-12 thành pb-24 để không bị thanh bottom che mất nội dung */}
      {/* Nút Quay Lại & Tiêu đề chính */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#00502B]">Phiếu Đăng Ký #{data.ma_phieu}</h1>
              {getStatusBadge(data.trang_thai)}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">Ngày tạo hồ sơ: {formatDate(data.created_at)}</p>
          </div>
        </div>
        
        {/* Nhân viên sale phụ trách (Header gọn gàng, không bị rối khi thêm nút) */}
        <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center gap-2 text-sm self-start md:self-auto">
          <User size={16} className="text-gray-400" />
          <span className="text-gray-500">Nhân viên sale:</span>
          <span className="font-semibold text-gray-700">{data.nhan_vien_sale_ten || 'Hệ thống tự động'}</span>
        </div>
      </div>

      {/* Grid Layout chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI + GIỮA: Thông tin Khách & Nhu cầu */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Khối 1: Thông tin khách hàng */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <User size={18} className="text-[#00502B]" /> Thông tin cá nhân khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-center gap-3"><User size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">Họ và tên</p><p className="font-medium text-gray-800">{data.khach_hang_ten}</p></div></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">Số điện thoại</p><p className="font-medium text-gray-800">{data.khach_hang_sdt}</p></div></div>
              <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-800">{data.khach_hang_email || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">CCCD / CMND</p><p className="font-medium text-gray-800">{data.khach_hang_cccd || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">Ngày sinh / Giới tính</p><p className="font-medium text-gray-800">{formatDate(data.khach_hang_ngay_sinh)} ({data.khach_hang_gioi_tinh || 'N/A'})</p></div></div>
              <div className="flex items-center gap-3"><Briefcase size={16} className="text-gray-400" /><div><p className="text-xs text-gray-400">Nghề nghiệp (Quốc tịch)</p><p className="font-medium text-gray-800">{data.khach_hang_nghe_nghiep || 'N/A'} ({data.khach_hang_quoc_tich || 'Việt Nam'})</p></div></div>
              <div className="flex items-start gap-3 md:col-span-2"><MapPin size={16} className="text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-400">Địa chỉ thường trú</p><p className="font-medium text-gray-800">{data.khach_hang_dia_chi || 'N/A'}</p></div></div>
            </div>
          </div>

          {/* Khối 2: Nhu cầu thuê mong muốn */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Home size={18} className="text-[#00502B]" /> Nhu cầu & Tiêu chí thuê phòng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm mb-4">
              <div><p className="text-xs text-gray-400">Hình thức thuê</p><p className="font-semibold text-gray-800 mt-0.5">{data.hinh_thuc_thue || 'Thuê lẻ giường'}</p></div>
              <div><p className="text-xs text-gray-400">Chi nhánh ưu tiên</p><p className="font-semibold text-[#00502B] mt-0.5">{data.chi_nhanh_ten || 'Chưa phân chi nhánh'}</p></div>
              <div><p className="text-xs text-gray-400">Loại phòng mong muốn</p><p className="font-semibold text-gray-800 mt-0.5">{data.loai_phong_mong_muon || 'Studio Premium'}</p></div>
              <div><p className="text-xs text-gray-400">Ngân sách dự kiến</p><p className="font-semibold text-[#00502B] mt-0.5">{formatCurrency(data.muc_gia_mong_muon)}</p></div>
              <div><p className="text-xs text-gray-400">Số lượng người ở</p><p className="font-semibold text-gray-800 mt-0.5">{data.so_luong_nguoi} người ({data.gioi_tinh_nhom || 'N/A'})</p></div>
              <div><p className="text-xs text-gray-400">Ngày dự kiến vào ở (Thời hạn)</p><p className="font-semibold text-gray-800 mt-0.5">{formatDate(data.ngay_du_kien_vao_o)} ({data.thoi_han_thue_thang ? `${data.thoi_han_thue_thang} tháng` : 'N/A'})</p></div>
              <div className="md:col-span-2"><p className="text-xs text-gray-400">Khu vực / Tiêu chí ưu tiên</p><p className="font-medium text-gray-700 mt-0.5">{data.khu_vuc_mong_muon || 'N/A'} - {data.tieu_chi_uu_tien || 'Không có tiêu chí đặc biệt'}</p></div>
            </div>
            {data.ghi_chu && (
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/70 text-amber-900 text-xs">
                <strong>Ghi chú bổ sung:</strong> {data.ghi_chu}
              </div>
            )}
          </div>

          {/* Khối 3: Thành viên ở cùng */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Users size={18} className="text-[#00502B]" /> Thành viên ở cùng ({data.thanh_vien_o_cung?.length || 0})
            </h2>
            {(!data.thanh_vien_o_cung || data.thanh_vien_o_cung.length === 0) ? (
              <p className="text-gray-400 text-sm italic">Hồ sơ này đăng ký ở 1 người, không có thành viên ở cùng.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                      <th className="py-2.5 px-3">Họ tên</th>
                      <th className="py-2.5 px-3">Mối quan hệ</th>
                      <th className="py-2.5 px-3">SĐT</th>
                      <th className="py-2.5 px-3">CCCD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.thanh_vien_o_cung.map((m: any) => (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                        <td className="py-3 px-3 font-medium text-gray-800">{m.ho_ten} ({m.gioi_tinh})</td>
                        <td className="py-3 px-3 text-gray-600"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{m.quan_he || 'Bạn bè'}</span></td>
                        <td className="py-3 px-3 text-gray-600">{m.so_dien_thoai || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600">{m.cccd || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Lịch hẹn, Đặt cọc, Hợp đồng (Dòng đời của khách) */}
        <div className="flex flex-col gap-6">
          
          {/* Khối 4: Lịch hẹn xem phòng */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Calendar size={18} className="text-[#00502B]" /> Lịch xem phòng ({data.lich_hen?.length || 0})
            </h2>
            {(!data.lich_hen || data.lich_hen.length === 0) ? (
              <p className="text-gray-400 text-sm italic">Chưa lên lịch hẹn xem phòng.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.lich_hen.map((a: any) => (
                  <div key={a.id} className="p-3.5 border border-gray-100 rounded-lg bg-gray-50/50 hover:border-gray-200 transition-all text-sm">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-[#00502B]">Phòng: {a.ma_phong || 'Chưa xếp'}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        a.trang_thai === 'CHO_XAC_NHAN' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>{formatStatus(a.trang_thai)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Clock size={12} />
                      <span>{new Date(a.thoi_gian_hen).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="text-xs text-gray-400">Loại: {a.loai_phong || 'N/A'} - {formatCurrency(a.phong_gia_thue)}/tháng</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Khối 5: Trạng thái chốt đơn (Đặt cọc & Hợp đồng) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard size={18} className="text-[#00502B]" /> Tiến độ chuyển đổi giao dịch
            </h2>
            
            <div className="flex flex-col gap-4">
              {/* Box Đặt cọc */}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">1. Thông tin Đặt cọc</p>
                {data.don_dat_coc && data.don_dat_coc.length > 0 ? (
                  <div className="p-3 bg-green-50/60 border border-green-100 rounded-lg text-sm">
                    <div className="flex justify-between font-medium text-green-900">
                      <span>Mã cọc: #{data.don_dat_coc[0].ma_don_coc}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{formatStatus(data.don_dat_coc[0].trang_thai)}</span>
                    </div>
                    <p className="text-lg font-bold text-[#00502B] mt-1">{formatCurrency(data.don_dat_coc[0].so_tien_coc)}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Ngày lập: {formatDate(data.don_dat_coc[0].created_at)}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-100 border-dashed rounded-lg text-center text-xs text-gray-400">
                    Chưa phát sinh giao dịch đặt cọc giữ chỗ
                  </div>
                )}
              </div>

              {/* Box Hợp đồng */}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">2. Hợp đồng chính thức</p>
                {data.hop_dong ? (
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm">
                    <div className="flex justify-between font-medium text-blue-900">
                      <span>Mã HĐ: #{data.hop_dong.ma_hop_dong}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{formatStatus(data.hop_dong.trang_thai)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                      <div>
                        <p className="text-[10px] text-gray-400">Giá thuê/Tháng</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(data.hop_dong.gia_thue_thang)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Thời hạn hợp đồng</p>
                        <p className="font-semibold text-gray-800">{data.hop_dong.thoi_han_thue_thang} tháng</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 border-t border-blue-100/60 pt-2 mt-2">
                      Hiệu lực: {formatDate(data.hop_dong.ngay_bat_dau)} ~ {formatDate(data.hop_dong.ngay_ket_thuc)}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-100 border-dashed rounded-lg text-center text-xs text-gray-400">
                    Chưa ký kết hợp đồng thuê chính thức
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* THANH HÀNH ĐỘNG CỐ ĐỊNH Ở DƯỚI CÙNG (STICKY ACTION BAR) */}
      {data.trang_thai === 'Đã duyệt' && !data.hop_dong && (
        <div className="fixed bottom-0 left-0 md:left-25 lg:left-65 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 py-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden md:block">
              <p className="text-xs text-gray-400">Trạng thái hồ sơ hiện tại</p>
              <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
                {(!data.don_dat_coc || data.don_dat_coc.length === 0) ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Sẵn sàng tạo Đơn đặt cọc
                  </>
                ) : (
                  <>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${(data.don_dat_coc[0].trang_thai === 'DA_PHE_DUYET' || data.don_dat_coc[0].trang_thai === 'Đã phê duyệt') ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    {(data.don_dat_coc[0].trang_thai === 'DA_PHE_DUYET' || data.don_dat_coc[0].trang_thai === 'Đã phê duyệt')
                      ? 'Sẵn sàng lập hợp đồng thuê'
                      : (data.don_dat_coc[0].trang_thai === 'CHO_THANH_TOAN' ? 'Chờ Kế toán thu tiền cọc' : 'Chờ Quản lý duyệt phiếu cọc')
                    }
                  </>
                )}
              </p>
            </div>
            
            {/* Cụm nút bấm hành động */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {(!data.don_dat_coc || data.don_dat_coc.length === 0) ? (
                <button
                  onClick={onCreateDeposit}
                  disabled={isCreatingDeposit}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-sm flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <DollarSign size={16} />
                  {isCreatingDeposit ? 'Đang tạo...' : 'Tạo phiếu đặt cọc'}
                </button>
              ) : (data.don_dat_coc[0].trang_thai === 'DA_PHE_DUYET' || data.don_dat_coc[0].trang_thai === 'Đã phê duyệt') ? (
                <button
                  onClick={() => router.push(`/sale/contract/create?registration_id=${data.id}`)}
                  className="px-6 py-2.5 bg-[#00502B] text-white font-bold rounded-xl hover:bg-[#003d20] shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-sm flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <FileText size={16} />
                  Lập hợp đồng thuê
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed text-sm flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <FileText size={16} />
                  Chưa thể lập HĐ (Cọc chưa xong)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ───────────────────────────────────────────────────────────────── */}

    </div>
  );
}