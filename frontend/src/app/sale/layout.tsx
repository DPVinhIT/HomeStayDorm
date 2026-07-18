import React from 'react';
import DashboardLayout, { MenuItem } from '@/components/layout/DashboardLayout';
import { LayoutDashboard, Receipt, FileText, Calendar, Users, FileSignature } from 'lucide-react';

const SALE_MENU: MenuItem[] = [
  { title: 'Bảng điều khiển', href: '/sale', icon: <LayoutDashboard size={20} /> },
  { title: 'Phiếu đăng ký thuê', href: '/sale/registration', icon: <FileText size={20} /> },
  { title: 'Phiếu đặt cọc', href: '/sale/deposit', icon: <Receipt size={20} /> },
  { title: 'Lịch hẹn', href: '/sale/appointment', icon: <Calendar size={20} /> },
  { title: 'Khách hàng', href: '/sale/customer', icon: <Users size={20} /> },
  { title: 'Hợp đồng', href: '/sale/contract', icon: <FileSignature size={20} /> },
];

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleName="Sale Portal" menuItems={SALE_MENU}>
      {children}
    </DashboardLayout>
  );
}
