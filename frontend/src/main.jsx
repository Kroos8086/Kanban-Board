import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// ĐIỀN GOOGLE_CLIENT_ID CỦA BẠN VÀO ĐÂY (Tạo trên Google Cloud Console)
const GOOGLE_CLIENT_ID = "694415200049-fp3uq8imj27rmoo39ls7vi2vur1mvhd0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
