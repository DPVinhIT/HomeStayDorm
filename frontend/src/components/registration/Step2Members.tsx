import React, { useRef } from 'react';
import { Plus, Trash2, Users, FileUp } from 'lucide-react';

interface Props {
  data: any[];
  updateData: (data: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const InputField = ({ label, name, value, type = "text", placeholder, index, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-gray-800 mb-1.5">{label}</label>
    <input 
      type={type} 
      value={value || ''}
      onChange={(e) => onChange(index, name, e.target.value)}
      placeholder={placeholder}
      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#00502B] focus:ring-2 focus:ring-[#00502B]/20 transition-all bg-white shadow-sm"
    />
  </div>
);

const SelectField = ({ label, name, value, options, index, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-gray-800 mb-1.5">{label}</label>
    <select 
      value={value || ''}
      onChange={(e) => onChange(index, name, e.target.value)}
      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:border-[#00502B] focus:ring-2 focus:ring-[#00502B]/20 transition-all bg-white shadow-sm"
    >
      <option value="" disabled>Chọn {label.toLowerCase()}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function Step2Members({ data, updateData, onNext, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMember = () => {
    updateData([...data, { ho_ten: '', gioi_tinh: 'Nam', ngay_sinh: '', cccd: '', so_dien_thoai: '', quan_he: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    updateData(newData);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index][field] = value;
    updateData(newData);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      const newMembers = rows.map(row => {
        const [ho_ten, so_dien_thoai, cccd, ngay_sinh, gioi_tinh, quan_he] = row.split(',').map(s => s.trim());
        return { 
          ho_ten: ho_ten || '', 
          so_dien_thoai: so_dien_thoai || '', 
          cccd: cccd || '',
          ngay_sinh: ngay_sinh || '',
          gioi_tinh: gioi_tinh || 'Nam', 
          quan_he: quan_he || '' 
        };
      });
      updateData([...data, ...newMembers]);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-xl font-bold text-[#00502B]">Thêm người ở ghép</h2>
        <p className="text-gray-500 text-sm mt-1">Nhập thông tin cho những người sẽ chia sẻ phòng này. Bạn có thể bỏ qua bước này nếu đăng ký phòng đơn.</p>
      </div>

      <div className="space-y-6">
        {data.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header Card */}
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00502B]/10 text-[#00502B] flex items-center justify-center">
                  <Users size={16} />
                </div>
                <h3 className="font-bold text-gray-800">Người thứ {index + 1}</h3>
              </div>
              <button 
                onClick={() => handleRemoveMember(index)}
                className="text-red-500 hover:text-red-700 bg-white p-1.5 rounded-md border border-gray-200 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {/* Body Card */}
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Họ và tên" name="ho_ten" value={member.ho_ten} onChange={handleChange} placeholder="Nhập tên đầy đủ" index={index} />
                <SelectField label="Giới tính" name="gioi_tinh" value={member.gioi_tinh} options={['Nam', 'Nữ', 'Khác']} onChange={handleChange} index={index} />
                <InputField type="date" label="Ngày sinh" name="ngay_sinh" value={member.ngay_sinh} onChange={handleChange} index={index} />
                <InputField label="Số CCCD" name="cccd" value={member.cccd} onChange={handleChange} placeholder="Nhập số CCCD" index={index} />
                <InputField label="Số điện thoại" name="so_dien_thoai" value={member.so_dien_thoai} onChange={handleChange} placeholder="Nhập số điện thoại" index={index} />
                <InputField label="Quan hệ với người thuê chính" name="quan_he" value={member.quan_he} onChange={handleChange} placeholder="VD: Bạn bè, Người thân" index={index} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleAddMember}
          className="flex-1 py-4 border-2 border-dashed border-[#00502B]/30 rounded-xl flex items-center justify-center gap-2 text-[#00502B] font-bold hover:bg-[#00502B]/5 transition-colors"
        >
          <Plus size={20} /> Thêm người ở ghép
        </button>
        <label className="py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-pointer">
          <FileUp size={20} /> Import CSV
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVImport} />
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-gray-100 mt-8">
        <button 
          onClick={onBack}
          className="px-8 py-3 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button 
          onClick={onNext}
          className="bg-[#00502B] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#003d20] transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
