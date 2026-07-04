import React from 'react';
import DashboardLayout, { MenuItem } from '@/components/layout/DashboardLayout';
import { LayoutDashboard, LogOut, Receipt, Wallet } from 'lucide-react';

const ACCOUNTANT_MENU: MenuItem[] = [
  { title: 'Bảng điều khiển', href: '/accountant', icon: <LayoutDashboard size={20} /> },
  { title: 'Yêu cầu trả phòng', href: '/accountant/checkout', icon: <LogOut size={20} /> },
  { title: 'Yêu cầu đặt cọc', href: '/accountant/deposit', icon: <Receipt size={20} /> },
  { title: 'Quản lý Thu Chi', href: '/accountant/finance', icon: <Wallet size={20} /> },
];

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleName="Accountant Portal" menuItems={ACCOUNTANT_MENU}>
      {children}
    </DashboardLayout>
  );
}
