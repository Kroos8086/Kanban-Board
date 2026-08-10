const mongoose = require('mongoose');
const Board = require('../models/board.model');
class BoardRepository {
    // Tạo bảng mới
    async create(boardData) {
        return await Board.create(boardData);
    }

    // Lấy tất cả bảng (Bảng do mình tạo HOẶC Bảng mình được mời)
    async findByUserId(userId) {
        return await Board.find({
            $or: [
                { userId: new mongoose.Types.ObjectId(userId) },
                { 'members.user': new mongoose.Types.ObjectId(userId) }
            ]
        }).sort({ createdAt: -1 });
    }

    // Tìm 1 bảng cụ thể theo ID
    async findById(id) {
        return await Board.findById(id);
    }

    // Cập nhật bảng
    async update(id, updateData) {
        return await Board.findByIdAndUpdate(id, updateData, { new: true });
    }
}
module.exports = new BoardRepository();
