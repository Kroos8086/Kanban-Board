const AuthService = require('../business/auth.service');
class AuthController {
    // API đăng ký
    async register(req, res) {
        try {
            const { email, password } = req.body;
            const user = await AuthService.register(email, password);

            res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công!!!',
                data: { id: user._id, email: user.email }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // API Đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, token } = await AuthService.login(email, password);
            // Gửi token qua Cookie để bảo mật hơn (Chống XSS)
            res.cookie('token', token, {
                httpOnly: true, // Trình duyệt không thể đọc bằng JavaScript
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: token, // Trả về cả token để frontend dùng nếu cần
                user: { id: user._id, email: user.email, role: user.role }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}
module.exports = new AuthController();