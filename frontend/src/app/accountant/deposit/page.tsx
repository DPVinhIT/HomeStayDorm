"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function AccountantDepositPage() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Bộ lọc trạng thái: 'all' (Tất cả), 'pending' (Chưa thu), 'approved' (Đã thu)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/deposits');
        const deposits = res.data?.data || [];
        // Map API response to match table UI structure
        const mappedData = deposits.map((item: any) => {
          // get initials
          const nameParts = (item.nguoi_dat || 'Không tên').trim().split(' ');
          let initial = '';
          if (nameParts.length > 0) {
            initial = nameParts[0][0];
            if (nameParts.length > 1) {
              initial += nameParts[nameParts.length - 1][0];
            }
          }
          const amountStr = Number(item.so_tien || 0).toLocaleString('vi-VN') + ' đ';
          const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '';
          
          let statusStr = 'pending';
          if (['DA_THANH_TOAN', 'DA_PHE_DUYET', 'HOAN_THANH'].includes(item.trang_thai_code)) {
            statusStr = 'approved';
          } else if (['DA_HUY', 'TU_CHOI', 'HET_HAN'].includes(item.trang_thai_code)) {
            statusStr = 'cancelled';
          }
          
          return {
            id: item.ma_don_coc,
            name: item.nguoi_dat || 'Không tên',
            initial: initial.toUpperCase(),
            room: item.phong !== 'Chưa có phòng' ? `${item.phong} - ${item.toa_nha}` : 'Chưa xếp phòng',
            amount: amountStr,
            date: dateStr,
            status: statusStr
          };
        });
        setData(mappedData);
      } catch (error) {
        console.error('Lỗi lấy danh sách đặt cọc:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý tìm kiếm và lọc dữ liệu song song
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ? true : item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full p-6 bg-white min-h-screen text-gray-800">
      
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#044327] mb-1">Yêu cầu đặt cọc</h1>
          <p className="text-sm text-gray-500">Quản lý và xử lý các khoản tiền cọc từ người thuê dự kiến.</p>
        </div>
        
        {/* Khung tìm kiếm và Bộ lọc gọn gàng */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Tìm kiếm */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn, tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#044327] focus:ring-1 focus:ring-[#044327]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3.5 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
          </div>

          {/* Bộ lọc Select gọn gàng theo yêu cầu */}
          <div className="relative inline-block w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`w-full md:w-auto appearance-none pl-9 pr-8 py-2 border rounded-xl text-sm font-medium shadow-sm cursor-pointer focus:outline-none transition ${
                filterStatus !== 'all'
                  ? 'border-[#044327] bg-emerald-50 text-[#044327] font-bold'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chưa thu</option>
              <option value="approved">Đã thu</option>
            </select>
            
            {/* Icon Bộ lọc (bên trái) */}
            <span className="absolute left-3 top-2.5 text-gray-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </span>
            
            {/* Mũi tên chỉ xuống (bên phải) */}
            <span className="absolute right-2.5 top-3 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Danh sách bảng hiển thị */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Người thuê dự kiến</th>
                <th className="p-4">Phòng</th>
                <th className="p-4">Số tiền cọc</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-[#055932]">{item.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#d1e7dd] text-[#0f5132] font-semibold text-xs flex items-center justify-center">
                        {item.initial}
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.room}</td>
                  <td className="p-4 font-bold text-gray-900">{item.amount}</td>
                  <td className="p-4 text-gray-500">{item.date}</td>
                  <td className="p-4 text-center">
                    {item.status === 'pending' ? (
                      <button 
                        onClick={() => router.push(`/accountant/deposit/create?id=${encodeURIComponent(item.id)}`)}
                        className="bg-[#044327] hover:bg-[#03341e] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 mx-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Tạo phiếu thu
                      </button>
                    ) : item.status === 'approved' ? (
                      <span className="bg-[#e2f0d9] text-[#385723] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#c4dfb4] inline-flex items-center gap-1">
                        ✓ Đã thu
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 inline-flex items-center gap-1">
                        Đã hủy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400 text-sm font-medium">
                    Không tìm thấy dữ liệu phù hợp với điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}