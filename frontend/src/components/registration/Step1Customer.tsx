import React, { useState } from 'react';
import { Search, User, Phone, CreditCard, Mail, MapPin, Calendar, Globe, Briefcase } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Props {
  data: {
    customer: any;
    registration: any;
  };
  updateData: (section: string, data: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

const InputField = ({ label, icon: Icon, name, value, onChange, placeholder, required = false, type = 'text' }: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00502B]">
        <Icon size={18} className="text-gray-400 group-focus-within:text-[#00502B] transition-colors" />
      </div>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full text-sm text-gray-900 placeholder:text-gray-400 font-medium shadow-sm focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 transition-all"
        required={required}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, name, value, onChange, options, required = false }: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00502B]">
        <Icon size={18} className="text-gray-400 group-focus-within:text-[#00502B] transition-colors" />
      </div>
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full text-sm text-gray-900 font-medium shadow-sm focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 transition-all appearance-none"
        required={required}
      >
        <option value="" disabled>-- Chọn {label.toLowerCase()} --</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
      </div>
    </div>
  </div>
);

export default function Step1Customer({ data, updateData, onNext, onCancel }: Props) {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearchCustomer = async () => {
    if (!phoneSearch) return;
    try {
      setSearching(true);
      const res = await axiosInstance.get(`/customers/search?phone=${phoneSearch}`);
      if (res.data) {
        updateData('customer', { ...data.customer, ...res.data });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không tìm thấy khách hàng');
    } finally {
      setSearching(false);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateData('customer', { ...data.customer, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Tiêu đề Step 1 */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#00502B] flex-shrink-0">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Bước 1: Thông tin cá nhân</h2>
          <p className="text-gray-500 text-sm mt-1">Vui lòng điền đầy đủ thông tin của khách thuê mới.</p>
        </div>
      </div>

      {/* Auto-fill Search */}
      <div className="flex gap-4">
        <div className="relative w-full max-w-md group">
          <input
            type="text"
            placeholder="Tìm theo SĐT khách cũ để điền nhanh..."
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
            className="w-full pl-5 pr-14 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#00502B] focus:ring-4 focus:ring-[#00502B]/10 text-sm text-gray-900 placeholder:text-gray-400 font-medium shadow-sm transition-all"
          />
          <button
            onClick={handleSearchCustomer}
            disabled={searching}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00502B] text-white rounded-lg hover:bg-[#003d20] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
          >
            <Search size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <div className="md:col-span-2">
          <InputField label="Họ và tên" icon={User} name="ho_ten" value={data.customer.ho_ten} onChange={handleCustomerChange} placeholder="Nhập họ và tên đầy đủ" required />
        </div>
        <InputField label="Số điện thoại" icon={Phone} name="so_dien_thoai" value={data.customer.so_dien_thoai} onChange={handleCustomerChange} placeholder="Nhập số điện thoại" required />
        <InputField label="Số CMND/CCCD" icon={CreditCard} name="cccd" value={data.customer.cccd} onChange={handleCustomerChange} placeholder="Nhập số CMND/CCCD" required />

        <InputField type="date" label="Ngày sinh" icon={Calendar} name="ngay_sinh" value={data.customer.ngay_sinh} onChange={handleCustomerChange} placeholder="" required />
        <SelectField
          label="Giới tính"
          icon={User}
          name="gioi_tinh"
          value={data.customer.gioi_tinh}
          onChange={handleCustomerChange}
          required
          options={[
            { value: 'Nam', label: 'Nam' },
            { value: 'Nữ', label: 'Nữ' },
            { value: 'Khác', label: 'Khác' }
          ]}
        />

        <InputField label="Email" icon={Mail} name="email" value={data.customer.email} onChange={handleCustomerChange} placeholder="example@email.com" required />
        <SelectField
          label="Quê quán"
          icon={MapPin}
          name="dia_chi"
          value={data.customer.dia_chi}
          onChange={handleCustomerChange}
          required
          options={[
            // 6 Thành phố trực thuộc Trung ương
            { value: 'Hà Nội', label: 'Hà Nội' },
            { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
            { value: 'Đà Nẵng', label: 'Đà Nẵng' },
            { value: 'Hải Phòng', label: 'Hải Phòng' },
            { value: 'Huế', label: 'Huế' },
            { value: 'Cần Thơ', label: 'Cần Thơ' },
            // 28 Tỉnh (theo NQ 202/2025/QH15, hiệu lực 1/7/2025)
            { value: 'Cao Bằng', label: 'Cao Bằng' },
            { value: 'Tuyên Quang', label: 'Tuyên Quang' },       // + Hà Giang
            { value: 'Lào Cai', label: 'Lào Cai' },               // + Yên Bái
            { value: 'Điện Biên', label: 'Điện Biên' },
            { value: 'Lai Châu', label: 'Lai Châu' },
            { value: 'Sơn La', label: 'Sơn La' },
            { value: 'Lạng Sơn', label: 'Lạng Sơn' },
            { value: 'Thái Nguyên', label: 'Thái Nguyên' },       // + Bắc Kạn
            { value: 'Quảng Ninh', label: 'Quảng Ninh' },
            { value: 'Phú Thọ', label: 'Phú Thọ' },               // + Vĩnh Phúc + Hòa Bình
            { value: 'Bắc Ninh', label: 'Bắc Ninh' },             // + Bắc Giang
            { value: 'Hải Dương', label: 'Hải Dương' },           // + Hưng Yên
            { value: 'Hà Nam', label: 'Hà Nam' },                  // + Nam Định + Ninh Bình
            { value: 'Thanh Hóa', label: 'Thanh Hóa' },
            { value: 'Nghệ An', label: 'Nghệ An' },
            { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
            { value: 'Quảng Bình', label: 'Quảng Bình' },         // + Quảng Trị
            { value: 'Quảng Nam', label: 'Quảng Nam' },            // + Quảng Ngãi
            { value: 'Bình Định', label: 'Bình Định' },            // + Phú Yên
            { value: 'Khánh Hòa', label: 'Khánh Hòa' },           // + Ninh Thuận
            { value: 'Gia Lai', label: 'Gia Lai' },                // + Kon Tum
            { value: 'Đắk Lắk', label: 'Đắk Lắk' },              // + Đắk Nông
            { value: 'Lâm Đồng', label: 'Lâm Đồng' },             // + Bình Thuận
            { value: 'Bình Dương', label: 'Bình Dương' },          // + Bình Phước + Tây Ninh
            { value: 'Đồng Nai', label: 'Đồng Nai' },             // + Bà Rịa - Vũng Tàu
            { value: 'Long An', label: 'Long An' },                 // + Tiền Giang
            { value: 'Đồng Tháp', label: 'Đồng Tháp' },           // + An Giang + Kiên Giang
            { value: 'Hậu Giang', label: 'Hậu Giang' },           // + Sóc Trăng + Bạc Liêu + Cà Mau
            { value: 'Bến Tre', label: 'Bến Tre' },                // + Trà Vinh + Vĩnh Long
          ]}
        />

        <InputField label="Quốc tịch" icon={Globe} name="quoc_tich" value={data.customer.quoc_tich} onChange={handleCustomerChange} placeholder="VD: Việt Nam" required />
        <InputField label="Nghề nghiệp" icon={Briefcase} name="nghe_nghiep" value={data.customer.nghe_nghiep} onChange={handleCustomerChange} placeholder="Nhập nghề nghiệp" required />
      </div>

      <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-lg font-medium text-[#00502B] border border-[#00502B] hover:bg-green-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onNext}
          disabled={
            !data.customer.ho_ten || 
            !data.customer.so_dien_thoai || 
            !data.customer.cccd || 
            !data.customer.ngay_sinh || 
            !data.customer.gioi_tinh || 
            !data.customer.email || 
            !data.customer.dia_chi || 
            !data.customer.quoc_tich || 
            !data.customer.nghe_nghiep
          }
          className="bg-[#00502B] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#003d20] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          Tiếp tục <span className="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
