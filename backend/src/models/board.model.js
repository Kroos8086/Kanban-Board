const mongoose = require('mongoose');

// Cấu trúc của một thẻ bài (Card)
const CardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent', 'low', 'medium', 'high', 'urgent'],
        default: 'Medium',
        set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
    },
    labels: [{ type: String }],
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Cấu trúc của một Cột (Column)
const ColumnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    cards: [CardSchema]
});

// Cấu trúc của một Bảng (Board)
const BoardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Chủ sở hữu (Owner)

    // TÍNH NĂNG MỚI: Danh sách thành viên được mời
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String }, // Lưu email để hiển thị cho nhanh
        role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' }
    }],

    columns: [ColumnSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
