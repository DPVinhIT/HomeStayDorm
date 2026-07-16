'use client';

import { useEffect, useState, useMemo } from 'react';
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

  // States cho Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States cho Filters
  const [filterBranch, setFilterBranch] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch dữ liệu từ API
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
          sdt: item.sdt ?? 'Chưa có số điện thoại', 
          phong: item.phong ?? 'Chưa có phòng',
          toa_nha: item.toa_nha ?? 'Chưa có tòa nhà',
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

  // 2. Lấy danh sách Chi nhánh & Tầng tự động từ dữ liệu thực tế
  const { uniqueBranches, uniqueFloors } = useMemo(() => {
    // Lấy chi nhánh không trùng lặp
    const branches = Array.from(new Set(deposits.map((d) => d.toa_nha)))
      .filter((branch) => branch && branch !== 'Chưa có tòa nhà')
      .sort();

    // Lấy số tầng không trùng lặp (tách số đầu tiên từ tên phòng)
    const floors = Array.from(
      new Set(
        deposits.map((d) => {
          const match = d.phong.match(/\d/);
          return match ? match[0] : null;
        })
      )
    )
      .filter((floor): floor is string => floor !== null)
      .sort((a, b) => Number(a) - Number(b));

    return { uniqueBranches: branches, uniqueFloors: floors };
  }, [deposits]);

  // 3. Reset về trang 1 mỗi khi người dùng thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterBranch, filterFloor]);

  // 4. Logic lọc dữ liệu
  const filteredDeposits = deposits.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      item.ma_don_coc.toString().toLowerCase().includes(searchLower) ||
      item.nguoi_dat.toLowerCase().includes(searchLower);

    let matchStatus = true;
    if (filterStatus) {
      const statusLower = item.trang_thai.toLowerCase();
      if (filterStatus === 'CHO_THANH_TOAN') matchStatus = statusLower.includes('chờ');
      else if (filterStatus === 'DA_THANH_TOAN') matchStatus = statusLower.includes('đã thanh toán') || statusLower.includes('duyệt');
      else if (filterStatus === 'HET_HAN') matchStatus = statusLower.includes('hết hạn');
      else if (filterStatus === 'DA_HUY') matchStatus = statusLower.includes('hủy') || statusLower.includes('từ chối');
    }

    const matchBranch = !filterBranch || item.toa_nha === filterBranch;

    let matchFloor = true;
    if (filterFloor) {
      const floorMatch = item.phong.match(/\d/);
      matchFloor = floorMatch ? floorMatch[0] === filterFloor : false;
    }

    return matchSearch && matchStatus && matchBranch && matchFloor;
  }).sort((a, b) => {
    const getScore = (status: string) => {
      if (status === 'Đã thanh toán' || status === 'DA_THANH_TOAN') return 1;
      if (status === 'Chờ thanh toán' || status === 'CHO_THANH_TOAN') return 2;
      return 3;
    };
    return getScore(a.trang_thai) - getScore(b.trang_thai);
  });

  // 5. Pagination logic
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeposits = filteredDeposits.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    return value.toLocaleString('vi-VN');
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách phiếu đặt cọc</h1>
          <p className="text-gray-500">
            Xem tiến trình và quản lý các yêu cầu đặt cọc phòng từ khách thuê.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Lọc Chi Nhánh (Tự động theo dữ liệu) */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Chi nhánh</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-green-500 hover:border-green-400 transition-colors bg-gray-50/50 cursor-pointer text-gray-700"
            >
              <option value="">Tất cả chi nhánh</option>
              {uniqueBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Tầng (Tự động theo dữ liệu) */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Tầng</label>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-green-500 hover:border-green-400 transition-colors bg-gray-50/50 cursor-pointer text-gray-700"
            >
              <option value="">Tất cả các tầng</option>
              {uniqueFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Tầng {floor}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng Thái (Cố định) */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-green-500 hover:border-green-400 transition-colors bg-gray-50/50 cursor-pointer text-gray-700"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CHO_THANH_TOAN">Chờ thanh toán</option>
              <option value="DA_THANH_TOAN">Đã thanh toán</option>
              <option value="HET_HAN">Hết hạn</option>
              <option value="DA_HUY">Đã hủy</option>
            </select>
          </div>

          {/* Tìm kiếm */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 pl-9 text-sm text-black outline-none focus:ring-1 focus:ring-green-500 hover:border-green-400 transition-colors bg-gray-50/50"
                placeholder="Tên KH hoặc mã đơn..."
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không tìm thấy phiếu đặt cọc nào phù hợp với bộ lọc.</div>
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
                    onClick={() => router.push(`/sale/deposit/${item.ma_don_coc}`)}
                    className="hover:bg-gray-50 transition-colors text-sm cursor-pointer"
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
                          item.trang_thai === 'Đã thanh toán' || item.trang_thai === 'DA_THANH_TOAN' || item.trang_thai === 'Đã duyệt' || item.trang_thai === 'DA_PHE_DUYET'
                            ? 'bg-green-100 text-green-700'
                            : item.trang_thai === 'Đã hủy' || item.trang_thai === 'DA_HUY' || item.trang_thai === 'Hết hạn' || item.trang_thai === 'Từ chối'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {formatStatus(item.trang_thai)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="p-5 flex justify-between items-center border-t border-gray-100 text-sm text-gray-500">
              <span>Hiển thị {currentDeposits.length} / {filteredDeposits.length} phiếu</span>
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