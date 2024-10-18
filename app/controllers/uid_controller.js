const prisma = require("../auth/prisma");
const Error = require("../utils/error");
const { getIO } = require("../utils/socketIO");
const { createAttendance } = require("./attendance_controller");

const processUid = async (rfid, req, res) => {
  const io = getIO();
  try {
    const result = await prisma.student.findUnique({
      where: {
        rfid,
      },
    });
    io.emit("get-uid", rfid);
    if (!result) {
      return res
        .status(404)
        .json({ status: false, message: "No student found." });
    } else {
      const result = await createAttendance(req, res);
      io.emit("update-records");
      if (result.status > 200) {
        return res
          .status(result.status)
          .json({ status: result.status, message: result.message });
      } else {
        return res.status(200).json({ status: 200, message: "Success" });
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error processing RFID");
  }
};

exports.authorizeUID = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (token !== process.env.JWT_SECRET) {
    return res
      .status(403)
      .json({ status: false, message: "Forbidden: Invalid token." });
  }

  next();
};

exports.getUID = async (req, res, next) => {
  try {
    await processUid(req.body.rfid, req, res);
  } catch (error) {
    next(error);
  }
};
