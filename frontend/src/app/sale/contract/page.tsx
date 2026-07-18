'use client';
import React, { useEffect, useState } from 'react';
import { FileText, Search, Eye, Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface Contract {
  ma_hop_dong: string;
  ma_phieu_dang_ky: string;
  ten_khach_hang: string;
  trang_thai: string;
  nguoi_tao: string;
  nguoi_phe_duyet: string;
  created_at: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Chờ ký':
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Chờ ký</span>;
    case 'Đã ký':
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Đã ký</span>;
    case 'Đang hiệu lực':
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Đang hiệu lực</span>;
    case 'Hết hạn':
      return <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">Hết hạn</span>;
    case 'Đã thanh lý':
      return <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Đã thanh lý</span>;
    default:
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{status || 'Không xác định'}</span>;
  }
};

export default function ContractListPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filtered, setFiltered] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    let result = contracts;
    if (search.trim()) {
      result = result.filter(
        (c) =>
          c.ma_hop_dong.toLowerCase().includes(search.toLowerCase()) ||
          c.ten_khach_hang?.toLowerCase().includes(search.toLowerCase()) ||
          c.ma_phieu_dang_ky?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus !== 'Tất cả') {
      result = result.filter((c) => c.trang_thai === filterStatus);
    }
    setFiltered(result);
  }, [search, filterStatus, contracts]);

  const fetchContracts = async () => {
    try {
      const res = await axiosInstance.get('/contracts');
      setContracts(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách hợp đồng:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#00502B] mb-2">Danh sách Hợp đồng</h1>
            <p className="text-gray-500 text-sm">Quản lý và theo dõi tất cả hợp đồng thuê phòng.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-4 mb-6 border-b border-gray-100 pb-6 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tìm kiếm</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mã HĐ, khách hàng..."
                className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 w-full text-sm text-gray-700 focus:outline-none focus:border-[#00502B]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[160px] text-sm text-gray-700 focus:outline-none focus:border-[#00502B]"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Chờ ký">Chờ ký</option>
              <option value="Đã ký">Đã ký</option>
              <option value="Đang hiệu lực">Đang hiệu lực</option>
              <option value="Hết hạn">Hết hạn</option>
              <option value="Đã thanh lý">Đã thanh lý</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-100">
                <th className="py-4 px-4 font-semibold text-sm">Mã HĐ</th>
                <th className="py-4 px-4 font-semibold text-sm">Mã Phiếu ĐK</th>
                <th className="py-4 px-4 font-semibold text-sm">Khách hàng</th>
                <th className="py-4 px-4 font-semibold text-sm">Trạng thái</th>
                <th className="py-4 px-4 font-semibold text-sm">Người tạo</th>
                <th className="py-4 px-4 font-semibold text-sm">Ngày tạo</th>
                <th className="py-4 px-4 font-semibold text-sm text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00502B] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Không tìm thấy hợp đồng nào</p>
                    <p className="text-gray-400 text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.ma_hop_dong}
                    className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sale/contract/${c.ma_hop_dong}`)}
                  >
                    <td className="py-5 px-4 font-bold text-[#00502B] font-mono">#{c.ma_hop_dong}</td>
                    <td className="py-5 px-4 text-gray-500 text-sm">{c.ma_phieu_dang_ky || '—'}</td>
                    <td className="py-5 px-4 font-medium text-gray-800">{c.ten_khach_hang || '—'}</td>
                    <td className="py-5 px-4">{getStatusBadge(c.trang_thai)}</td>
                    <td className="py-5 px-4 text-gray-600 text-sm">{c.nguoi_tao || '—'}</td>
                    <td className="py-5 px-4 text-gray-600 text-sm">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/sale/contract/${c.ma_hop_dong}`);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00502B] hover:text-[#003d20] px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <Eye size={14} />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Hiển thị <span className="font-semibold text-gray-600">{filtered.length}</span> / <span className="font-semibold text-gray-600">{contracts.length}</span> hợp đồng
          </div>
        )}
      </div>
    </div>
  );
}