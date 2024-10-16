const whatsapp = require("./whatsapp.services");
const { responseSuccessWithData } = require("../utils/response");
const Error = require("../utils/error");
const prisma = require("../auth/prisma");
const { getIO } = require("../utils/socketIO");

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
    const data = await prisma.WaSession.findUnique({
      where: {
        number: req.body.number,
      },
    });
    const sessionName = data?.name;
    if (!sessionName) {
      throw new Error.ValidationError("Bad Request");
    }
    await whatsapp.stopSession(sessionName);

    await prisma.WaSession.update({
      where: {
        number: req.body.number,
      },
      data: {
        status: "inactive",
      },
    });
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
    const data = await prisma.WaSession.findUnique({
      where: {
        number: req.body.number,
      },
    });
    const sessionName = data?.name;
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

    const connectedSocket = await whatsapp.sendTextMessage({
      number: phone,
      name: name,
      method: method,
      status: status,
    });

    return connectedSocket;
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
    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWhatsappCreds = async (req, res, next) => {
  try {
    const data = await prisma.WaSession.update({
      where: {
        number: req.params.num,
      },
      data: req.body,
    });
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
    const data = await prisma.WaSession.delete({
      where: {
        number: req.params.num,
      },
    });

    if (data.status !== "pending") {
      await whatsapp.deleteSession(data?.name);
    }

    io.emit("closed-session", data);

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(error);
  }
};
