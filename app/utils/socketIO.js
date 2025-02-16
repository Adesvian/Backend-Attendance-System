// socket.js
const { Server } = require("socket.io");

let io; // Variable untuk menyimpan instance Socket.IO
const activePages = new Set();

function init(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("form-opened", (data) => {
      activePages.add(data.page);
    });

    socket.on("form-closed", (data) => {
      activePages.delete(data.page);
    });

    socket.on("disconnect", () => {});
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket not initialized!");
  }
  return io;
}

module.exports = { init, getIO, activePages };
