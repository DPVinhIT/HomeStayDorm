'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

// Định nghĩa type cho dữ liệu chi tiết
type DepositDetail = {
  id: string;
  phieu_dang_ky_id: string;
  ma_phieu: string;
  ngay_tao: string;
  nguoi_tao: string;
  trang_thai: string;
  khach_thue: {
    ho_ten: string;
    so_dien_thoai: string;
    cccd: string;
    email: string;
    dia_chi: string;
  };
  thong_tin_phong: {
    ten_phong: string;
    toa_nha_tang: string;
    loai_phong: string;
    dien_tich: string;
    gia_thue: number;
    noi_that: string;
  };
  thanh_toan: {
    tien_coc_yeu_cau: number;
    da_thanh_toan: number;
    phuong_thuc: string;
    thoi_han_giu_phong: string;
    ghi_chu: string;
    chung_tu: string;
  };
};

export default function SaleDepositDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<DepositDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hàm fetch dữ liệu chi tiết
  const fetchDepositDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/deposits/${id}`);
      
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        setError('Dữ liệu không hợp lệ từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết phiếu đặt cọc:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết phiếu đặt cọc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDepositDetail();
    }
  }, [id]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const formatStatus = (status: string) => {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
      'KHOI_TAO': 'Khởi tạo',
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DA_XAC_NHAN': 'Đã xác nhận',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_THANH_TOAN': 'Đã thanh toán',
      'CHO_PHE_DUYET': 'Chờ phê duyệt',
      'DA_PHE_DUYET': 'Đã phê duyệt',
      'TU_CHOI': 'Từ chối',
      'DA_HUY': 'Đã hủy',
      'HOAN_THANH': 'Hoàn thành',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'CHO_XU_LY': 'Mới',
      'DANG_XU_LY': 'Đang xử lý',
      'DA_CHUYEN_DOI': 'Đã chuyển đổi',
      'CHO_DUYET': 'Chờ duyệt',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải chi tiết phiếu đặt cọc...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error || 'Không tìm thấy thông tin phiếu đặt cọc.'}</div>
        <button 
          onClick={() => router.push('/sale/deposit')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isPending = data.trang_thai.toLowerCase().includes('chờ');
  const isPaidOrApproved = data.trang_thai === 'Đã phê duyệt' || data.trang_thai === 'DA_PHE_DUYET';

  return (
    <div className="p-8 bg-white min-h-screen relative pb-24">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <Link href="/sale/deposit" className="hover:text-black transition-colors">Danh sách phiếu đặt cọc</Link>
          <span>&gt;</span>
          <span className="text-gray-900">Chi tiết phiếu đặt cọc</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Mã Phiếu: #{data.ma_phieu}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            isPending 
              ? 'bg-orange-50 text-orange-600 border-orange-100' 
              : isPaidOrApproved
                ? 'bg-green-50 text-green-600 border-green-100'
                : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {formatStatus(data.trang_thai)}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Ngày tạo: {data.ngay_tao} - Người tạo: {data.nguoi_tao}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cột trái */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Thông tin khách thuê
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 border-b border-gray-100 pb-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                <p className="font-medium text-gray-900">{data.khach_thue.ho_ten}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                <p className="font-medium text-gray-900">{data.khach_thue.so_dien_thoai}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CCCD/CMND</p>
                <p className="font-medium text-gray-900">{data.khach_thue.cccd}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{data.khach_thue.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Địa chỉ thường trú</p>
              <p className="font-medium text-gray-900">{data.khach_thue.dia_chi}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              Thông tin phòng chọn
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-[#eefcf1] border border-[#d1f4db] rounded-lg p-6 flex flex-col items-center justify-center min-w-[160px]">
                <h3 className="text-4xl font-bold text-[#1a5d2b] mb-2">{data.thong_tin_phong.ten_phong}</h3>
                <p className="text-sm text-gray-500">{data.thong_tin_phong.toa_nha_tang}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Loại phòng</p>
                  <p className="font-medium text-gray-900">{data.thong_tin_phong.loai_phong}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Giá thuê cơ bản</p>
                  <p className="font-bold text-[#1a5d2b]">{formatCurrency(data.thong_tin_phong.gia_thue)}/tháng</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                  <p className="font-medium text-gray-900">{data.thong_tin_phong.dien_tich}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nội thất</p>
                  <p className="font-medium text-gray-900">{data.thong_tin_phong.noi_that}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Thanh toán */}
        <div className="bg-[#f8fbf8] border border-[#e2f0e5] rounded-xl p-6 h-fit">
          <h2 className="font-bold text-[#1a5d2b] text-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Chi tiết thanh toán
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiền cọc yêu cầu</span>
              <span className="font-medium text-gray-900">{formatCurrency(data.thanh_toan.tien_coc_yeu_cau)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đã thanh toán</span>
              <span className="font-bold text-[#1a5d2b]">{formatCurrency((isPaidOrApproved) ? data.thanh_toan.tien_coc_yeu_cau : data.thanh_toan.da_thanh_toan)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-start pt-2">
              <span className="text-sm text-gray-600 w-24">Phương thức</span>
              <div className="flex items-center gap-2 text-right">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                <span className="text-sm font-medium text-gray-900 whitespace-pre-line">
                  {data.thanh_toan.phuong_thuc}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs text-gray-500 mb-2">Chứng từ kèm theo</p>
            <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 overflow-hidden">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {data.thanh_toan.chung_tu || 'Chưa có chứng từ'}
                </span>
              </div>
              <button className="text-gray-500 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
            </div>
          </div>

          {/* Nút hành động */}
          <div>
            <p className="text-xs text-center text-gray-500 mb-3">
              {isPaidOrApproved
                ? "Phiếu đã được thanh toán/phê duyệt. Bạn có thể tiến hành lập hợp đồng."
                : isPending
                  ? "Chờ Kế toán xác nhận thanh toán tiền cọc."
                  : "Phiếu đặt cọc này đã bị hủy hoặc hết hạn."}
            </p>
            
            <div className="space-y-3">
              {/* Nút Lập hợp đồng (Cho Sale) */}
              {isPaidOrApproved && (
                <button 
                  onClick={() => router.push(`/sale/contract/create?registration_id=${data.phieu_dang_ky_id}`)}
                  className="w-full py-3 bg-[#00502B] text-white rounded-lg font-bold hover:bg-[#003d20] transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Lập hợp đồng thuê
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nút Quay Lại */}
      <div className="mt-4">
        <button 
          onClick={() => router.push('/sale/deposit')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại danh sách
        </button>
      </div>

    </div>
  );
}
