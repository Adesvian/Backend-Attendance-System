const prisma = require("../auth/prisma");

// Function for Classes controller
exports.getAttendances = async (req, res, next) => {
  try {
    const { student_name, class: kelas, method, status } = req.query;

    const whereClause = {};

    if (student_name) {
      whereClause.student_name = { contains: student_name };
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => k.trim());
      whereClause.class = { in: kelasArray };
    }

    if (method) {
      whereClause.method = parseInt(method);
    }

    if (status) {
      whereClause.status = parseInt(status);
    }

    const data = await prisma.attendanceRecord.findMany({
      where: whereClause,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getAttendancestoday = async (req, res, next) => {
  try {
    const { class: kelas } = req.query;
    // Get the start and end of today in Unix timestamp format
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

    const whereClause = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => k.trim());
      whereClause.class = { in: kelasArray };
    }

    const data = await prisma.attendanceRecord.findMany({
      where: whereClause,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getSubjectAttendances = async (req, res, next) => {
  try {
    const { student_name, class: kelas, subject } = req.query;

    const whereClause = {};

    if (student_name) {
      whereClause.student_name = { contains: student_name };
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => k.trim());
      whereClause.class = { in: kelasArray };
    }

    if (subject) {
      whereClause.subject = subject;
    }

    const data = await prisma.subjectAttendance.findMany({
      where: whereClause,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
