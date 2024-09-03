const { toDataURL } = require("qrcode");
const whatsapp = require("./whatsapp.services");
const { responseSuccessWithData } = require("../utils/response");
const Error = require("../utils/error");

exports.createSession = async (req, res, next) => {
  try {
    const scan = req.body.scan || req.query.scan;
    const sessionName = req.body.session || req.query.session;
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

exports.sendMessage = async (req, res, next) => {
  try {
    const phone = req.body.to || req.query.to;
    const message = req.body.text || req.query.text;

    if (!phone || !message) {
      throw new Error.WhatsappError("Bad Request", 400);
    }

    const connectedSocket = await whatsapp.sendTextMessage({
      number: phone,
      message: message,
    });

    if (connectedSocket) {
      return res.status(200).json(
        responseSuccessWithData({
          message: `${phone} was successfully notified`,
        })
      );
    }
  } catch (error) {
    next(error);
  }
};
