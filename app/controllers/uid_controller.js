const prisma = require("../auth/prisma");
const Error = require("../utils/error");
const { getIO, activePages } = require("../utils/socketIO");
const { createAttendance } = require("./attendance_controller");

const processUid = async (rfid, req, res) => {
  const io = getIO();
  try {
    // Periksa apakah halaman "form-student" sedang dibuka
    const isPageActive = activePages.has("form-c-student");

    // Cari data student berdasarkan RFID
    const student = await prisma.student.findUnique({
      where: {
        rfid,
      },
    });

    if (isPageActive || !student) {
      // Emit "get-uid" setiap kali ada request
      io.emit("get-uid", rfid);
      // Jika form sedang dibuka, hanya emit tanpa melanjutkan ke createAttendance
      return res.status(200).json({
        status: 200,
        message: "Form is open, skipping attendance creation.",
      });
    } else {
      // Jika form tidak dibuka, lanjutkan proses createAttendance
      const attendanceResult = await createAttendance(req, res);

      // Emit "update-records" setelah attendance berhasil dibuat
      io.emit("update-records");

      // Kembalikan hasil dari proses createAttendance
      if (attendanceResult.status > 200) {
        return res.status(attendanceResult.status).json({
          status: attendanceResult.status,
          message: attendanceResult.message,
        });
      } else {
        return res.status(200).json({ status: 200, message: "Success" });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
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
