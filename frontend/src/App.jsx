// src/App.jsx
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from "./routes";
import Chatbot from './features/Chatbot/Chatbot'; // Import Chatbot từ features
import './assets/styles/global.css';

// 1. Tạo một component phụ để xử lý logic ẩn/hiện
const AppContent = () => {
  const location = useLocation();

  // Kiểm tra nếu đường dẫn bắt đầu bằng '/admin'
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <AppRoutes />
      {/* Chỉ hiển thị Chatbot nếu KHÔNG PHẢI trang admin */}
      {!isAdminPage && <Chatbot />}
    </>
  );
};

function App() {
  return (
    <Router>
      {/* 2. Gọi AppContent bên trong Router */}
      <AppContent />
    </Router>
  );
}

export default App;