const { body, param, validationResult } = require('express-validator');
// Hàm bắt lỗi và trả về cho client nếu dữ liệu gửi lên không đúng định dạng
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
    }
    next();

};

// Validate dữ liệu khi thêm thẻ
const validateAddCard = [
    body('boardId').isMongoId().withMessage('boardId không hợp lệ'),
    body('columnId').isMongoId().withMessage('columnId không hợp lệ'),
    body('title')
        .trim()
        .notEmpty().withMessage('Title không được để trống')
        .isLength({ max: 500 }).withMessage('Title tối đa 500 ký tự'),
    handleValidationErrors
];

// Validate dữ liệu khii cập nhật thẻ
const validateUpdateCard = [
    body('boardId').isMongoId().withMessage('boardId không hợp lệ'),
    body('columnId').isMongoId().withMessage('columnId không hợp lệ'),
    body('cardId').isMongoId().withMessage('cardId không hợp lệ'),
    body('updateData.title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 }).withMessage('Title phải từ 1-500 ký tự'),
    body('updateData.priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Priority không hợp lệ'),
    handleValidationErrors
];

// Validate dữ liệu khi thêm Cột (Column)
const validateAddColumn = [
    body('boardId').isMongoId().withMessage('boardId không hợp lệ'),
    body('title')
        .trim()
        .notEmpty().withMessage('Tên cột không được để trống')
        .isLength({ max: 100 }).withMessage('Tên cột tối đa 100 ký tự'),
    handleValidationErrors
];

// Validate params trên URL khi xóa thẻ
const validateCardParams = [
    param('boardId').isMongoId().withMessage('boardId không hợp lệ'),
    param('columnId').isMongoId().withMessage('cardId không hợp lệ'),
    param('cardId').isMongoId().withMessage('cardId không hợp lệ'),
    handleValidationErrors
];

module.exports = {
    validateAddCard,
    validateUpdateCard,
    validateAddColumn,
    validateCardParams
};