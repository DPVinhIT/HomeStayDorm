'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Search, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';

interface Registration {
  id: string;
  customer: {
    name: string;
    phone: string;
    initials: string;
    color: string;
  };
  roomType: string;
  date: string;
  time: string;
  status: string;
}

const mockRegistrations = [
  {
    id: '#PDK-2023-001',
    customer: {
      name: 'Nguyễn Văn A',
      phone: '0901 234 567',
      initials: 'NV',
      color: 'bg-green-100 text-green-700',
    },
    roomType: 'Studio - Hướng Đông',
    date: '24/10/2023',
    time: '09:30',
    status: 'Mới',
  },
  {
    id: '#PDK-2023-002',
    customer: {
      name: 'Trần Thị B',
      phone: '0987 654 321',
      initials: 'TB',
      color: 'bg-gray-200 text-gray-700',
    },
    roomType: '1 Phòng ngủ - Tầng cao',
    date: '23/10/2023',
    time: '14:15',
    status: 'Đang xử lý',
  },
  {
    id: '#PDK-2023-003',
    customer: {
      name: 'Lê Văn M',
      phone: '0912 345 678',
      initials: 'LM',
      color: 'bg-blue-100 text-blue-700',
    },
    roomType: '2 Phòng ngủ - Ban công',
    date: '22/10/2023',
    time: '10:00',
    status: 'Đã liên hệ',
  },
  {
    id: '#PDK-2023-004',
    customer: {
      name: 'Phạm Thu H',
      phone: '0933 111 222',
      initials: 'PH',
      color: 'bg-red-100 text-red-700',
    },
    roomType: 'Studio - Tiêu chuẩn',
    date: '21/10/2023',
    time: '16:45',
    status: 'Từ chối',
  },
  {
    id: '#PDK-2023-005',
    customer: {
      name: 'Hoàng Anh',
      phone: '0977 888 999',
      initials: 'HA',
      color: 'bg-green-100 text-green-700',
    },
    roomType: '1 Phòng ngủ - Gần thang máy',
    date: '20/10/2023',
    time: '08:20',
    status: 'Đã duyệt',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Mới':
      return <span className="px-3 py-1 text-xs font-medium bg-green-700 text-white rounded-full">{status}</span>;
    case 'Đang xử lý':
    case 'Đã liên hệ':
      return <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">{status}</span>;
    case 'Từ chối':
      return <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">{status}</span>;
    case 'Đã duyệt':
      return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{status}</span>;
    default:
      return <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{status}</span>;
  }
};

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [roomTypeFilter, setRoomTypeFilter] = useState('Loại phòng');

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const response = await api.get('/contracts/registrations', {
          params: { page, limit, status: statusFilter, roomType: roomTypeFilter }
        });
        if (response.data && response.data.data) {
          setRegistrations(response.data.data);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.total);
          }
          setError(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch registrations:', err);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend và Database.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [page, statusFilter, roomTypeFilter]);
  return (
    <div className="flex flex-col gap-6 h-full max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Danh sách phiếu đăng ký thuê</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý các yêu cầu thuê phòng mới từ khách hàng</p>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 outline-none focus:border-green-500 bg-white min-w-[150px]"
            >
              <option>Tất cả trạng thái</option>
              <option>Mới</option>
              <option>Đang xử lý</option>
              <option>Đã duyệt</option>
            </select>
            <select 
              value={roomTypeFilter}
              onChange={(e) => { setRoomTypeFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 outline-none focus:border-green-500 bg-white min-w-[150px]"
            >
              <option>Loại phòng</option>
              <option>Studio</option>
              <option>1 Phòng ngủ</option>
              <option>2 Phòng ngủ</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors">
            <Filter className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã phiếu</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Loại phòng mong muốn</th>
                <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu từ Database...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-500 bg-red-50">
                    <div className="font-semibold">{error}</div>
                    <div className="text-sm mt-1">Lưu ý: Bạn cần cấu hình đúng mật khẩu DATABASE_URL trong backend/.env</div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Chưa có phiếu đăng ký nào</td>
                </tr>
              ) : registrations.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-green-700">
                    {item.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${item.customer.color}`}>
                        {item.customer.initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{item.customer.name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{item.customer.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.roomType}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800">{item.date}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{item.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>
            Hiển thị {totalItems === 0 ? 0 : (page - 1) * limit + 1}-
            {Math.min(page * limit, totalItems)} của {totalItems} phiếu
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading || totalItems === 0}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
