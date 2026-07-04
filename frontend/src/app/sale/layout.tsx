import React from 'react';
import DashboardLayout, { MenuItem } from '@/components/layout/DashboardLayout';
import { LayoutDashboard, LogOut, Receipt, Wallet } from 'lucide-react';

const SALE_MENU: MenuItem[] = [
  { title: 'Bảng điều khiển', href: '/sale', icon: <LayoutDashboard size={20} /> },
  { title: 'Yêu cầu trả phòng', href: '/sale/checkout', icon: <LogOut size={20} /> },
  { title: 'Yêu cầu đặt cọc', href: '/sale/deposit', icon: <Receipt size={20} /> },
  { title: 'Quản lý Thu Chi', href: '/sale/finance', icon: <Wallet size={20} /> },
];

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleName="Sale Portal" menuItems={SALE_MENU}>
      {children}
    </DashboardLayout>
  );
}
