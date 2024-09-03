const prisma = require("../auth/prisma");

// Function for Users controller
exports.getUsers = async (req, res, next) => {
  try {
    const data = await prisma.user.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Function for Students controller
exports.getStudents = async (req, res, next) => {
  try {
    const data = await prisma.student.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getStudentByid = async (req, res, next) => {
  try {
    const data = await prisma.student.findUnique({
      where: {
        rfid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Function for Teachers controller
exports.getTeachers = async (req, res, next) => {
  try {
    const data = await prisma.teacher.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getTeacherByid = async (req, res, next) => {
  try {
    const data = await prisma.teacher.findUnique({
      where: {
        nid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
