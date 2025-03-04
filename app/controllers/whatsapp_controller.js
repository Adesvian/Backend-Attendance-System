const whatsapp = require("./whatsapp.services");
const { responseSuccessWithData } = require("../utils/response");
const Error = require("../utils/error");
const prisma = require("../auth/prisma");
const { getIO } = require("../utils/socketIO");
const { compareChanges } = require("../utils/compareChanges");

exports.findsession = async (name) => {
  const existingData = await prisma.WaSession.findUnique({
    where: { name: name },
  });

  if (!existingData) {
    throw new Error("Data not found");
  }

  return existingData;
};

exports.createSession = async (req, res, next) => {
  try {
    const scan = req.body.scan;
    const sessionName = req.body.session;
    if (!sessionName) {
      throw new Error.ValidationError("Bad Request");
    }

    await whatsapp.connectToWhatsApp(sessionName);

    if (scan) {
      return res.status(200).json(
        responseSuccessWithData({
          message: "Session starting, qr appears on your browser",
        })
      );
    } else {
      res.status(400).json(
        responseSuccessWithData({
          message: "Bad request, something went wrong with request",
        })
      );
    }
  } catch (error) {
    next(error);
  }
};

exports.stopSession = async (req, res, next) => {
  try {
    const existingData = await this.findsession(req.body.name);
    const sessionName = existingData?.name;
    if (!sessionName) {
      throw new Error.ValidationError("Bad Request");
    }
    await whatsapp.stopSession(sessionName);

    const data = await prisma.WaSession.update({
      where: {
        name: req.body.name,
      },
      data: {
        status: "inactive",
      },
    });

    const changes = compareChanges(existingData, data);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Memperbarui sesi WhatsApp: ${
        req.body.name
      }. Update ${JSON.stringify(changes)}.`;
      next();
    }

    res.status(200).json(
      responseSuccessWithData({
        message: "Session stopped",
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const existingData = await this.findsession(req.body.name);
    const sessionName = existingData?.name;
    if (!sessionName) {
      throw new Error.ValidationError("Bad Request");
    }
    await whatsapp.startSession(sessionName);

    res.status(200).json(
      responseSuccessWithData({
        message: "Session started",
      })
    );
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const phone = req.body.phone;
    const name = req.body.name;
    const method = req.body.method;
    const status = req.body.status;

    if (!phone) {
      throw new Error.WhatsappError("Bad Request", 400);
    }

    const result = await whatsapp.sendTextMessage({
      number: phone,
      name: name,
      method: method,
      status: status,
    });

    if (result === true) {
      return res.status(200).json({ message: "Message sent successfully" });
    } else if (result === false) {
      return res.status(404).json({ message: "User is not registered" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getWhatsappCreds = async (req, res, next) => {
  try {
    const data = await prisma.WaSession.findMany();

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.createWhatsappCreds = async (req, res, next) => {
  const io = getIO();
  try {
    req.body.status = "pending";
    const data = await prisma.WaSession.create({
      data: req.body,
    });
    io.emit("creds-created", data);

    req.body.activity = `Membuat sesi WhatsApp: ${req.body.name}`;
    next();

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWhatsappCreds = async (req, res, next) => {
  try {
    const existingData = await this.findsession(req.params.name);

    const data = await prisma.WaSession.update({
      where: {
        name: req.params.name,
      },
      data: req.body,
    });

    const changes = compareChanges(existingData, data);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Memperbarui sesi WhatsApp: ${
        req.params.name
      }. Update ${JSON.stringify(changes)}.`;
      next();
    }

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteWhatsappCreds = async (req, res, next) => {
  const io = getIO();
  try {
    const data = await prisma.WaSession.findUnique({
      where: {
        name: req.params.name,
      },
    });

    if (data.status !== "pending") {
      await whatsapp.deleteSession(data?.name);
    } else {
      const data = await prisma.WaSession.delete({
        where: {
          name: req.params.name,
        },
      });
    }

    io.emit("closed-session", data);

    req.body.activity = `Menghapus sesi WhatsApp: ${req.params.name}`;
    next();

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
