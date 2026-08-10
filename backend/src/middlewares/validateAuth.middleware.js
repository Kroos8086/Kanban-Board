const { body, validationResult } = require('express-validator');

// Rules kiểm tra cho Đăng Ký
const validateRegister = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không đúng định dạng!')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }
        next();
    }
];

// Rules kiểm tra cho Đăng Nhập
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không đúng định dạng!')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateRegister,
    validateLogin
};
