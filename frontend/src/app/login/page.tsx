'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Loader2, ArrowRight, ShieldCheck, Users, Briefcase, Calculator, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SALE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý lỗi Cache của trình duyệt (BFCache) khi nhấn nút Back
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false); // Reset trạng thái loading nếu load lại từ cache
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Nếu đã đăng nhập, tự động chuyển hướng (tuỳ chọn)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        switch (user.role) {
          case 'ADMIN': router.push('/admin'); break;
          case 'QUAN_LY': router.push('/manager'); break;
          case 'SALE': router.push('/sale'); break;
          case 'KE_TOAN': router.push('/accountant'); break;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password, role });

      const { accessToken, refreshToken, user } = res.data;

      // Save tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'QUAN_LY':
          router.push('/manager');
          break;
        case 'SALE':
          router.push('/sale');
          break;
        case 'KE_TOAN':
          router.push('/accountant');
          break;
        default:
          setError('Vai trò không hợp lệ trên hệ thống');
          setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập');
      setLoading(false);
    }
  };

  const roles = [
    { id: 'SALE', label: 'Sale', icon: Briefcase },
    { id: 'QUAN_LY', label: 'Quản lý', icon: Users },
    { id: 'KE_TOAN', label: 'Kế toán', icon: Calculator },
    { id: 'ADMIN', label: 'Quản trị viên', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F7F4] p-4 font-sans relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute left-10 bottom-10 grid grid-cols-5 gap-2 opacity-20">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-400"></div>
        ))}
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Side: Branding & Image */}
        <div className="hidden lg:flex flex-col justify-center pl-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={36} className="text-[#135A2E]" />
            <h1 className="text-4xl font-bold text-[#135A2E] tracking-tight">Homestay Dorm</h1>
          </div>

          <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed">
            Hệ thống quản lý lưu trú thông minh dành riêng cho nội bộ nhân viên.
            <br />
            Đơn giản hóa quy trình cho thuê, vận hành và trải nghiệm cư dân.
          </p>

          <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-2xl relative">
            <img
              src="/dorm-room.png"
              alt="Phòng Ký túc xá"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10 w-full max-w-[500px] mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
            <p className="text-gray-500 text-sm">Vui lòng nhập thông tin tài khoản của bạn để truy cập.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Đăng nhập với vai trò
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${isActive
                        ? 'bg-[#1b5e20] border-[#1b5e20] text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email/Username */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1b5e20] focus:border-[#1b5e20] text-sm text-gray-900 placeholder-gray-400 bg-white outline-none transition-colors"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#1b5e20] focus:border-[#1b5e20] text-sm text-gray-900 placeholder-gray-400 bg-white outline-none transition-colors tracking-widest"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1b5e20] focus:ring-[#1b5e20] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Ghi nhớ tôi
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-[#1b5e20] hover:text-[#134216] transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#1b5e20] hover:bg-[#134216] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b5e20] transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
