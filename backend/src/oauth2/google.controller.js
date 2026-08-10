const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Lấy GOOGLE_CLIENT_ID từ biến môi trường
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'MOCK_ID');

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Xác thực token do Google trả về từ trình duyệt
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email } = payload;
        
        // Tìm user trong hệ thống bằng email
        let user = await User.findOne({ email });
        
        // Nếu user chưa tồn tại, tự động tạo mới (Đăng ký nhanh)
        if (!user) {
            user = await User.create({
                email,
                password: Math.random().toString(36).slice(-8) + 'Google@123!', // Mật khẩu ngẫu nhiên để bypass validate
                role: 'user'
            });
        }
        
        // Bỏ qua kiểm tra mật khẩu, cấp luôn Token vì Google đã bảo chứng
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.status(200).json({
            success: true,
            message: 'Đăng nhập Google thành công',
            token: token,
            user: { id: user._id, email: user.email, role: user.role }
        });
        
    } catch (error) {
        console.error('Lỗi xác thực Google:', error.message);
        res.status(401).json({ success: false, message: 'Đăng nhập Google thất bại' });
    }
};

module.exports = { googleLogin };
