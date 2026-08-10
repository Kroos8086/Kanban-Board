# 🗂️ Kanban Board

A full-stack Kanban board application with security features, built with **Node.js + Express + MongoDB + Vite (React)**.

---

## 🚀 Chạy với Docker (Khuyến nghị)

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã được cài và đang chạy

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/Kroos8086/Kanban-Board.git
cd Kanban-Board

# 2. Build và khởi động tất cả services
docker-compose up --build
```

> ⏳ Lần đầu chạy sẽ mất ~3-5 phút để build. Các lần sau chỉ cần `docker-compose up`

### Truy cập ứng dụng

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5000 |
| 🍃 MongoDB GUI (Mongo Express) | http://localhost:8081 |

### Dừng ứng dụng

```bash
docker-compose down
```

---

## 💻 Chạy thủ công (Không dùng Docker)

### Yêu cầu
- [Node.js](https://nodejs.org/) v18+
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) đã cài và đang chạy

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại: http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: http://localhost:5173

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT + Google OAuth |
| Security | Helmet, Rate Limiting, XSS Sanitization |

---

## 📁 Cấu trúc Project

```
Kanban-Board/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── repositories/ # Data access layer
│   │   ├── routes/       # API routes
│   │   └── app.js        # Entry point
│   └── Dockerfile
├── frontend/         # Vite + React
│   └── Dockerfile
├── pentest-tools/    # Security testing scripts
├── docker-compose.yml
└── README.md
```

---

## 🔐 Biến môi trường

Tạo file `backend/.env` (nếu chạy thủ công):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kanban_pentest
JWT_SECRET=your_secret_key_here
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
```

> Khi chạy Docker, biến môi trường đã được cấu hình sẵn trong `docker-compose.yml`
