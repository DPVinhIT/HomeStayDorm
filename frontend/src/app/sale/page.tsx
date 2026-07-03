import LogoutButton from '@/components/LogoutButton';

export default function SaleDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Sale Portal</h1>
        <p className="text-gray-600">Chào mừng Nhân viên Sale.</p>
        <LogoutButton />
      </div>
    </div>
  );
}
