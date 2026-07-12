'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, User, Home, CreditCard,
  Calendar, Phone, Mail, MapPin, FileCheck, Clock,
  Building2, Bed, CheckCircle, AlertCircle
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface ContractDetail {
  id: number;
  ma_hop_dong: string;
  ma_phieu_dang_ky: string;
  phieu_dang_ky_id_num: number;
  trang_thai: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  thoi_han_thue_thang: number;
  gia_thue_thang: number;
  tien_coc: number;
  ky_thanh_toan: string;
  created_at: string;
  approved_at: string | null;
  mau_hop_dong_id: number | null;

  khach_hang_ten: string;
  khach_hang_sdt: string;
  khach_hang_email: string;
  khach_hang_cccd: string;
  khach_hang_dia_chi: string;

  nguoi_tao_ten: string;
  nguoi_phe_duyet_ten: string | null;

  ma_phong: string | null;
  loai_phong: string | null;
  phong_gia_thue: number | null;
  phong_tang: number | null;
  ten_chi_nhanh: string | null;
  ma_giuong: string | null;
  giuong_gia_thue: number | null;
}

const formatCurrency = (val: number | null | undefined) => {
  if (!val) return '—';
  return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN');
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Chờ ký':
      return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', label: 'Chờ ký' };
    case 'Đã ký':
      return { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', label: 'Đã ký' };
    case 'Đang hiệu lực':
      return { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400', label: 'Đang hiệu lực' };
    case 'Hết hạn':
      return { color: 'bg-gray-200 text-gray-600 border-gray-300', dot: 'bg-gray-400', label: 'Hết hạn' };
    case 'Đã thanh lý':
      return { color: 'bg-red-100 text-red-600 border-red-200', dot: 'bg-red-400', label: 'Đã thanh lý' };
    default:
      return { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', label: status };
  }
};

const kyThanhToanLabel = (val: string) => {
  switch (val) {
    case '1_THANG': return 'Hàng tháng';
    case '3_THANG': return 'Hàng quý (3 tháng)';
    case '6_THANG': return 'Nửa năm (6 tháng)';
    case '12_THANG': return 'Hàng năm (12 tháng)';
    default: return val || '—';
  }
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/contracts/${id}`);
        setData(res.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải dữ liệu hợp đồng.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00502B] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-700 font-medium">{error || 'Không tìm thấy hợp đồng'}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-[#00502B] hover:underline">
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusConfig(data.trang_thai);

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4">
      {/* Back button + header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs text-gray-400">Danh sách hợp đồng</p>
          <h1 className="text-xl font-bold text-gray-800">Chi tiết hợp đồng</h1>
        </div>
      </div>

      {/* Title card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00502B]/10 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-[#00502B]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#00502B]">#{data.ma_hop_dong}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Phiếu ĐK: <span className="font-medium text-gray-700">#{data.ma_phieu_dang_ky}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusCfg.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-50 pt-4">
          <span className="flex items-center gap-1"><Clock size={12} /> Ngày tạo: <span className="text-gray-600 font-medium">{formatDateTime(data.created_at)}</span></span>
          <span className="flex items-center gap-1"><User size={12} /> Người tạo: <span className="text-gray-600 font-medium">{data.nguoi_tao_ten || '—'}</span></span>
          {data.approved_at && (
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> Phê duyệt: <span className="text-gray-600 font-medium">{formatDateTime(data.approved_at)}</span></span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Thông tin khách hàng */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <User size={16} className="text-[#00502B]" /> Thông tin khách thuê
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Họ và tên</p>
                <p className="font-semibold text-gray-800">{data.khach_hang_ten || '—'}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{data.khach_hang_sdt || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="font-medium text-gray-800">{data.khach_hang_email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileCheck size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">CCCD / CMND</p>
                  <p className="font-medium text-gray-800">{data.khach_hang_cccd || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Địa chỉ thường trú</p>
                  <p className="font-medium text-gray-800">{data.khach_hang_dia_chi || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin phòng/giường */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <Home size={16} className="text-[#00502B]" /> Thông tin phòng thuê
            </h3>
            {data.ma_phong ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 size={14} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Mã phòng</p>
                    <p className="font-bold text-[#00502B]">{data.ma_phong}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Loại phòng</p>
                  <p className="font-medium text-gray-800">{data.loai_phong || '—'}</p>
                </div>
                {data.ma_giuong && (
                  <div className="flex items-start gap-2">
                    <Bed size={14} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Mã giường</p>
                      <p className="font-medium text-gray-800">{data.ma_giuong}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tầng</p>
                  <p className="font-medium text-gray-800">{data.phong_tang ? `Tầng ${data.phong_tang}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Chi nhánh</p>
                  <p className="font-medium text-gray-800">{data.ten_chi_nhanh || '—'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Chưa gán phòng / giường cụ thể</p>
            )}
          </div>

          {/* Thời hạn hợp đồng */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <Calendar size={16} className="text-[#00502B]" /> Thời hạn hợp đồng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Ngày bắt đầu</p>
                <p className="font-semibold text-gray-800">{formatDate(data.ngay_bat_dau)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Ngày kết thúc</p>
                <p className="font-semibold text-gray-800">{formatDate(data.ngay_ket_thuc)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Thời hạn</p>
                <p className="font-semibold text-[#00502B]">{data.thoi_han_thue_thang} tháng</p>
              </div>
            </div>

            {/* Timeline bar */}
            {data.ngay_bat_dau && data.ngay_ket_thuc && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{formatDate(data.ngay_bat_dau)}</span>
                  <span>{formatDate(data.ngay_ket_thuc)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00502B] to-green-400 rounded-full"
                    style={{
                      width: (() => {
                        const start = new Date(data.ngay_bat_dau).getTime();
                        const end = new Date(data.ngay_ket_thuc).getTime();
                        const now = Date.now();
                        if (now <= start) return '0%';
                        if (now >= end) return '100%';
                        return `${Math.round(((now - start) / (end - start)) * 100)}%`;
                      })()
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right col: Thanh toán */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <CreditCard size={16} className="text-[#00502B]" /> Chi tiết thanh toán
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Giá thuê / tháng</p>
                <p className="text-2xl font-bold text-[#00502B]">{formatCurrency(data.gia_thue_thang)}</p>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Tiền cọc</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(data.tien_coc)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Kỳ thanh toán</span>
                  <span className="font-semibold text-gray-800">{kyThanhToanLabel(data.ky_thanh_toan)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-50 mt-1">
                  <span className="text-gray-500">Tổng giá trị HĐ</span>
                  <span className="font-bold text-[#00502B]">
                    {formatCurrency((data.gia_thue_thang || 0) * (data.thoi_han_thue_thang || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-50">
              Liên kết nhanh
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push(`/sale/registration/${data.phieu_dang_ky_id_num}`)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 text-sm text-[#00502B] font-medium"
              >
                <FileText size={14} />
                Xem Phiếu đăng ký #{data.ma_phieu_dang_ky}
              </button>
            </div>
          </div>

          {/* Người phê duyệt */}
          {data.nguoi_phe_duyet_ten && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-green-600" />
                <p className="text-xs font-semibold text-green-700">Đã được phê duyệt</p>
              </div>
              <p className="text-sm font-semibold text-green-800">{data.nguoi_phe_duyet_ten}</p>
              {data.approved_at && (
                <p className="text-xs text-green-600 mt-0.5">{formatDateTime(data.approved_at)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
