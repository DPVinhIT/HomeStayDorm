'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Bell, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function RegistrationListPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterRoom, setFilterRoom] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/registration');
      if (res.data) {
        setRegistrations(res.data);
        setFilteredRegistrations(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch registrations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleFilter = () => {
    let filtered = registrations;
    if (filterRoom !== 'Tất cả') {
      filtered = filtered.filter((r: any) => (r.loai_phong_mong_muon || 'Studio Premium') === filterRoom);
    }
    if (filterStatus !== 'Tất cả') {
      filtered = filtered.filter((r: any) => r.trang_thai === filterStatus);
    }
    setFilteredRegistrations(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'CHO_XU_LY':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Mới</span>;
      case 'DANG_XU_LY':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Đang xử lý</span>;
      case 'DA_CHUYEN_DOI':
        return <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">Đã chuyển đổi</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  // Get unique room types for the dropdown
  const roomTypes = ['Tất cả', ...Array.from(new Set(registrations.map((r: any) => r.loai_phong_mong_muon || 'Studio Premium')))];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#00502B] mb-2">Danh sách Phiếu đăng kí</h1>
            <p className="text-gray-500 text-sm">Quản lý các yêu cầu thuê phòng từ khách hàng.</p>
          </div>
          <button 
            onClick={() => router.push('/sale/registration/create')}
            className="bg-[#00502B] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#003d20] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Thêm
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-4 mb-6 border-b border-gray-100 pb-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Loại phòng</label>
            <select 
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[150px] text-sm text-gray-700 focus:outline-none focus:border-[#00502B]"
            >
              {roomTypes.map((rt: any, idx) => (
                <option key={idx} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Trạng thái</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[150px] text-sm text-gray-700 focus:outline-none focus:border-[#00502B]"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="CHO_XU_LY">Mới</option>
              <option value="DANG_XU_LY">Đang xử lý</option>
              <option value="DA_CHUYEN_DOI">Đã chuyển đổi</option>
            </select>
          </div>
          <button 
            onClick={handleFilter}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 text-sm"
          >
            <Filter size={16} /> Lọc
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 border-y border-gray-100">
                <th className="py-4 px-4 font-semibold text-sm">Mã PĐK</th>
                <th className="py-4 px-4 font-semibold text-sm">Khách hàng</th>
                <th className="py-4 px-4 font-semibold text-sm">Loại phòng quan tâm</th>
                <th className="py-4 px-4 font-semibold text-sm">Ngày tạo</th>
                <th className="py-4 px-4 font-semibold text-sm">Trạng thái</th>
                <th className="py-4 px-4 font-semibold text-sm text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Chưa có phiếu đăng ký nào phù hợp với bộ lọc</td>
                </tr>
              ) : (
                filteredRegistrations.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-4 font-bold text-[#00502B]">#{item.ma_phieu}</td>
                    <td className="py-5 px-4 font-medium text-gray-800">{item.khach_hang_ten}</td>
                    <td className="py-5 px-4 text-gray-600">{item.loai_phong_mong_muon || 'Studio Premium'}</td>
                    <td className="py-5 px-4 text-gray-600">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </td>
                    <td className="py-5 px-4">
                      {getStatusBadge(item.trang_thai)}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        {filteredRegistrations.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-sm text-gray-500 pt-4">
            <div>Hiển thị 1-{filteredRegistrations.length} của {filteredRegistrations.length}</div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
