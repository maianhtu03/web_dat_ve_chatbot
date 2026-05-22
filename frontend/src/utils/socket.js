// frontend/src/utils/socket.js
import { io } from "socket.io-client";

// URL của Backend
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: true, // Tự động kết nối khi app chạy
    reconnection: true, // Tự động kết nối lại nếu mất mạng
});