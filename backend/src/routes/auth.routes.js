const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validateAuth.middleware');

// API Đăng ký (áp dụng middleware validation)
router.post('/register', validateRegister, AuthController.register);

// API Đăng nhập (áp dụng middleware validation)
router.post('/login', validateLogin, AuthController.login);

// API Đăng xuất
router.post('/logout', AuthController.logout);

// API Đăng nhập bằng Google
const { googleLogin } = require('../oauth2/google.controller');
router.post('/google', googleLogin);

module.exports = router;