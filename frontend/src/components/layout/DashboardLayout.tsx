'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Megaphone, LogOut, X, User, Phone, Mail, MapPin, Menu, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import axiosInstance from '@/lib/axios';

export type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  roleName: string;
  menuItems: MenuItem[];
}

export default function DashboardLayout({ children, roleName, menuItems }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch (e) {}
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className={`bg-[#1e2329] text-white flex flex-col justify-between shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#00502B] rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors z-10 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div>
          <div className={`px-5 py-6 ${isCollapsed ? 'flex justify-center items-center h-[96px] p-0' : ''}`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-[0_4px_15px_rgba(255,255,255,0.1)] shrink-0">
                  <Building2 size={24} className="text-[#135A2E]" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[1.35rem] leading-none font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white tracking-tight">
                    Homestay
                  </h1>
                  <h1 className="text-[1.05rem] leading-tight font-bold text-gray-400 tracking-[0.2em] uppercase mt-0.5">
                    Dorm
                  </h1>
                  <p className="text-emerald-500 text-[10px] uppercase tracking-widest font-extrabold mt-1">{roleName}</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded-xl shadow-[0_4px_15px_rgba(255,255,255,0.1)] mt-4 shrink-0 hover:scale-110 transition-transform cursor-pointer" title="HomeStay DORM">
                <Building2 size={24} className="text-[#135A2E]" />
              </div>
            )}
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            {menuItems.map((item) => {
              const basePath = '/' + pathname.split('/')[1];
              const isActive = pathname === item.href ||
                (pathname.startsWith(item.href + '/') && item.href !== basePath);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  className={`flex items-center gap-3 py-3 rounded-md transition-colors ${
                    isCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${isActive
                      ? 'bg-green-800 text-white font-medium border-l-4 border-green-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                    }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <Link 
            href="#" 
            title={isCollapsed ? "Thông báo" : undefined}
            className={`flex items-center gap-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <div className="flex-shrink-0"><Megaphone className="w-5 h-5" /></div>
            {!isCollapsed && <span>Thông báo</span>}
          </Link>
          <LogoutButton
            hideIcon
            title={isCollapsed ? "Đăng xuất" : undefined}
            className={`flex w-full items-center gap-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md text-left bg-transparent m-0 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <div className="flex-shrink-0"><LogOut className="w-5 h-5" /></div>
            {!isCollapsed && <span>Đăng xuất</span>}
          </LogoutButton>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0 gap-4">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <div 
              className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden ml-2 cursor-pointer border border-gray-300 hover:ring-2 hover:ring-[#00502B]/30 transition-all"
              onClick={() => setShowProfile(!showProfile)}
            >
               <img src={`https://ui-avatars.com/api/?name=${user?.ho_ten || user?.username || 'User'}&background=0D8ABC&color=fff`} alt="User avatar" className="w-full h-full object-cover" />
            </div>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-[#00502B] flex items-center justify-center font-bold text-xl uppercase border border-green-100">
                      {(user?.ho_ten || user?.username || 'U')[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">{user?.ho_ten || user?.username || 'Nhân viên'}</h3>
                      <p className="text-xs text-gray-500 uppercase font-medium">{user?.role || roleName}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4 border-b border-gray-100 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mã NV:</span>
                      <span className="font-medium text-gray-800">{user?.ma_nhan_vien || (user?.employee_id ? `NV${user.employee_id.toString().padStart(4, '0')}` : 'NV0001')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">{user?.account_status === 'ACTIVE' || !user?.account_status ? 'Đang hoạt động' : 'Bị khóa'}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setShowProfile(false); setShowProfileModal(true); }}
                    className="w-full py-2 mb-2 flex items-center justify-center gap-2 text-[#00502B] bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium text-sm"
                  >
                     <User size={16} /> Thông tin cá nhân
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#f9fafb]">
          {children}
        </div>

        {/* Profile Details Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#1c1c1c] text-white p-6 relative">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white text-[#1c1c1c] flex items-center justify-center font-bold text-3xl uppercase">
                    {(user?.ho_ten || user?.username || 'U')[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.ho_ten || user?.username || 'Nhân viên'}</h2>
                    <p className="text-gray-400">{user?.role || roleName}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mã nhân viên</p>
                    <p className="font-semibold text-gray-900">{user?.ma_nhan_vien || (user?.employee_id ? `NV${user.employee_id.toString().padStart(4, '0')}` : 'NV0001')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                    <p className="font-semibold text-green-600">{user?.account_status === 'ACTIVE' || !user?.account_status ? 'Đang hoạt động' : 'Bị khóa'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Giới tính</p>
                    <p className="font-semibold text-gray-900">{user?.gioi_tinh || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Chi nhánh quản lý</p>
                    <p className="font-semibold text-gray-900">{user?.chi_nhanh_id ? `Chi nhánh ${user.chi_nhanh_id}` : 'Tất cả chi nhánh'}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="text-gray-400" size={18} />
                    <span className="font-medium">{user?.so_dien_thoai || 'Chưa cập nhật số điện thoại'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="text-gray-400" size={18} />
                    <span className="font-medium">{user?.employee_email || user?.account_email || 'Chưa cập nhật email'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 flex justify-end">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
