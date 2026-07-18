import React, { useState, useEffect } from 'react';
import { Search, Calendar, BedDouble, Check, X, Filter } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Props {
  data: any[];
  updateData: (data: any[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  registrationData: any;
  updateRegistration: (data: any) => void;
  customerData?: any;
}

export default function Step3RoomAppointment({ data, updateData, onSubmit, onBack, loading, registrationData, updateRegistration, customerData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Filters for modal
  const [filters, setFilters] = useState({
    chi_nhanh_id: '1',
    loai_phong: '',
    gioi_tinh: '',
    muc_gia: ''
  });

  // Sync gender filter from customer info (Step 1) whenever customerData changes
  useEffect(() => {
    const gender = customerData?.gioi_tinh || '';
    setFilters(prev => ({ ...prev, gioi_tinh: gender }));
  }, [customerData?.gioi_tinh]);

  // Sync branch filter from registration info
  useEffect(() => {
    if (registrationData?.chi_nhanh_id) {
      setFilters(prev => ({ ...prev, chi_nhanh_id: registrationData.chi_nhanh_id }));
    }
  }, [registrationData?.chi_nhanh_id]);

  const [appointmentDate, setAppointmentDate] = useState('');

  const fetchAvailableRooms = async () => {
    try {
      setSearching(true);
      const params = new URLSearchParams(filters);
      const res = await axiosInstance.get(`/rooms/available?${params.toString()}`);
      setRooms(res.data);
    } catch (error) {
      console.error('Lỗi khi tìm phòng trống', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleToggleRoom = (room: any) => {
    const existingIndex = data.findIndex(app => app.phong_id === room.id);
    if (existingIndex >= 0) {
      const newData = [...data];
      newData.splice(existingIndex, 1);
      updateData(newData);
    } else {
      updateData([...data, { phong_id: room.id, thoi_gian_hen: appointmentDate, ghi_chu: '', ma_phong: room.ma_phong, loai_phong: room.loai_phong, gia: room.gia_thue_thang }]);
    }
  };

  // Sync date to appointments
  useEffect(() => {
    if (data.length > 0 && appointmentDate) {
      const updatedData = data.map(app => ({
        ...app,
        thoi_gian_hen: appointmentDate,
        ghi_chu: ''
      }));
      updateData(updatedData);
    }
  }, [appointmentDate]);

  const selectedRoomIds = data.map(app => app.phong_id);

  return (
    <div className="animate-in fade-in duration-500">
      
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold text-[#00502B]">Thông tin xếp phòng</h2>
        
        <button 
          onClick={() => { setShowModal(true); fetchAvailableRooms(); }}
          className="mt-4 flex items-center gap-2 px-4 py-2 border border-[#00502B] text-[#00502B] rounded-lg font-medium hover:bg-green-50 transition-colors"
        >
          <Search size={18} /> Tra cứu phòng trống
        </button>
        <p className="text-xs text-gray-500 mt-2 mb-6">Hoàn thiện việc gán phòng và lên lịch cho hợp đồng mới.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">Phòng đã chọn</label>
            {data.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 text-center">
                Chưa có phòng nào được chọn.
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((room, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                        <BedDouble size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Phòng {room.ma_phong}</h4>
                        <p className="text-sm text-gray-500">{room.loai_phong}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-bold text-[#00502B]">{Number(room.gia).toLocaleString()}đ/tháng</p>
                      <span className="px-2 py-0.5 bg-green-200 text-[#00502B] text-xs font-bold rounded-full">Đã chọn</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Ngày dự kiến chuyển vào <span className="text-red-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00502B]">
                  <Calendar size={18} className="text-gray-400 group-focus-within:text-[#00502B] transition-colors" />
                </div>
                <input 
                  type="date" 
                  value={registrationData.ngay_du_kien_vao_o || ''}
                  onChange={(e) => updateRegistration({ ...registrationData, ngay_du_kien_vao_o: e.target.value })}
                  className="pl-11 w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal shadow-sm focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 transition-all" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Lịch hẹn xem phòng <span className="text-red-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00502B]">
                  <Calendar size={18} className="text-gray-400 group-focus-within:text-[#00502B] transition-colors" />
                </div>
                <input 
                  type="datetime-local" 
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="pl-11 w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal shadow-sm focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 transition-all" 
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Ghi chú thêm <span className="text-red-500">*</span></label>
            <textarea 
              rows={4}
              value={registrationData.ghi_chu || ''}
              onChange={(e) => updateRegistration({ ...registrationData, ghi_chu: e.target.value })}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal shadow-sm focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 transition-all" 
              placeholder="Nhập các yêu cầu đặc biệt hoặc lưu ý cho việc xếp phòng..."
              required
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-100">
          <button 
            className="px-8 py-3 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Lưu nháp
          </button>
          <button 
            onClick={onSubmit}
            disabled={
              loading || 
              data.length === 0 || 
              !registrationData.ngay_du_kien_vao_o || 
              !appointmentDate || 
              !registrationData.ghi_chu
            }
            className="bg-[#00502B] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#003d20] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : <><Check size={18} /> Hoàn tất</>}
          </button>
        </div>
      </div>

      {/* Right Drawer Tra Cứu Phòng */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity backdrop-blur-sm">
          <div className="bg-white shadow-2xl w-full max-w-xl h-full overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header (Dark) */}
            <div className="bg-[#1c1c1c] text-white p-6 relative flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-1">Tìm kiếm phòng trống</h2>
              <p className="text-gray-400 text-sm mb-6">Lọc và chọn phòng phù hợp cho khách thuê.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tòa nhà</label>
                  <select name="chi_nhanh_id" value={filters.chi_nhanh_id} onChange={handleFilterChange} className="w-full p-2.5 bg-white text-gray-800 rounded-lg text-sm outline-none">
                    <option value="1">Chi nhánh 1</option>
                    <option value="2">Chi nhánh 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tầng</label>
                  <select className="w-full p-2.5 bg-white text-gray-800 rounded-lg text-sm outline-none">
                    <option>Tất cả các tầng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Loại phòng</label>
                  <select name="loai_phong" value={filters.loai_phong} onChange={handleFilterChange} className="w-full p-2.5 bg-white text-gray-800 rounded-lg text-sm outline-none">
                    <option value="">Tất cả loại phòng</option>
                    <option value="4 người">Phòng 4 người</option>
                    <option value="6 người">Phòng 6 người</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Mức giá</label>
                  <select name="muc_gia" value={filters.muc_gia} onChange={handleFilterChange} className="w-full p-2.5 bg-white text-gray-800 rounded-lg text-sm outline-none">
                    <option value="">Mọi mức giá</option>
                    <option value="2000000">Dưới 2 triệu</option>
                    <option value="4000000">Dưới 4 triệu</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-4 items-center">
                <button className="text-sm text-gray-300 hover:text-white">Xóa bộ lọc</button>
                <button onClick={fetchAvailableRooms} className="bg-[#00502B] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#003d20] flex items-center gap-2">
                  <Filter size={16} /> Áp dụng
                </button>
              </div>
            </div>

            {/* Modal Body (White) */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Kết quả tìm kiếm</h3>
                <span className="text-sm text-gray-500">Tìm thấy {rooms.length} phòng</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {searching ? (
                  <div className="col-span-full text-center py-10 text-gray-500">Đang tìm phòng...</div>
                ) : rooms.map((room: any) => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  return (
                    <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                            <BedDouble size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">Phòng {room.ma_phong}</h4>
                            <p className="text-xs text-gray-500">{room.loai_phong}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Trống</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                        <div>Tầng {room.tang || 1}</div>
                        <div>Max {room.suc_chua}</div>
                        <div className="col-span-2 font-bold text-gray-800">{Number(room.gia_thue_thang).toLocaleString()}đ/tháng</div>
                      </div>

                      <button 
                        onClick={() => handleToggleRoom(room)}
                        className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${isSelected ? 'bg-gray-200 text-gray-700' : 'bg-[#00502B] text-white hover:bg-[#003d20]'}`}
                      >
                        {isSelected ? 'Đã chọn' : 'Chọn phòng'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer (Dark) */}
            <div className="bg-[#1c1c1c] text-white p-4 flex justify-between items-center text-sm">
              <button onClick={() => setShowModal(false)} className="hover:text-gray-300">Hủy bỏ</button>
              <div className="text-gray-400">Đã chọn {data.length} phòng</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
