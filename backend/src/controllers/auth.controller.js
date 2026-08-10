const AuthService = require('../business/auth.service');

class AuthController {
    // API Đăng ký
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

            // Gửi token qua Cookie HttpOnly với cùng cấu hình sameSite chống CSRF
            res.cookie('token', token, {
                httpOnly: true, // Trình duyệt không thể đọc bằng JavaScript (chống XSS)
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Chống CSRF (Cross-Site Request Forgery)
                maxAge: 24 * 60 * 60 * 1000 // 1 ngày
            });

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: token, // Dành cho client chọn lưu token hoặc dùng cookie
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

    // API Đăng xuất
    async logout(req, res) {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            res.status(200).json({
                success: true,
                message: 'Đăng xuất thành công!'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đăng xuất'
            });
        }
    }
}

module.exports = new AuthController();