import React from 'react';
import DashboardLayout, { MenuItem } from '@/components/layout/DashboardLayout';
import { 
  LayoutDashboard, 
  LogOut, 
  Receipt, 
  BedDouble, 
  UserPlus, 
  FileCheck, 
  Key, 
  Calendar 
} from 'lucide-react';

const MANAGER_MENU: MenuItem[] = [
  { title: 'Bảng điều khiển', href: '/manager', icon: <LayoutDashboard size={20} /> },
  { title: 'Yêu cầu trả phòng', href: '/manager/checkout', icon: <LogOut size={20} /> },
  { title: 'Phiếu đặt cọc', href: '/manager/deposit', icon: <Receipt size={20} /> },
  { title: 'Phòng & Giường', href: '/manager/rooms', icon: <BedDouble size={20} /> },
  { title: 'Phiếu đăng ký', href: '/manager/registration', icon: <UserPlus size={20} /> },
  { title: 'Duyệt HĐ', href: '/manager/contracts', icon: <FileCheck size={20} /> },
  { title: 'Bàn giao', href: '/manager/handover', icon: <Key size={20} /> },
  { title: 'Lịch hẹn', href: '/manager/appointments', icon: <Calendar size={20} /> },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleName="Manager Portal" menuItems={MANAGER_MENU}>
      {children}
    </DashboardLayout>
  );
}
