import { io } from "socket.io-client";

// In a real SaaS, this would come from an environment variable
const SOCKET_URL = "https://erp-backend-nxl1.onrender.com";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true
});

socket.on("connect", () => {
    console.log("🔌 Connected to Automation WebSocket");
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from Automation WebSocket");
});
