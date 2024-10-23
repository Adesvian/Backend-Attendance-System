const prisma = require("../auth/prisma");

// Function for Classes controller
exports.getClasses = async (req, res, next) => {
  try {
    const { id, name } = req.query;

    const whereClause = {};

    if (id) {
      whereClause.id = parseInt(id);
    }

    if (name) {
      whereClause.name = name;
    }

    const data = await prisma.class.findMany({
      where: whereClause,
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getClassSchedule = async (req, res, next) => {
  try {
    const {
      class: kelas,
      subjectid,
      teacherid,
      day,
      start_time,
      end_time,
    } = req.query;

    const whereClause = {};

    if (kelas) {
      whereClause.class_id = parseInt(kelas);
    }

    if (subjectid) {
      whereClause.subject_id = parseInt(subjectid);
    }

    if (teacherid) {
      whereClause.teacher_nid = teacherid;
    }

    if (day) {
      whereClause.day = day;
    }

    if (start_time) {
      whereClause.start_time = start_time;
    }

    if (end_time) {
      whereClause.end_time = end_time;
    }

    const data = await prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        class: { select: { name: true } },
        subject: {
          select: {
            name: true,
            category: { select: { name: true } },
          },
        },
        teacher: { select: { name: true } },
      },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getClassScheduleById = async (req, res, next) => {
  try {
    const data = await prisma.classSchedule.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getClassScheduleByNID = async (req, res, next) => {
  try {
    const data = await prisma.classSchedule.findMany({
      where: {
        teacher_nid: req.params.nid,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.createClassSchedule = async (req, res, next) => {
  try {
    const data = await prisma.classSchedule.create({
      data: req.body,
    });
    res.status(200).json({ data: data });
  } catch (error) {
    switch (error.code) {
      case "P2002":
        res.status(409).json({
          msg: "Unique constraint failed.",
          error: error.code,
          field: error.meta.target,
        });
        break;
      case "P2003":
        res.status(400).json({
          msg: "Foreign key constraint failed.",
          error: error.code,
          field: error.meta.target,
        });
        break;
      default:
        res.status(500).json({
          msg: "Internal server error.",
        });
        break;
    }
  }
};

exports.updateClassSchedule = async (req, res, next) => {
  try {
    const data = await prisma.classSchedule.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: req.body,
    });
    res.status(200).json({ data: data });
  } catch (error) {
    switch (error.code) {
      case "P2002":
        res.status(409).json({
          msg: "Unique constraint failed.",
          error: error.code,
          field: error.meta.target,
        });
        break;
      case "P2003":
        res.status(400).json({
          msg: "Foreign key constraint failed.",
          error: error.code,
          field: error.meta.target,
        });
        break;
      default:
        res.status(500).json({
          msg: "Internal server error.",
        });
        break;
    }
  }
};

exports.deleteClassSchedule = async (req, res, next) => {
  try {
    const data = await prisma.classSchedule.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getEnrollment = async (req, res, next) => {
  try {
    const data = await prisma.enrollmentExtra.findMany({
      where: {
        ekstrakurikuler: parseInt(req.params.id),
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addEnrollment = async (req, res, next) => {
  const { student_rfid, ekstrakurikuler } = req.body;

  try {
    // Fetch existing enrollments for the given subject
    const existingEnrollments = await prisma.enrollmentExtra.findMany({
      where: {
        ekstrakurikuler: ekstrakurikuler,
        student_rfid: {
          in: student_rfid,
        },
      },
    });

    const existingRFIDs = existingEnrollments.map(
      (enrollment) => enrollment.student_rfid
    );

    // Filter out the RFIDs that already exist
    const newEnrollments = student_rfid.filter(
      (rfid) => !existingRFIDs.includes(rfid)
    );

    // Create new enrollments for RFIDs that do not already exist
    const enrollments = await Promise.all(
      newEnrollments.map(async (rfid) => {
        return await prisma.enrollmentExtra.create({
          data: {
            student_rfid: rfid,
            ekstrakurikuler: ekstrakurikuler,
          },
        });
      })
    );

    res.status(200).json({ data: enrollments });
  } catch (error) {
    console.log(error);
    switch (error.code) {
      case "P2003":
        res.status(400).json({
          msg: "Foreign key constraint failed.",
          error: error.code,
          field: error.meta.target,
        });
        break;
      default:
        res.status(500).json({
          msg: "Internal server error.",
        });
        break;
    }
  }
};

exports.removeEnrollment = async (req, res) => {
  const { student_rfid, ekstrakurikuler } = req.body;
  if (!student_rfid || !ekstrakurikuler) {
    return res
      .status(400)
      .json({ msg: "Student RFID and ekstrakurikuler ID are required." });
  }

  try {
    const ekstrakurikulerId = parseInt(ekstrakurikuler);

    const result = await prisma.enrollmentExtra.deleteMany({
      where: {
        student_rfid: {
          in: student_rfid,
        },
        ekstrakurikuler: ekstrakurikulerId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ msg: "No enrollment found to remove." });
    }

    res
      .status(200)
      .json({ msg: `${result.count} enrollment(s) removed successfully.` });
  } catch (error) {
    console.error("Error removing enrollment:", error);
    res.status(500).json({ msg: "Something went wrong." });
  }
};
