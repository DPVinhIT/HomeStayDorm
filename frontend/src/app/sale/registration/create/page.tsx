'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Customer from '@/components/registration/Step1Customer';
import Step2Members from '@/components/registration/Step2Members';
import Step3RoomAppointment from '@/components/registration/Step3RoomAppointment';
import { CheckCircle2, ArrowLeft, Check, Bell, HelpCircle, Search } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function CreateRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customer: {
      id: null,
      ho_ten: '',
      so_dien_thoai: '',
      cccd: '',
      gioi_tinh: 'Nam',
      ngay_sinh: '',
      email: '',
      dia_chi: '',
      quoc_tich: 'Việt Nam',
      nghe_nghiep: ''
    },
    registration: {
      chi_nhanh_id: '',
      hinh_thuc_thue: 'Theo giường',
      so_luong_nguoi: 1,
      gioi_tinh_nhom: 'Nam',
      khu_vuc_mong_muon: '',
      loai_phong_mong_muon: '',
      muc_gia_mong_muon: '',
      ngay_du_kien_vao_o: '',
      thoi_han_thue_thang: 6,
      tieu_chi_uu_tien: '',
      ghi_chu: ''
    },
    members: [],
    appointments: []
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/registration', formData);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[60vh] m-6">
        <CheckCircle2 size={64} className="text-[#00502B] mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo đăng ký thành công!</h2>
        <p className="text-gray-500 mb-8 max-w-md">Phiếu đăng ký thuê và lịch hẹn đã được lưu vào hệ thống thành công.</p>
        <button 
          onClick={() => router.push('/sale/registration')}
          className="bg-[#00502B] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#003d20] transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Thông tin chung', shortTitle: 'Thông tin cá nhân' },
    { number: 2, title: 'Người ở ghép', shortTitle: 'Thông tin phòng' },
    { number: 3, title: 'Xếp phòng & Lịch', shortTitle: 'Xác nhận' }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6">
          <button onClick={() => router.push('/sale/registration')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h1 className="text-[28px] font-bold text-[#00502B]">Thêm Đăng Ký Mới</h1>
        </div>

        {/* Progress Bar */}
        <div className="bg-white py-8 px-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-center">
          <div className="flex items-start justify-between w-full max-w-2xl relative px-4">
            {/* Background Line */}
            <div className="absolute top-5 left-14 right-14 h-[2px] bg-gray-200 z-0">
              <div 
                className="h-full bg-[#00502B] transition-all duration-500 ease-in-out" 
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              ></div>
            </div>
            
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center z-10 w-28 bg-white">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ring-4 ring-white
                  ${currentStep > step.number ? 'bg-[#00502B] text-white' : 
                    currentStep === step.number ? 'bg-[#00502B] text-white shadow-md shadow-green-900/20' : 'bg-gray-100 text-gray-400'}`}
                >
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </div>
                <span className={`mt-3 text-sm font-semibold text-center
                  ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          {currentStep === 1 && (
            <Step1Customer 
              data={{ customer: formData.customer, registration: formData.registration }} 
              updateData={updateFormData} 
              onNext={handleNext} 
              onCancel={() => router.push('/sale/registration')}
            />
          )}
          {currentStep === 2 && (
            <Step2Members 
              data={formData.members} 
              so_luong_nguoi={formData.registration.so_luong_nguoi}
              updateData={(data: any) => updateFormData('members', data)} 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
          {currentStep === 3 && (
            <Step3RoomAppointment 
              data={formData.appointments} 
              updateData={(data: any) => updateFormData('appointments', data)} 
              onSubmit={handleSubmit} 
              onBack={handleBack}
              loading={loading}
              registrationData={formData.registration}
              updateRegistration={(data: any) => updateFormData('registration', data)}
              customerData={formData.customer}
            />
          )}
        </div>
    </div>
  );
}
