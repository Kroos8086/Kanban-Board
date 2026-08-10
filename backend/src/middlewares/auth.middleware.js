const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ Cookie hoặc Header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục." });

    }
    try {
        // 2. Kiểm tra tính hợp lệ của Token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        // 3. Gắn thông tin người dùng vào request để các lớp sau sử dụng 
        req.user = decoded;
        next(); // Cho phép đi tiếp vào Controller
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });

    } 

}
module.exports = authMiddleware;