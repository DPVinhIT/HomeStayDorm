'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

type DepositItem = {
  ma_don_coc: string | number;
  nguoi_dat: string;
  sdt: string;
  phong: string;
  toa_nha: string;
  so_tien: number;
  trang_thai: string;
};

export default function DepositPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get('/deposits');
        const payload = response?.data?.data ?? response?.data ?? [];
        const data = Array.isArray(payload) ? payload : [];

        const normalizedDeposits: DepositItem[] = data.map((item: any) => ({
          ma_don_coc: item.ma_don_coc ?? '-',
          nguoi_dat: item.nguoi_dat ?? 'Chưa có thông tin',
          sdt: item.so_dien_thoai ?? 'Chưa có số điện thoại',
          phong: item.ten_phong ?? 'Chưa có phòng',
          toa_nha: item.ten_toa_nha ?? 'Chưa có tòa nhà',
          so_tien: Number(item.so_tien_coc ?? item.so_tien ?? 0),
          trang_thai: item.trang_thai ?? 'Chưa cập nhật',
        }));

        setDeposits(normalizedDeposits);
      } catch (err: any) {
        setError("Không thể tải danh sách phiếu đặt cọc.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(deposits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeposits = deposits.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách phiếu đặt cọc</h1>
          <p className="text-gray-500">
            Quản lý và xét duyệt các yêu cầu đặt cọc phòng từ khách thuê mới.
          </p>
        </div>
        <button className="bg-[#22c55e] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#16a34a] transition w-fit">
          <span>+</span> Tạo phiếu mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Tòa nhà', 'Tầng', 'Trạng thái', 'Tìm kiếm'].map((label) => (
          <div key={label}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
            <input
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              placeholder={`Tất cả ${label.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : deposits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có phiếu đặt cọc nào.</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-600 text-sm">
                  <th className="p-5 font-semibold">Mã phiếu</th>
                  <th className="p-5 font-semibold">Người đặt</th>
                  <th className="p-5 font-semibold">Phòng</th>
                  <th className="p-5 font-semibold">Số tiền (VNĐ)</th>
                  <th className="p-5 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentDeposits.map((item) => (
                  <tr 
                    key={item.ma_don_coc} 
                    onClick={() => router.push(`/manager/deposit/${item.ma_don_coc}`)}
                    className="hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                  >
                    <td className="p-5 font-medium text-gray-800">{item.ma_don_coc}</td>
                    <td className="p-5">
                      <div className="font-semibold text-gray-900">{item.nguoi_dat}</div>
                      <div className="text-gray-400">{item.sdt}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-gray-900">{item.phong}</div>
                      <div className="text-gray-400">{item.toa_nha}</div>
                    </td>
                    <td className="p-5 font-semibold text-gray-900">{formatCurrency(item.so_tien)}</td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-max ${
                          item.trang_thai === 'Đã duyệt' || item.trang_thai === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.trang_thai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="p-5 flex justify-between items-center border-t border-gray-100 text-sm text-gray-500">
              <span>Hiển thị {currentDeposits.length} / {deposits.length} phiếu</span>
              {totalPages > 1 && (
                <div className="flex gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                  >&lt;</button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${currentPage === page ? 'bg-black text-white' : 'border hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="border px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                  >&gt;</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}