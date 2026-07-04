import React from 'react';
import DashboardLayout, { MenuItem } from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

const ADMIN_MENU: MenuItem[] = [
  { title: 'Bảng điều khiển', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { title: 'Quản lý tài khoản', href: '/admin/users', icon: <Users size={20} /> },
  { title: 'Cấu hình hệ thống', href: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleName="Admin Portal" menuItems={ADMIN_MENU}>
      {children}
    </DashboardLayout>
  );
}
