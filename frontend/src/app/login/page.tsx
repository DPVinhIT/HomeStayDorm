'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, Loader2, ArrowRight, ShieldCheck, Users, Briefcase, Calculator, Eye, EyeOff, Star, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SALE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

      // Show success animation
      setIsSuccess(true);

      // Redirect based on role after animation (1.5 seconds)
      setTimeout(() => {
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
            setIsSuccess(false);
        }
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập');
      setLoading(false);
    }
  };

  // If success, render the professional logo loading overlay
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden">
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">

          {/* Full System Logo */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(19,90,46,0.15)] relative animate-bounce">
              <Building2 size={48} className="text-[#135A2E] relative z-10" />
              <div className="absolute inset-0 bg-[#135A2E]/20 rounded-2xl animate-ping opacity-20"></div>
            </div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#135A2E] to-emerald-600 tracking-tight">
              Homestay Dorm
            </h1>
          </div>

          {/* Elegant Progress Line */}
          <div className="w-64 h-[3px] bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#135A2E] to-emerald-500 animate-[progress_1.5s_ease-in-out_forwards] origin-left"></div>
          </div>

          <p className="text-[11px] text-gray-500 mt-6 tracking-widest uppercase font-bold">
            Đang tải dữ liệu không gian làm việc
          </p>
        </div>

        <style>{`
          @keyframes progress {
            0% { transform: scaleX(0); }
            40% { transform: scaleX(0.4); }
            80% { transform: scaleX(0.8); }
            100% { transform: scaleX(1); }
          }
        `}</style>
      </div>
    );
  }

  const roles = [
    { id: 'SALE', label: 'Sale', icon: Briefcase },
    { id: 'QUAN_LY', label: 'Quản lý', icon: Users },
    { id: 'KE_TOAN', label: 'Kế toán', icon: Calculator },
    { id: 'ADMIN', label: 'Quản trị viên', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9F5] p-4 font-sans relative overflow-hidden">

      {/* --- WOW WOW WOW: Custom Global Keyframes for this page --- */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animation-delay-1500 { animation-delay: 1.5s; }

        @keyframes slow-pan {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, 2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-slow-pan { animation: slow-pan 25s ease-in-out infinite; }
      `}</style>

      {/* --- BACKGROUND EFFECTS --- */}
      {/* 1. Ambient Glowing Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#135A2E]/10 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-[#00502B]/10 rounded-full blur-[130px] animate-blob animation-delay-4000 mix-blend-multiply"></div>

      {/* 2. Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLCAwLCAwLCAwLjAzKSIvPjwvc3ZnPg==')] opacity-60"></div>

      <div className="w-full max-w-[1150px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* --- LEFT SIDE: WOW BRANDING --- */}
        <div className="hidden lg:flex flex-col justify-center pl-4">
          <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="p-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(19,90,46,0.15)] relative">
              <Building2 size={40} className="text-[#135A2E] relative z-10" />
              <div className="absolute inset-0 bg-[#135A2E]/20 rounded-2xl animate-ping opacity-20"></div>
            </div>
            <h1 className="text-[2.75rem] leading-none font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#135A2E] to-emerald-600 tracking-tight">
              Homestay Dorm
            </h1>
          </div>

          <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            Hệ thống quản lý lưu trú thông minh thế hệ mới.
            Mang đến trải nghiệm sống trọn vẹn và quy trình vận hành tối ưu nhất.
          </p>

          <div className="w-full h-[450px] rounded-2xl overflow-visible relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            {/* Main Image Card with Glass Border */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-[4px] border-white/60 bg-white group">
              <img
                src="/dorm-room.png"
                alt="Phòng Ký túc xá"
                className="w-full h-full object-cover animate-slow-pan"
              />
              {/* Overlay with Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#135A2E]/80 via-[#135A2E]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end p-8">
                <p className="text-white font-medium text-lg tracking-wide translate-y-6 group-hover:translate-y-0 transition-transform duration-700 opacity-0 group-hover:opacity-100">
                  Trải nghiệm không gian sống lý tưởng <br />
                  <span className="text-emerald-300 text-sm">Quản lý chuyên nghiệp &middot; Tiện nghi đẳng cấp</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT SIDE: WOW GLASSMORPHISM LOGIN CARD --- */}
        <div className="animate-in fade-in slide-in-from-right-12 duration-1000 delay-500">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-3xl p-10 w-full max-w-[500px] mx-auto relative overflow-hidden">

            {/* Subtle inner glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-[#135A2E]"></div>

            <div className="mb-2">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">ĐĂNG NHẬP</h2>
              <p className="text-gray-500 text-sm font-medium">Vui lòng đăng nhập để tiếp tục công việc của bạn.</p>
            </div>

            <div className="min-h-[56px] mb-4 flex items-center">
              {error && (
                <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center animate-in fade-in duration-300">
                  {error}
                </div>
              )}
            </div>

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
    </div>
  );
}
