const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Đặt tên file ngẫu nhiên để tránh trùng lặp
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

module.exports = upload;
