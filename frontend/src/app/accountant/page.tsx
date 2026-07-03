import LogoutButton from '@/components/LogoutButton';

export default function AccountantDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Accountant Portal</h1>
        <p className="text-gray-600">Chào mừng Kế toán viên.</p>
        <LogoutButton />
      </div>
    </div>
  );
}
