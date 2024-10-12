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
    console.log("IO socket is opened");

    socket.on("disconnect", () => {
      console.log("IO socket is closed");
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket not initialized!");
  }
  return io;
}

module.exports = { init, getIO };
