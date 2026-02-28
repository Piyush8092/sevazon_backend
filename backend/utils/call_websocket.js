const { Server } = require("socket.io");
let ioInstance = null;

function setupCallWebSocket(server) {
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
    console.log("📞 Call WebSocket client connected:", socket.id);

    // Join call room
    socket.on("joinCall", (callId) => {
      socket.join(callId);
      console.log(`User ${socket.id} joined call ${callId}`);
    });

    // Relay call status events
    socket.on("callStatus", (data) => {
      // data: { callId, status, payload }
      if (data && data.callId && data.status) {
        ioInstance.to(data.callId).emit("callStatus", data);
        console.log(`Call status '${data.status}' relayed to call ${data.callId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("📞 Call WebSocket client disconnected:", socket.id);
    });
  });

  return ioInstance;
}

module.exports = setupCallWebSocket;
