const AuditLog = require('../models/audit.model');

// Middleware này như một chiếc "Camera an ninh" lắp ngoài cửa hệ thống
const securityAuditLogger = (req, res, next) => {
    // Chỉ ghi hình lại những hành động làm thay đổi dữ liệu (Thêm, Sửa, Xóa)
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {

        // Chờ API chạy xong mới ghi log để biết kết quả thành công (200) hay lỗi (400)
        res.on('finish', async () => {
            try {
                // Rút trích thông tin IP thật đằng sau Proxy
                const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                await AuditLog.create({
                    userId: req.user ? req.user.userId : null,
                    email: req.user ? req.user.email : 'Guest/Unknown',
                    action: req.method,
                    resource: req.originalUrl,
                    ip: ip,
                    userAgent: req.headers['user-agent'],
                    status: res.statusCode
                });
            } catch (error) {
                console.error('❌ Lỗi ghi Audit Log:', error.message);
            }
        });
    }
    next(); // Cho phép đi tiếp
};

module.exports = securityAuditLogger;
