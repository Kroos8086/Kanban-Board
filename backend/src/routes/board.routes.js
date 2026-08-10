const express = require('express');
const router = express.Router();
const BoardController = require('../controllers/board.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Import các middleware bảo mật vừa tạo
const boardOwner = require('../middlewares/boardOwner.middleware');
const {
    validateAddCard,
    validateUpdateCard,
    validateAddColumn,
    validateCardParams
} = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

// Lớp bảo vệ 1: Bắt buộc đăng nhập
router.use(authMiddleware);

// Các API xử lý Bảng (Board)
router.post('/', BoardController.create);
router.get('/', BoardController.getBoards);
router.get('/:id', BoardController.getOne);
router.delete('/:id', BoardController.deleteBoard);

// Các API xử lý Thẻ bài (Card) - Thêm lớp bảo vệ 2 (Kiểm tra sở hữu) và lớp 3 (Validate dữ liệu)
router.post('/add-card', boardOwner, validateAddCard, BoardController.addCard);
router.put('/move-card', boardOwner, BoardController.moveCard);
router.put('/card', boardOwner, validateUpdateCard, BoardController.updateCard);
router.delete('/card/:boardId/:columnId/:cardId', boardOwner, validateCardParams, BoardController.deleteCard);
router.post('/card/:boardId/:columnId/:cardId/upload', boardOwner, upload.single('file'), BoardController.uploadAttachment);

// Các API xử lý Cột (Column)
router.post('/column', boardOwner, validateAddColumn, BoardController.addColumn);
router.delete('/column/:boardId/:columnId', boardOwner, BoardController.deleteColumn);

// API Mời thành viên (Chỉ chủ sở hữu mới gọi được API này, middleware boardOwner đã kiểm tra ở Bước 2)
router.post('/member', boardOwner, BoardController.addMember);

module.exports = router;
