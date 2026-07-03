# 🏨 Hệ thống Ký túc xá tư nhân HomeStay Dorm

Chào mừng bạn đến với Repository của dự án **HomeStay Dorm** - Hệ thống quản lý lưu trú thông minh, toàn diện dành cho Ký túc xá tư nhân. 

Đây là Đồ án môn học **Phân tích thiết kế hệ thống (CSC12004)** - Khoa Công nghệ Thông tin, Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM.

---

## 📖 Giới thiệu dự án

Hệ thống ký túc xá tư nhân HomeStay Dorm chuyên cung cấp các dịch vụ lưu trú dài hạn cho khách hàng cá nhân và tổ chức. Hệ thống được xây dựng nhằm mục đích số hóa và tối ưu các quy trình quản lý phức tạp, bao gồm:
- Quy trình đăng ký thuê phòng & ghép giường.
- Quy trình đặt cọc và xác nhận thuê.
- Quy trình nhận phòng, lập hợp đồng và bàn giao tài sản.
- Quy trình đối soát tài chính, trả phòng và hoàn cọc.

Hệ thống phục vụ cho nhiều đối tượng với các phân quyền riêng biệt:
- 👑 **Quản trị viên (Admin)**
- 🏢 **Quản lý chi nhánh**
- 🤝 **Nhân viên Sale**
- 💰 **Kế toán**

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án áp dụng mô hình thiết kế **Kiến trúc 3 Lớp (3-Tier Architecture)** phân tách rõ ràng giữa Frontend, Backend và Database:

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Axios.
- **Backend:** Node.js, Express.js, JWT Authentication, bcrypt.
- **Database:** PostgreSQL (Lưu trữ đám mây qua Neon Tech).

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

Để thiết lập môi trường lập trình và chạy dự án này trên máy cá nhân, vui lòng tham khảo tài liệu hướng dẫn chi tiết tại:

👉 **[Hướng dẫn Cài đặt - guideline.md](./guideline.md)**

Trong tài liệu trên đã bao gồm:
- Các yêu cầu hệ thống cơ bản.
- Lệnh cài đặt dependencies cho Backend và Frontend.
- Cách thiết lập biến môi trường (`.env`).
- Danh sách tài khoản thử nghiệm (Test accounts).

## 📂 Cấu trúc Repository

```text
📦 HomeStay
 ┣ 📂 backend       # Mã nguồn máy chủ API (Express.js)
 ┣ 📂 frontend      # Mã nguồn giao diện người dùng (Next.js)
 ┣ 📂 docs          # Tài liệu báo cáo, Sơ đồ thiết kế (UML, UI Mockups)
 ┣ 📜 guideline.md  # Hướng dẫn setup và chạy code cho thành viên
 ┗ 📜 README.md     # Thông tin tổng quan dự án
```

## 👥 Nhóm Thực hiện

- **Đỗ Phước Vinh** - 23120405 (Nhóm trưởng)
- **Cao Thanh Bình** - 23120216
- **Nguyễn Văn Chiến** - 23120219
- **Lê Văn Huỳnh** - 23120278
- **Cao Quốc Tý** - 23120400

*Đồ án được thực hiện dưới sự hướng dẫn của GVTH: Tiết Gia Hồng & Nguyễn Ngọc Minh Châu.*
