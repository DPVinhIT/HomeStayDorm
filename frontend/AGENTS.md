<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HomeStay Dorm - Cấu trúc Frontend (Dành cho Lập trình viên & AI Agents)

Dự án này sử dụng mô hình **Kiến trúc phân quyền (Role-based Architecture)** với Next.js App Router. Để tránh xung đột code (conflict) khi nhiều người/agent cùng làm việc, hãy tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Cấu trúc thư mục Role-based
Tất cả các tính năng của trang quản trị được chia theo Role trong thư mục `src/app/`:
- `src/app/admin/`: Dành cho Quản trị viên (Admin)
- `src/app/manager/`: Dành cho Quản lý chi nhánh (Manager)
- `src/app/sale/`: Dành cho Nhân viên Sale
- `src/app/accountant/`: Dành cho Kế toán

**QUY TẮC QUAN TRỌNG:** 
- Khi code tính năng cho Role nào, **CHỈ** thao tác trong thư mục của Role đó. Tuyệt đối không tạo file dùng chung lộn xộn giữa các Role trừ khi đó là Shared Component.
- Mỗi Role đã có sẵn file `layout.tsx` bọc giao diện chung.

## 2. Giao diện chung (Shared Layout)
Tất cả các trang dashboard đều sử dụng chung một Component bộ khung là `src/components/layout/DashboardLayout.tsx` (Bao gồm Sidebar bên trái và Header bên trên).

- **Thêm/Sửa Tab trên Sidebar:** Muốn đổi tên tab, thêm icon hay đổi đường dẫn, hãy vào file `layout.tsx` của Role đó (Ví dụ: `src/app/manager/layout.tsx`) và chỉnh sửa mảng cấu hình (VD: `MANAGER_MENU`).
- **KHÔNG sửa `DashboardLayout.tsx`** trừ trường hợp muốn thay đổi thiết kế Header/Sidebar áp dụng cho TOÀN BỘ hệ thống.
- **Thêm trang mới:** Để thêm trang mới cho một tab, ví dụ tab "Bàn giao" của Manager có `href` là `/manager/handover`. Bạn chỉ cần tạo file tại `src/app/manager/handover/page.tsx`. Giao diện Sidebar và Header sẽ TỰ ĐỘNG được áp dụng.

## 3. UI/UX Rules
- Sử dụng **Tailwind CSS** cho tất cả styling.
- Sử dụng thư viện icon **lucide-react** cho các biểu tượng.
- Giữ phong cách thiết kế: thẻ (card) bo góc mềm mại, bóng đổ (shadow-sm), màu nền xám nhạt (`bg-gray-50` hoặc `#f9fafb`) cho khu vực nội dung chính.

Hãy đọc kỹ tài liệu này trước khi tạo/sửa code để giữ cho repository gọn gàng và dễ bảo trì!
