const BoardService = require('../business/board.service');

// Hàm dùng chung để xử lý lỗi an toàn
const handleError = (res, error, functionName) => {
    console.error(`[LỖI ${functionName}]`, error); // Chỉ in log chi tiết trên server (Terminal)

    // Nếu là lỗi nghiệp vụ do mình chủ động quăng ra (như "Không tìm thấy", "Forbidden")
    const isUserError = ['Không tìm thấy', 'Forbidden', 'không hợp lệ', 'Bạn không có quyền'].some(msg => error.message?.includes(msg));

    // Nếu là lỗi hệ thống (như MongoDB lỗi), trả về thông báo chung chung, không rò rỉ thông tin
    res.status(isUserError ? 400 : 500).json({
        success: false,
        message: isUserError ? error.message : 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.'
    });
};

class BoardController {
    // Lấy danh sách bảng
    async getBoards(req, res) {
        try {
            const userId = req.user.userId;
            let boards = await BoardService.getUserBoards(userId);

            if (boards.length === 0) {
                const defaultBoard = await BoardService.createBoard(userId, "Dự án mới");
                boards = [defaultBoard];
            }

            res.status(200).json({ success: true, data: boards });
        } catch (error) {
            handleError(res, error, 'GET_BOARDS');
        }
    }

    // Tạo bảng thủ công
    async create(req, res) {
        try {
            const { name } = req.body;
            const userId = req.user.userId;
            const board = await BoardService.createBoard(userId, name);
            res.status(201).json({ success: true, data: board });
        } catch (error) {
            handleError(res, error, 'CREATE_BOARD');
        }
    }

    // Lấy chi tiết 1 bảng (Bảo vệ chống IDOR)
    async getOne(req, res) {
        try {
            const board = await BoardService.getBoardDetail(req.params.id);
            // Kiểm tra xem bảng có thuộc về người dùng đang đăng nhập không
            if (board.userId.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'Forbidden: Bạn không có quyền truy cập bảng này' });
            }
            res.status(200).json({ success: true, data: board });
        } catch (error) {
            handleError(res, error, 'GET_ONE_BOARD');
        }
    }

    // Thêm thẻ bài
    async addCard(req, res) {
        try {
            const { boardId, columnId, title } = req.body;
            const updatedBoard = await BoardService.addCard(boardId, columnId, title);
            res.status(200).json({ success: true, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'ADD_CARD');
        }
    }

    // Di chuyển thẻ
    async moveCard(req, res) {
        try {
            const { boardId, cardId, fromColId, toColId, newIndex } = req.body;
            const updatedBoard = await BoardService.moveCard(boardId, cardId, fromColId, toColId, newIndex);
            res.status(200).json({ success: true, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'MOVE_CARD');
        }
    }

    // Xóa thẻ
    async deleteCard(req, res) {
        try {
            const { boardId, columnId, cardId } = req.params;
            await BoardService.deleteCard(boardId, columnId, cardId);
            res.status(200).json({ success: true, message: 'Đã xóa thẻ!' });
        } catch (error) {
            handleError(res, error, 'DELETE_CARD');
        }
    }

    // Xóa bảng
    async deleteBoard(req, res) {
        try {
            const userId = req.user.userId;
            await BoardService.deleteBoard(req.params.id, userId);
            res.status(200).json({ success: true, message: 'Đã xóa bảng!' });
        } catch (error) {
            handleError(res, error, 'DELETE_BOARD');
        }
    }

    // Thêm cột
    async addColumn(req, res) {
        try {
            const { boardId, title } = req.body;
            const updatedBoard = await BoardService.addColumn(boardId, title);
            res.status(200).json({ success: true, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'ADD_COLUMN');
        }
    }

    // Xóa cột
    async deleteColumn(req, res) {
        try {
            const { boardId, columnId } = req.params;
            const updatedBoard = await BoardService.deleteColumn(boardId, columnId);
            res.status(200).json({ success: true, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'DELETE_COLUMN');
        }
    }

    // Cập nhật thẻ
    async updateCard(req, res) {
        try {
            const { boardId, columnId, cardId, updateData } = req.body;
            const updatedBoard = await BoardService.updateCard(boardId, columnId, cardId, updateData);
            res.status(200).json({ success: true, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'UPDATE_CARD');
        }
    }
    // Xử lý API Mời thành viên
    async addMember(req, res) {
        try {
            const { boardId, email, role } = req.body;
            // Validate sơ bộ
            if (!email || !role) return res.status(400).json({ success: false, message: 'Thiếu email hoặc quyền hạn' });
            if (!['editor', 'viewer'].includes(role)) return res.status(400).json({ success: false, message: 'Quyền hạn không hợp lệ' });
            const updatedBoard = await BoardService.addMember(boardId, email, role);
            res.status(200).json({ success: true, message: `Đã mời ${email} thành công!`, data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'ADD_MEMBER');
        }
    }

    // Xử lý upload file đính kèm
    async uploadAttachment(req, res) {
        try {
            const { boardId, columnId, cardId } = req.params;
            if (!req.file) return res.status(400).json({ success: false, message: 'Chưa chọn file' });
            
            const updatedBoard = await BoardService.uploadAttachment(boardId, columnId, cardId, req.file);
            res.status(200).json({ success: true, message: 'Upload thành công', data: updatedBoard });
        } catch (error) {
            handleError(res, error, 'UPLOAD_ATTACHMENT');
        }
    }
}

module.exports = new BoardController();
