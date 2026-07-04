'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Megaphone, LogOut } from 'lucide-react';
import LogoutButton from '../LogoutButton';

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

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#1e2329] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-wider">HomeStay</h1>
            <h1 className="text-2xl font-bold tracking-wider uppercase mb-1">DORM</h1>
            <p className="text-gray-400 text-xs mt-1">{roleName}</p>
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
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-green-800 text-white font-medium border-l-4 border-green-500' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700 space-y-1">
           <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
             <Megaphone className="w-5 h-5" />
             <span>Thông báo</span>
           </Link>
           <LogoutButton 
             hideIcon 
             className="flex w-full items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md text-left bg-transparent m-0"
           >
             <LogOut className="w-5 h-5" />
             <span>Đăng xuất</span>
           </LogoutButton>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0 gap-4">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden ml-2 cursor-pointer border border-gray-300">
             <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="User avatar" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#f9fafb]">
          {children}
        </div>
      </main>
    </div>
  );
}
