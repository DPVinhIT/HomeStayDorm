'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, User, Building, Paperclip, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clearApiCache } from '@/lib/cache';
import api from '@/lib/axios';

export default function RegistrationDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/contracts/registrations/${encodeURIComponent(id)}`);
        if (response.data && response.data.data) {
          setData(response.data.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch detail:', err);
        setError('Không thể tải chi tiết phiếu đăng ký');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const openConfirmModal = (newStatus: string) => {
    setPendingStatus(newStatus);
    setIsConfirmOpen(true);
  };

  const executeStatusChange = async () => {
    if (!pendingStatus) return;
    setIsUpdating(true);

    try {
      await api.patch(`/contracts/registrations/${encodeURIComponent(id)}/status`, {
        status: pendingStatus
      });
      // Update local state to reflect change
      setData((prev: any) => ({ ...prev, status: pendingStatus }));
      setIsConfirmOpen(false);
      clearApiCache(); // Xoá cache để danh sách tự fetch lại data mới nhất
    } catch (err) {
      console.error('Failed to update status:', err);
      // Fallback alert for error only
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || 'Không tìm thấy dữ liệu'}</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-full max-w-6xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/manager/registration" className="hover:text-green-600 transition-colors">
              Phiếu đăng ký
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{data.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết phiếu đăng ký</h1>
            <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
              {data.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.status === 'Đã duyệt' ? (
            <span className="text-green-600 font-medium flex items-center gap-2 bg-green-50 px-4 py-2 rounded-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Phiếu đã được phê duyệt
            </span>
          ) : data.status === 'Từ chối' ? (
            <button 
              onClick={() => openConfirmModal('Đang xử lý')}
              className="px-6 py-2 border border-gray-400 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              KHÔI PHỤC (ĐANG XỬ LÝ)
            </button>
          ) : (
            <>
              <button 
                onClick={() => openConfirmModal('Từ chối')}
                className="px-6 py-2 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50 transition-colors"
              >
                TỪ CHỐI
              </button>
              <button 
                onClick={() => openConfirmModal('Đã duyệt')}
                className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors shadow-sm"
              >
                PHÊ DUYỆT
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 opacity-50"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Thông tin khách hàng</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="text-sm text-gray-500 mb-1">Họ và tên</div>
              <div className="font-semibold text-gray-900">{data.customer.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
              <div className="font-semibold text-gray-900">{data.customer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email</div>
              <div className="font-semibold text-gray-900">{data.customer.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">CCCD/CMND</div>
              <div className="font-semibold text-gray-900">{data.customer.cccd}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Nghề nghiệp</div>
              <div className="font-semibold text-gray-900">{data.customer.job}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Room & Attachments */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Room Requirement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Nhu cầu phòng thuê</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="border-b border-gray-100 pb-2">
                <div className="text-sm text-gray-500 mb-1">Tòa nhà / Cơ sở</div>
                <div className="font-semibold text-gray-900">{data.room.branch}</div>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <div className="text-sm text-gray-500 mb-1">Loại phòng</div>
                <div className="font-semibold text-gray-900">{data.room.type}</div>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <div className="text-sm text-gray-500 mb-1">Mức giá dự kiến</div>
                <div className="font-bold text-green-600 text-lg">{data.room.price}<span className="text-sm font-medium">/tháng</span></div>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <div className="text-sm text-gray-500 mb-1">Số lượng người ở</div>
                <div className="font-semibold text-gray-900">1 - 2 người</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ngày dự kiến chuyển vào</div>
                <div className="font-semibold text-gray-900">{data.room.moveInDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Thời hạn thuê</div>
                <div className="font-semibold text-gray-900">{data.room.duration}</div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Ghi chú thêm từ khách hàng</div>
              <div className="text-gray-800 text-sm italic">&quot;{data.room.note}&quot;</div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Paperclip className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tệp đính kèm</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:border-green-500 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center text-white">
                      <span className="text-xs font-bold border-2 border-white rounded px-1">ID</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.size} • {file.time}</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 p-2">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-2 ${pendingStatus === 'Từ chối' ? 'text-red-600' : 'text-gray-900'}`}>
                {pendingStatus === 'Từ chối' ? 'Cảnh báo từ chối' : 'Xác nhận thay đổi'}
              </h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn thay đổi trạng thái của phiếu đăng ký này thành <span className={`font-semibold ${pendingStatus === 'Từ chối' ? 'text-red-600' : 'text-green-700'}`}>&quot;{pendingStatus}&quot;</span> không?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-600 font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeStatusChange}
                disabled={isUpdating}
                className={`px-6 py-2 text-white font-medium rounded-md transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 ${
                  pendingStatus === 'Từ chối' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
