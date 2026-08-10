require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./extensions/db');

const app = express();

connectDB();

// 1. Bảo vệ Headers với Helmet
app.use(helmet());

// 2. Cấu hình CORS khắt khe (Chỉ cho phép Frontend của bạn)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 3. Giới hạn số lượng request chung (Chống Spam / DDoS nhẹ)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 request/1 IP
    message: { success: false, message: 'Quá nhiều request. Thử lại sau 15 phút.' }
});
app.use(globalLimiter);

// BỘ ĐẾM RIÊNG CHỐNG BRUTE FORCE ĐĂNG NHẬP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Chỉ cho thử đăng nhập 10 lần / 15 phút
    message: { success: false, message: 'Quá nhiều lần thử đăng nhập sai. Vui lòng thử lại sau 15 phút.' }
});

// 4. Middleware cơ bản (Giới hạn dung lượng Body chống DoS)
app.use(express.json({ limit: '10kb' })); // Không cho gửi body lớn hơn 10kb
app.use(cookieParser());
app.use(morgan('dev'));

// 4.5. Mở file tĩnh để xem file đính kèm
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 5. Khai báo Routes
const authRoutes = require('./routes/auth.routes');
// Áp dụng LoginLimiter chỉ riêng cho /login
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

const boardRoutes = require('./routes/board.routes');
const securityAuditLogger = require('./security/audit.logger');
app.use('/api/boards', securityAuditLogger, boardRoutes);

app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', status: 'Server is running safe!' });
});

// 6. Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔒 Secure Server đang chạy tại: http://localhost:${PORT}`);
});
