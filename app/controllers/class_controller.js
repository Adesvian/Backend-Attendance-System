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
        subject: { select: { name: true } },
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
