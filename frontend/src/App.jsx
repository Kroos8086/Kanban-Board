import React, { useState } from 'react'
import axios from 'axios'
import KanbanBoard from './components/KanbanBoard'
import { GoogleLogin } from '@react-oauth/google'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  // Nếu đã có token, hiển thị ngay bảng Kanban
  if (token) {
    return <KanbanBoard />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = isLogin ? '/login' : '/register'

    try {
      const res = await axios.post(`http://localhost:5000/api/auth${endpoint}`, { email, password })
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
      } else {
        setMessage({ type: 'success', text: "Đăng ký thành công! Hãy đăng nhập." })
        setIsLogin(true) // Chuyển sang form đăng nhập sau khi đăng ký xong
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra!' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-sans p-4">
      <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full">
        <h2 className="text-4xl font-black text-center text-white mb-2 uppercase tracking-tight italic">
          {isLogin ? 'Welcome Back' : 'Join Lab'}
        </h2>
        <p className="text-slate-400 text-center mb-8 font-medium">
          {isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản Pentest mới'}
        </p>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold animate-pulse ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#0f172a] border border-slate-700 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-4 rounded-xl text-white font-black uppercase tracking-widest mt-4 shadow-lg shadow-cyan-500/20">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Nút đăng nhập Google */}
        {isLogin && (
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center w-full mb-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="px-4 text-xs font-bold text-slate-500 uppercase">Hoặc</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await axios.post('http://localhost:5000/api/auth/google', { credential: credentialResponse.credential })
                  localStorage.setItem('token', res.data.token)
                  setToken(res.data.token)
                } catch (err) {
                  setMessage({ type: 'error', text: 'Đăng nhập Google thất bại' })
                }
              }}
              onError={() => setMessage({ type: 'error', text: 'Không thể kết nối với Google' })}
              theme="filled_black"
            />
          </div>
        )}

        <p className="mt-8 text-center text-slate-400 text-sm">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-cyan-400 font-bold hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ở đây'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default App
