const prisma = require("../auth/prisma");

// Function for Classes controller
exports.getClasses = async (req, res, next) => {
  try {
    const data = await prisma.class.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getClassSchedule = async (req, res, next) => {
  try {
    const { id, classid, subjectid, teacherid, day, start_time, end_time } =
      req.query;

    const whereClause = {};

    if (id) {
      whereClause.id = parseInt(id);
    }

    if (classid) {
      whereClause.class_id = parseInt(classid);
    }

    if (subjectid) {
      whereClause.subject_id = parseInt(subjectid);
    }

    if (teacherid) {
      whereClause.teacher_id = parseInt(teacherid);
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
    });

    if (data.length === 0) {
      return res.status(404).json({ msg: "Data not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
