"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';

// Component chứa nội dung form chính
function CreateReceiptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Nhận mã ID từ URL truyền sang, mặc định nếu lỗi là đơn đầu tiên
  const targetId = searchParams.get('id') || ''; 
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '0',
    payer: '',
    reason: '',
    method: 'Tiền mặt'
  });
  
  // Trạng thái cho hình ảnh minh chứng
  const [proofImage, setProofImage] = useState<File | null>(null);

  // Gọi API lấy dữ liệu phiếu đặt cọc thật
  useEffect(() => {
    if (!targetId) return;
    
    const fetchDeposit = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/deposits/${targetId}`);
        const data = res.data?.data;
        if (data) {
          setFormData({
            amount: Number(data.thanh_toan?.tien_coc_yeu_cau || 0).toLocaleString('vi-VN'),
            payer: data.khach_thue?.ho_ten || '',
            reason: `Thu tiền đặt cọc phòng ${data.thong_tin_phong?.ten_phong} – ${data.thong_tin_phong?.toa_nha_tang.split(' - ')[0]}`,
            method: 'Tiền mặt'
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin phiếu cọc:', error);
        alert('Không thể tải dữ liệu phiếu đặt cọc!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeposit();
  }, [targetId]);

  // Xử lý khi nhấn nút Thanh toán
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (formData.method === 'Chuyển khoản' && !proofImage) {
      alert('Vui lòng upload hình ảnh minh chứng chuyển khoản!');
      return;
    }

    try {
      setSubmitting(true);
      // Gọi API cập nhật trạng thái phiếu cọc
      await axiosInstance.patch(`/deposits/${targetId}/status`, {
        status: 'DA_THANH_TOAN'
      });
      
      // Lưu lại thông tin phương thức và ảnh lên localStorage để mô phỏng cho Manager
      localStorage.setItem(`mock_payment_${targetId}`, JSON.stringify({
        method: formData.method,
        fileName: proofImage ? proofImage.name : null
      }));

      // Mở Pop-up thông báo thành công
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      alert('Có lỗi xảy ra khi phê duyệt thanh toán!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofImage(e.target.files[0]);
    }
  };

  if (loading) {
    return <div className="w-full p-6 text-center text-gray-500">Đang tải dữ liệu phiếu thu...</div>;
  }

  return (
    <div className="w-full p-6 bg-[#f8f9fa] min-h-screen text-[#212529]">
      {/* Điều hướng nhanh Breadcrumbs */}
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1 font-medium">
        <span className="cursor-pointer hover:text-[#044327] hover:underline" onClick={() => router.push('/accountant/deposit')}>
          Yêu cầu đặt cọc
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700">Tạo phiếu thanh toán ({targetId})</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">Tạo phiếu thanh toán</h1>

      {/* Form nhập liệu */}
      <div className="max-w-3xl bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Thông tin chung */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-[#044327]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 18.75h.008v.008H12v-.008zM12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-gray-800">Thông tin chung</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Loại phiếu</label>
                <input type="text" value="Phiếu Thu (Đặt cọc)" disabled className="w-full bg-[#f3f4f6] border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Số tiền (VND)</label>
                <div className="relative">
                  <input type="text" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 px-3 py-2 pr-12 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#044327] focus:ring-1 focus:ring-[#044327]" />
                  <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">VND</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết giao dịch */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-[#044327]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-gray-800">Chi tiết giao dịch</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Người nộp/nhận</label>
                <input type="text" value={formData.payer} onChange={(e) => setFormData({...formData, payer: e.target.value})} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#044327] font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lý do</label>
                <textarea rows={3} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#044327] resize-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phương thức thanh toán</label>
                <div className="relative">
                  <select value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#044327] appearance-none cursor-pointer font-medium">
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  </select>
                  <span className="absolute right-3 top-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Upload minh chứng (Chỉ hiển thị nếu là Chuyển khoản) */}
            {formData.method === 'Chuyển khoản' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Hình ảnh minh chứng giao dịch <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    id="proofUpload" 
                  />
                  <label htmlFor="proofUpload" className="flex flex-col items-center cursor-pointer w-full">
                    {proofImage ? (
                      <div className="text-sm font-medium text-[#044327] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {proofImage.name}
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">Nhấn để tải lên ảnh chụp màn hình</span>
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Các nút bấm */}
          <div className="flex justify-end items-center gap-2 pt-4">
            <button type="button" onClick={() => router.back()} disabled={submitting} className="px-4 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
            <button type="button" disabled={submitting} className="px-4 py-1.5 bg-[#004d26] hover:bg-[#003d1e] text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50">💾 Lưu</button>
            <button type="submit" disabled={submitting} className="px-5 py-1.5 bg-[#044327] hover:bg-[#03341e] text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50">
              {submitting ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up Phê duyệt thành công (Modal Overlay) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#f2f7f4] rounded-2xl p-8 max-w-xs w-full mx-4 shadow-xl border border-white/40 flex flex-col items-center text-center animate-scale-up">
            <div className="w-14 h-14 bg-[#044327] rounded-full flex items-center justify-center mb-4 text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-5 tracking-wide">Thanh toán thành công!</h3>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/accountant/deposit');
              }}
              className="w-full bg-[#044327] hover:bg-[#03341e] text-white py-2 rounded-xl text-xs font-bold shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Bọc cổng bảo vệ Suspense để Next.js không lỗi render tĩnh (Static Generation) khi dùng SearchParams
export default function CreateReceiptPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-gray-500">Đang tải dữ liệu biểu mẫu...</div>}>
      <CreateReceiptForm />
    </Suspense>
  );
}