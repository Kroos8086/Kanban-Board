const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Định nghiac các đường dẫn API 
// Khi người dùng gửi POST đến /api/auth/register, nó sẽ gọi hàm register trong Controller

router.post('/register', AuthController.register);

// Khi người dùng gửi POST đến /api/auth/login
router.post('/login', AuthController.login);

// [MỚI] API Đăng nhập bằng Google
const { googleLogin } = require('../oauth2/google.controller');
router.post('/google', googleLogin);

module.exports = router;