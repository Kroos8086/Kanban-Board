const UserRepository = require('../repositories/user.repo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    // 1. Nghiệp vụ đăng ký
    async register(email, password) {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email này đã tồn tại trong hệ thống!!!');
        }
        // Mã hóa mật khẩu (Bảo mật: Khônng bao giờ lưu mật khẩu dạng chữ rõ)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào DB thông qua Repository
        return await UserRepository.create({
            email,
            password: hashedPassword
        });
    }

    // 2. Nghiệp vụ đăng nhập
    async login(email, password) {
        // Kiểm tra người dùng có tồn tại không 
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error("Email hoặc mật khẩu không chính xác!!!");
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Email hoặc mật khẩu không chính xác!!!");
        }
        // Tạo JWT Token (Chứng chỉ để người dùng đăng nhập những lần sau)
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Thông tin đính kèm vào token
            process.env.JWT_SECRET, // Mã bí mật lấy từ file .env   
            { expiresIn: '1d' }
        );
        return { user, token };
    }
}
module.exports = new AuthService();