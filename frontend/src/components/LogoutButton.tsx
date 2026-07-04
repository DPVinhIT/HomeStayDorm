'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ButtonHTMLAttributes } from 'react';

interface LogoutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hideIcon?: boolean;
}

export default function LogoutButton({ hideIcon = false, className, children, ...props }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors mx-auto font-medium"}
      {...props}
    >
      {!hideIcon && <LogOut size={18} />}
      {children || "Đăng xuất"}
    </button>
  );
}
