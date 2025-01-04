const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const Error = require("../utils/error");
const { toJid } = require("../utils/number-to-jid");
const { zoneTime } = require("../utils/date-format");
const { countFilesInDirectory } = require("../utils/dir-utils");
const prisma = require("../auth/prisma");
const { getIO } = require("../utils/socketIO");

let callback = new Map();
let connectedSocket;

const CALLBACK_KEY = {
  ON_CONNECTING: "onConnecting",
  ON_CONNECTED: "onConnected",
  ON_DISCONNECTED: "onDisconnected",
  ON_QR: "onQR",
};

let updQR = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const sessions = new Map();

exports.connectToWhatsApp = async (sessionName, attempt = 1) => {
  const logger = pino({ level: "silent" });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.resolve(process.env.DIR_NAME, sessionName)
    );

    const socket = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      logger,
      browser: Browsers.appropriate("Chrome"),
    });

    connectedSocket = socket;
    sessions.set(sessionName, { ...socket });

    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (update.qr) {
        updQR++;
        if (updQR > 3) {
          socket.ws.close();
          const onDisconnected = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
          onDisconnected?.(sessionName);
        }
        const io = getIO();
        io.emit("qr-update", update.qr);
        const cb = callback.get(CALLBACK_KEY.ON_QR);
        cb?.({ qr: update.qr });
      }

      try {
        await handleConnectionUpdate(
          connection,
          lastDisconnect,
          sessionName,
          attempt
        );
      } catch (error) {
        console.error("Error in handleConnectionUpdate:", error);
      }
    });

    socket.ev.on("creds.update", async () => {
      try {
        await saveCreds();
      } catch (error) {
        console.error("Error saving credentials:", error);
      }
    });

    return socket;
  } catch (error) {
    console.error("Error connecting to WhatsApp:", error);
    throw error;
  }
};

async function countFiles() {
  const targetPath = path.resolve(process.env.DIR_NAME);
  try {
    const count = await countFilesInDirectory(targetPath);
    return count;
  } catch (err) {
    return 0;
  }
}

async function handleConnectionUpdate(
  connection,
  lastDisconnect,
  sessionName,
  attempt
) {
  const code = lastDisconnect?.error?.output?.statusCode;

  try {
    if (connection === "close") {
      await handleDisconnectReasons(code, sessionName, attempt);
    } else if (connection === "connecting") {
      const cb = callback.get(CALLBACK_KEY.ON_CONNECTING);
      if (cb) {
        try {
          await cb(sessionName);
        } catch (error) {
          console.error("Error in ON_CONNECTING callback:", error);
        }
      }
    } else if (connection === "open") {
      const cb = callback.get(CALLBACK_KEY.ON_CONNECTED);
      if (cb) {
        try {
          await cb(sessionName);
        } catch (error) {
          console.error("Error in ON_CONNECTED callback:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error handling connection update:", error);
  }
}

async function handleDisconnectReasons(code, sessionName, attempt) {
  if (
    code === DisconnectReason.restartRequired ||
    code === DisconnectReason.timedOut ||
    (code === DisconnectReason.connectionLost &&
      attempt < MAX_RECONNECT_ATTEMPTS)
  ) {
    setTimeout(async () => {
      try {
        await exports.connectToWhatsApp(sessionName, attempt + 1);
      } catch (error) {
        console.error("Error reconnecting:", error);
      }
    }, 2000);
  } else if (
    code === DisconnectReason.connectionClosed ||
    code === DisconnectReason.badSession
  ) {
    try {
      const count = await countFiles();
      if (count === 0) {
        try {
          fs.rmSync(`./sessions/${sessionName}`, {
            force: true,
            recursive: true,
          });
          const cb = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
          cb?.(sessionName);
          updQR = 0;
        } catch (err) {
          console.error("Failed to delete session:", err);
        }
      } else {
        const io = getIO();
        io.emit("stop-session", sessionName);
        const cb = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
        cb?.(sessionName);
        updQR = 0;
      }
    } catch (error) {
      console.error("Error handling closed or bad session:", error);
    }
  } else if (code === DisconnectReason.loggedOut) {
    try {
      const io = getIO();

      const safeSessionName = sessionName.replace(/[^a-zA-Z0-9_-]/g, "");
      fs.rmSync(`./sessions/${safeSessionName}`, {
        force: true,
        recursive: true,
      });

      const cb = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
      cb?.(sessionName);

      const existingSession = await prisma.WaSession.findFirst({
        where: {
          name: sessionName,
        },
      });

      if (existingSession) {
        await prisma.WaSession.delete({ where: { name: sessionName } });
      } else {
        console.warn("No session found for user ID:", sessionName);
      }

      io.emit("closed-session", sessionName);

      updQR = 0;
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }
}

exports.startSession = exports.connectToWhatsApp;

exports.stopSession = async (sessionName) => {
  const session = exports.getSession(sessionName);
  if (!session) {
    throw new Error(`Session with id ${sessionName} does not exist.`);
  }

  session.ws.close();

  const onDisconnected = callback.get(CALLBACK_KEY.ON_DISCONNECTED);
  if (onDisconnected) {
    onDisconnected(sessionName);
  }

  sessions.delete(sessionName);
};

exports.deleteSession = async (sessionName) => {
  try {
    try {
      await connectedSocket.logout();
    } catch (err) {}
    connectedSocket.end(undefined);
  } catch (error) {
    console.error("Failed to delete session:", err);
  }
};

exports.getSession = (key) => sessions.get(key);

exports.onDisconnected = (listener) => {
  callback.set(CALLBACK_KEY.ON_DISCONNECTED, listener);
};

exports.onConnecting = (listener) => {
  callback.set(CALLBACK_KEY.ON_CONNECTING, listener);
};

exports.onConnected = (listener) => {
  callback.set(CALLBACK_KEY.ON_CONNECTED, listener);
};

exports.onQRUpdated = (listener) => {
  callback.set(CALLBACK_KEY.ON_QR, listener);
};

exports.loadSession = () => {
  if (!fs.existsSync(path.resolve(process.env.DIR_NAME))) {
    fs.mkdirSync(path.resolve(process.env.DIR_NAME));
  }
  fs.readdir(path.resolve(process.env.DIR_NAME), (err, dirs) => {
    if (err) {
      throw err;
    }
    for (const dir of dirs) {
      if (!dir) continue;
      exports.connectToWhatsApp(dir);
    }
  });
};

exports.sendTextMessage = async (req, res) => {
  if (!connectedSocket) {
    throw new Error.WhatsappError("There is no socket found", 424);
  }

  const receiver = toJid(req.number.toString());
  const isRegistered = await connectedSocket.onWhatsApp(receiver);
  if (!isRegistered[0]) {
    return false;
  }

  const nama = req.name;
  const method = req.method;
  const date = new Date().getTime();
  const dateformat = new Date(date);
  const time = zoneTime(dateformat);
  const status = req.status === 200 ? "Tepat Waktu" : "Terlambat";

  const data = await prisma.WaSession.findMany({
    select: {
      greet_template: true,
    },
  });

  const greetTemplate = data[0].greet_template;

  let greetingMessage = greetTemplate
    .replace("{nama}", nama)
    .replace("{metode}", method)
    .replace("{waktu}", time)
    .replace("{status}", status);

  greetingMessage = greetingMessage.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  await connectedSocket.sendMessage(receiver, {
    text: greetingMessage,
  });

  return true;
};
