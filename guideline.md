# Hướng dẫn Cài đặt và Chạy dự án HomeStay Dorm

Tài liệu này hướng dẫn các thành viên trong nhóm cách thiết lập môi trường và khởi chạy dự án (Frontend & Backend) trên máy cá nhân.

## 1. Yêu cầu hệ thống (Prerequisites)
- Đã cài đặt **Node.js** (phiên bản v18.x hoặc mới hơn). Kiểm tra bằng lệnh: `node -v`
- Đã cài đặt **Git** (để clone và pull code về).
- Trình duyệt web (Khuyên dùng Google Chrome hoặc Edge).

---

## 2. Thiết lập và chạy Backend (Express.js)

Backend được xây dựng bằng **Node.js + Express** và kết nối đến cơ sở dữ liệu **Neon (PostgreSQL)**.

**Bước 1:** Di chuyển vào thư mục backend:
```bash
cd backend
```

**Bước 2:** Cài đặt các thư viện cần thiết:
```bash
npm install
```

**Bước 3:** Cấu hình biến môi trường:
Tạo một file có tên là `.env` trong thư mục `backend/` (ngang hàng với `package.json`) và thêm nội dung sau:
```env
# Chuỗi kết nối đến CSDL Neon
DATABASE_URL="url_db_neon"

# Khóa bí mật cho JWT (Access Token & Refresh Token)
ACCESS_TOKEN_SECRET="chuoi_bi_mat_cho_access_token_cua_nhom"
REFRESH_TOKEN_SECRET="chuoi_bi_mat_cho_refresh_token_cua_nhom"

PORT=3001
```

**Bước 4:** Khởi chạy Backend server:
```bash
npm run dev
```
*(Server sẽ chạy tại địa chỉ: `http://localhost:3001`)*

---

## 3. Thiết lập và chạy Frontend (Next.js)

Frontend được xây dựng bằng **Next.js**, **TypeScript** và **Tailwind CSS**.

**Bước 1:** Mở một cửa sổ Terminal mới (giữ Terminal backend vẫn đang chạy), di chuyển vào thư mục frontend:
```bash
cd frontend
```

**Bước 2:** Cài đặt các thư viện:
```bash
npm install
```

**Bước 3:** Cấu hình biến môi trường (nếu cần):
Tạo file `.env.local` trong thư mục `frontend/` và thêm nội dung sau để frontend biết đường dẫn gọi API của backend:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

**Bước 4:** Khởi chạy Frontend server:
```bash
npm run dev
```
*(Server sẽ chạy tại địa chỉ: `http://localhost:3000`)*

---

## 4. Tài khoản Đăng nhập (Test Accounts)

Sau khi cả 2 server đều báo chạy thành công, các bạn mở trình duyệt và truy cập vào trang đăng nhập:
👉 **[http://localhost:3000/login](http://localhost:3000/login)**

Sử dụng một trong các tài khoản dưới đây để test (Tất cả đều dùng chung mật khẩu):

- **Mật khẩu chung:** `123456`

| Vai trò | Tên đăng nhập (Username) | Dashboard chuyển hướng |
| :--- | :--- | :--- |
| **Quản trị viên** | `admin01` | `/admin` |
| **Quản lý** | `quanly01` | `/manager` |
| **Nhân viên Sale** | `sale01` | `/sale` |
| **Kế toán** | `ketoan01` | `/accountant` |

*(Lưu ý: Mật khẩu đã được mã hóa sẵn trong Database, các bạn chỉ cần nhập đúng `123456` ở màn hình UI để truy cập).*
