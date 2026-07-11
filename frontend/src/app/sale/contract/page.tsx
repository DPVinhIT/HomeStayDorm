"use client";

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios'; // Import instance axios của bạn

interface Contract {
  ma_hop_dong: string;
  ma_phieu_dang_ky: string;
  ten_khach_hang: string;
  trang_thai: string;
  nguoi_tao: string;
  nguoi_phe_duyet: string;
  created_at: string;
}

export default function ContractListPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await axiosInstance.get('/contracts');
      setContracts(res.data.data);
    } catch (error) {
      console.error("Lỗi tải danh sách hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách hợp đồng</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Mã HĐ</th>
              <th className="px-4 py-2">Mã Phiếu</th>
              <th className="px-4 py-2">Khách Hàng</th>
              <th className="px-4 py-2">Trạng Thái</th>
              <th className="px-4 py-2">Người Tạo</th>
              <th className="px-4 py-2">Ngày Tạo</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.ma_hop_dong} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{c.ma_hop_dong}</td>
                <td className="px-4 py-2">{c.ma_phieu_dang_ky}</td>
                <td className="px-4 py-2">{c.ten_khach_hang}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    c.trang_thai === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {c.trang_thai}
                  </span>
                </td>
                <td className="px-4 py-2">{c.nguoi_tao}</td>
                <td className="px-4 py-2">
                  {new Date(c.created_at).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}