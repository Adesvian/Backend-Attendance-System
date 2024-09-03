const prisma = require("../auth/prisma");

// Function for Classes controller
exports.getAttendances = async (req, res, next) => {
  try {
    const data = await prisma.attendanceRecord.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
