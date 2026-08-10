const Board = require('../models/board.model');

const boardOwnerMiddleware = async (req, res, next) => {
    try {
        const boardId = req.params.boardId || req.body.boardId;
        const userId = req.user.userId;

        if (!boardId) return res.status(400).json({ success: false, message: 'Thiếu boardId' });

        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({ success: false, message: 'Không tìm thấy bảng!' });

        const isOwner = board.userId.toString() === userId;

        // Tìm xem user này có nằm trong danh sách thành viên không
        const member = board.members.find(m => m.user.toString() === userId);

        // 1. Nếu không phải chủ, cũng không có trong danh sách thành viên -> CẤM
        if (!isOwner && !member) {
            return res.status(403).json({ success: false, message: 'Forbidden: Bạn không có quyền truy cập bảng này!' });
        }

        // 2. Nếu là thao tác XÓA BẢNG hoặc MỜI NGƯỜI KHÁC -> Bắt buộc phải là Chủ (Owner)
        if (req.method === 'DELETE' && !req.params.columnId && !req.params.cardId) {
            if (!isOwner) return res.status(403).json({ success: false, message: 'Chỉ Chủ sở hữu mới được xóa bảng!' });
        }

        // 3. Nếu là thao tác THÊM/SỬA/XÓA Thẻ Bài -> Owner hoặc Editor mới được làm
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            if (!isOwner && member?.role !== 'editor') {
                return res.status(403).json({ success: false, message: 'Bạn chỉ có quyền Xem, không được phép chỉnh sửa!' });
            }
        }

        req.board = board;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi xác thực quyền truy cập' });
    }
};

module.exports = boardOwnerMiddleware;
