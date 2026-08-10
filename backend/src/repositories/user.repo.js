const User = require('../models/user.model');

class UserRepository {
    // Tìm người dùng theo email
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    // Tạo người dùng mới
    async create(userData) {
        return await User.create(userData);
    }

    // Tìm người theo ID
    async findById(id) {
        return await User.findById(id);
    }
}

// Không cần phải viết userRepo = new UserRepository()
module.exports = new UserRepository();