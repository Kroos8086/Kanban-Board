const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String, // Email người thực hiện
    action: String, // Hành động (POST, PUT, DELETE)
    resource: String, // Thao tác trên đường dẫn nào (API nào)
    ip: String, // IP của hacker/người dùng
    userAgent: String, // Dùng trình duyệt gì
    status: Number, // Trạng thái thành công hay thất bại
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditSchema);
