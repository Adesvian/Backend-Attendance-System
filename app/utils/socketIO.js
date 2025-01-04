// socket.js
const { Server } = require("socket.io");

let io; // Variable untuk menyimpan instance Socket.IO

function init(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket not initialized!");
  }
  return io;
}

module.exports = { init, getIO };
