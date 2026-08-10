const BoardRepository = require('../repositories/board.repo');
const Board = require('../models/board.model');
const User = require('../models/user.model');


// Nhập công cụ làm sạch dữ liệu
const { sanitizeString, sanitizeArray } = require('../utils/sanitize');

class BoardService {
    // Tạo bảng mới kèm theo các cột mặc định
    async createBoard(userId, name) {
        const cleanName = sanitizeString(name); // Làm sạch tên bảng
        const defaultColumns = [
            { title: 'To Do', order: 1, cards: [] },
            { title: 'In Progress', order: 2, cards: [] },
            { title: 'Done', order: 3, cards: [] }
        ];

        return await BoardRepository.create({
            name: cleanName,
            userId,
            columns: defaultColumns
        });
    }

    // Lấy danh sách bảng của User
    async getUserBoards(userId) {
        return await BoardRepository.findByUserId(userId);
    }

    // Lấy chi tiết 1 bảng
    async getBoardDetail(boardId) {
        const board = await BoardRepository.findById(boardId);
        if (!board) throw new Error('Không tìm thấy bảng này!');
        return board;
    }

    // Thêm thẻ bài mới vào cột
    async addCard(boardId, columnId, title) {
        const board = await BoardRepository.findById(boardId);
        if (!board) throw new Error('Không tìm thấy bảng!');

        const column = board.columns.id(columnId);
        if (!column) throw new Error('Không tìm thấy cột!');

        const cleanTitle = sanitizeString(title); // Làm sạch tiêu đề thẻ
        column.cards.push({ title: cleanTitle });
        return await board.save();
    }

    // Di chuyển thẻ bài giữa các cột
    async moveCard(boardId, cardId, fromColId, toColId, newIndex) {
        const board = await BoardRepository.findById(boardId);

        // 1. Tìm và xóa thẻ ở cột cũ
        const fromCol = board.columns.id(fromColId);
        const card = fromCol.cards.id(cardId);
        fromCol.cards.pull(cardId);

        // 2. Thêm thẻ vào cột mới ở vị trí newIndex
        const toCol = board.columns.id(toColId);
        toCol.cards.splice(newIndex, 0, card);
        return await board.save();
    }

    // Xóa thẻ bài
    async deleteCard(boardId, columnId, cardId) {
        const board = await BoardRepository.findById(boardId);
        const column = board.columns.id(columnId);
        column.cards.pull(cardId);
        return await board.save();
    }

    // Cập nhật thông tin thẻ bài
    async updateCard(boardId, columnId, cardId, updateData) {
        const board = await BoardRepository.findById(boardId);
        const column = board.columns.id(columnId);
        const card = column.cards.id(cardId);

        // Làm sạch từng trường dữ liệu trước khi lưu
        if (updateData.title) card.title = sanitizeString(updateData.title);
        if (updateData.description !== undefined) card.description = sanitizeString(updateData.description);
        if (updateData.priority) card.priority = updateData.priority; // Đã được validate ở route
        if (updateData.labels) card.labels = sanitizeArray(updateData.labels);

        return await board.save();
    }

    // Xóa bảng
    async deleteBoard(boardId, userId) {
        const board = await BoardRepository.findById(boardId);
        if (!board) throw new Error('Không tìm thấy bảng!');

        // Kiểm tra xem bảng này có phải của user đăng nhập hay không
        if (board.userId.toString() !== userId) {
            throw new Error('Bạn không có quyền xóa bảng này');
        }

        return await Board.findByIdAndDelete(boardId);
    }

    // Thêm cột mới vào bảng
    async addColumn(boardId, title) {
        const board = await BoardRepository.findById(boardId);
        const cleanTitle = sanitizeString(title); // Làm sạch tên cột
        board.columns.push({ title: cleanTitle, cards: [] });
        return await board.save();
    }

    // Xóa cột
    async deleteColumn(boardId, columnId) {
        const board = await BoardRepository.findById(boardId);
        board.columns.pull(columnId);
        return await board.save();
    }
    // Mời thành viên vào bảng bằng Email
    async addMember(boardId, email, role) {
        const board = await BoardRepository.findById(boardId);

        // Tìm user trong hệ thống bằng email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) throw new Error('Không tìm thấy người dùng với email này trên hệ thống!');

        // Chặn không cho tự mời chính mình (Chủ sở hữu)
        if (board.userId.toString() === user._id.toString()) {
            throw new Error('Người dùng này đã là chủ sở hữu của bảng!');
        }

        // Kiểm tra xem đã được mời trước đó chưa
        const existingMember = board.members.find(m => m.user.toString() === user._id.toString());
        if (existingMember) {
            existingMember.role = role; // Nếu có rồi thì cập nhật lại quyền
        } else {
            board.members.push({ user: user._id, email: user.email, role }); // Thêm người mới
        }

        return await board.save();
    }

    // Đính kèm file vào thẻ
    async uploadAttachment(boardId, columnId, cardId, file) {
        const board = await BoardRepository.findById(boardId);
        const column = board.columns.id(columnId);
        const card = column.cards.id(cardId);
        
        card.attachments.push({
            filename: file.originalname,
            url: `/uploads/${file.filename}`
        });
        
        return await board.save();
    }
}

module.exports = new BoardService();
