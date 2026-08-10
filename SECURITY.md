# 🛡️ Báo Cáo Triển Khai Bảo Mật (Security Documentation)

Tài liệu này tổng hợp toàn bộ các cơ chế và kỹ thuật bảo mật đã được tích hợp trong dự án **Kanban Board**.

---

## 🔑 1. Xác Thực & Quản Lý Phiên (Authentication & Session Security)

- **Mã Hóa Mật Khẩu (Password Hashing):**
  - Sử dụng `bcryptjs` với **Salt Factor 10** để mã hóa mật khẩu trước khi lưu vào MongoDB. Tránh nguy cơ lộ mật khẩu dạng chữ rõ (plain-text) kể cả khi cơ sở dữ liệu bị rò rỉ.
- **Xác Thực Với JWT (JSON Web Token):**
  - Cấu hình xác thực thuật toán cứng `algorithms: ['HS256']` khi giải mã token nhằm ngăn chặn cuộc tấn công **JWT Algorithm Confusion Attack** (đổi thuật toán thành `"none"` hoặc `"RS256"`).
- **Lưu Trữ Token An Toàn (HttpOnly & SameSite Cookie):**
  - Token được gửi và lưu trữ trong cookie với cờ `httpOnly: true` (ngăn chặn JavaScript phía Client đọc cookie, triệt tiêu nguy cơ bị trộm token qua tấn công **XSS**).
  - Thuộc tính `sameSite: 'lax'` giúp bảo vệ ứng dụng khỏi các cuộc tấn công **CSRF (Cross-Site Request Forgery)**.
- **Tích Hợp OAuth 2.0:**
  - Xác thực qua Google OAuth 2.0 bằng thư viện chính thức `google-auth-library` kiểm tra `idToken` an toàn.

---

## 🛑 2. Phòng Thủ Tấn Công Mạng & Ứng Dụng (Application & Network Defense)

- **Chống Brute Force (Rate Limiting):**
  - **Login Limiter:** Giới hạn tối đa **10 lần thử đăng nhập / 15 phút** cho mỗi IP đối với đường dẫn `/api/auth/login`.
  - **Global Limiter:** Giới hạn **100 request / 15 phút** đối với toàn bộ các API khác để bảo vệ server khỏi spam request.
- **Bảo Vệ HTTP Security Headers (`helmet`):**
  - Tích hợp middleware `helmet()` để tự động thiết lập các HTTP Header bảo mật:
    - `X-Frame-Options: SAMEORIGIN` (chống Clickjacking)
    - `X-Content-Type-Options: nosniff` (chống MIME-sniffing)
    - `Strict-Transport-Security` (HSTS)
- **Cấu Hình CORS Khắt Khe:**
  - Chỉ cho phép các request đến từ nguồn Frontend được chỉ định (`http://localhost:5173`) với thuộc tính `credentials: true`.
- **Giới Hạn Dung Lượng Payload (Anti-DoS):**
  - Cấu hình `express.json({ limit: '10kb' })` nhằm chặn các payload dung lượng lớn cố tình làm tràn bộ nhớ (Memory Exhaustion / DoS).

---

## 🧹 3. Kiểm Tra & Làm Sạch Dữ Liệu Đầu Vào (Input Sanitization & Validation)

- **Lọc & Kiểm Tra Dữ Liệu (Input Validation):**
  - Sử dụng `express-validator` để kiểm tra độ dài mật khẩu (tối thiểu 8 ký tự), định dạng email chuẩn và tự động chuẩn hóa email (`normalizeEmail`) trước khi đưa vào cơ sở dữ liệu.
- **Chống Tấn Công XSS (Cross-Site Scripting):**
  - Sử dụng `DOMPurify` kết hợp `jsdom` loại bỏ toàn bộ các thẻ HTML nguy hiểm khỏi các trường văn bản nhập vào (như tiêu đề thẻ, mô tả công việc, nhãn...).
- **Chống NoSQL Injection:**
  - Sử dụng `mongoose.Types.ObjectId()` để ép kiểu tham số ID đầu vào, đảm bảo truy vấn MongoDB không bị chèn các toán tử NoSQL độc hại (`$gt`, `$ne`...).

---

## 🔍 4. Bảo Vệ Thông Tin & Ghi Chép Nhật Ký (Information Disclosure & Audit Log)

- **Chống Dò Tìm Tài Khoản (Username Enumeration):**
  - Đồng nhất thông báo lỗi khi đăng nhập sai email hoặc mật khẩu: *"Email hoặc mật khẩu không chính xác!!!"*, làm suy yếu khả năng rà quét tài khoản của kẻ tấn công.
- **Nhật Ký Bảo Mật (Audit Logging):**
  - Hệ thống tự động ghi chép nhật ký hành vi người dùng (đăng nhập, tạo/xóa bảng, chỉnh sửa thẻ...) vào Model `AuditLog` phục vụ công tác truy vết sự cố bảo mật (Forensic Audit).

---

## 📋 Tóm Tắt Danh Sách Công Nghệ Bảo Mật (Security Tech Stack)

| Hạng Mục | Công Nghệ / Thư Viện | Mục Đích |
|---|---|---|
| Authentication | `bcryptjs`, `jsonwebtoken` | Mã hóa mật khẩu, tạo & xác thực JWT |
| Transport Security | `cookie-parser` (HttpOnly, SameSite) | Chống lộ Token qua XSS & CSRF |
| Rate Limit | `express-rate-limit` | Chống Brute Force & Spam Request |
| HTTP Headers | `helmet` | Bảo mật HTTP Response Headers |
| Sanitization | `dompurify`, `jsdom` | Làm sạch HTML input, chống Stored/Reflected XSS |
| Validation | `express-validator` | Kiểm tra tính hợp lệ dữ liệu đầu vào |
| Audit Trail | `AuditLog` Model | Ghi vết hành vi hệ thống |
