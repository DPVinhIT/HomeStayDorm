# HomeStay Dorm - Cấu trúc Backend (Dành cho Lập trình viên & AI Agents)

Dự án này sử dụng kiến trúc Node.js/Express với cấu trúc thư mục rõ ràng. Để đảm bảo tính nhất quán của API và tránh phá vỡ kiến trúc, mọi thay đổi hoặc thêm mới tính năng cần phải tuân thủ nghiêm ngặt Workflow sau đây:

## 1. Cấu trúc thư mục (Backend Architecture)
Mã nguồn chính nằm trong `src/`:
- `config/`: Chứa các kết nối (Database, Swagger, v.v.).
- `controllers/`: Chứa toàn bộ Business Logic (Nghiệp vụ). Giao tiếp trực tiếp với cơ sở dữ liệu (`db.js`).
- `routes/`: Định nghĩa các API endpoints (URL) và trỏ tới Controller tương ứng. Đồng thời đây là nơi gắn Middleware và viết tài liệu Swagger.
- `middlewares/`: Chứa các hàm trung gian (ví dụ: `authMiddleware.js` để xác thực JWT).

## 2. Quy trình thêm tính năng mới (Workflow)
Khi bạn (hoặc AI Agent) cần xây dựng một API mới, bắt buộc phải đi theo 3 bước sau:

**Bước 1: Viết Logic ở Controller (`src/controllers/`)**
- Import `db` từ `../config/db`.
- Xử lý các query SQL, logic nghiệp vụ.
- Luôn bọc logic trong `try...catch` để bắt lỗi, trả về JSON response rõ ràng (VD: `res.status(200).json({ data: ... })`).

**Bước 2: Định nghĩa Route và Bảo mật (`src/routes/`)**
- Mở (hoặc tạo mới) file Route tương ứng.
- Phải import `authMiddleware` và sử dụng `verifyToken` để bảo vệ API (Trừ các route public như Login/Register).
- Nếu API chỉ dành cho một số chức danh cụ thể, phải dùng `authorizeRoles('admin', 'manager')`.
- Gắn route endpoint tới hàm trong Controller.

**Bước 3: Viết tài liệu Swagger (BẮT BUỘC)**
- Ngay phía trên dòng định nghĩa `router.get(...)` hoặc `router.post(...)`, phải viết một đoạn JSDoc comment chứa cú pháp `@swagger`.
- Khai báo rõ input (`requestBody`, `parameters`) và output (`responses`).
- Trình tạo Swagger UI (`/api-docs`) sẽ tự động quét và hiển thị tài liệu này.

## 3. Quy tắc chung
- **Tuyệt đối không** viết trực tiếp truy vấn SQL (Query) hay Logic nghiệp vụ vào bên trong file Route. Tất cả phải tách ra Controller.
- **Bảo mật:** Luôn chú ý SQL Injection, sử dụng cơ chế Parameterized Query (`$1, $2`) của `pg` Pool.
- Khi tạo thêm file Route mới, hãy nhớ đăng ký nó thông qua `app.use('/api/...', ...)` trong file `src/index.js`.   
