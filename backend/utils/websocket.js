const { Server } = require("socket.io");

let ioInstance = null;

function setupWebSocket(server) {
  if (ioInstance) return ioInstance;
  ioInstance = new Server(server, {
    cors: {
      origin: [
        "https://www.loklink.in",
        "*",
        "https://admin.loklink.in",
        "https://loklink-adminportal.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001/login",
      ],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("🔌 WebSocket client connected:", socket.id);

    // Join chat room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave chat room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Relay chat message
    socket.on("chatMessage", (data) => {
      // data: { roomId, message }
      if (data && data.roomId && data.message) {
        ioInstance.to(data.roomId).emit("chatMessage", data.message);
        console.log(`Message relayed to room ${data.roomId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket client disconnected:", socket.id);
    });
  });

  return ioInstance;
}

module.exports = setupWebSocket;
