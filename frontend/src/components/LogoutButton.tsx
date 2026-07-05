'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes, useState } from 'react';

interface LogoutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hideIcon?: boolean;
}

export default function LogoutButton({ hideIcon = false, className, children, ...props }: LogoutButtonProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className={className || "mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors mx-auto font-medium"}
        {...props}
      >
        {!hideIcon && <LogOut size={18} />}
        {children || "Đăng xuất"}
      </button>

      {/* Custom Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-600 mb-2">Đăng xuất hệ thống</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại không?
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmLogout}
                className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
