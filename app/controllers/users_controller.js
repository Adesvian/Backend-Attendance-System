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
    const { nama, class: kelas } = req.query;

    const whereClause = {};

    if (nama) {
      whereClause.name = { contains: nama };
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => k.trim());
      whereClause.class = { in: kelasArray };
    }

    const data = await prisma.student.findMany({
      where: whereClause,
    });

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
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Function for Teachers controller
exports.getTeachers = async (req, res, next) => {
  try {
    const { nama, nid, type } = req.query;

    const whereClause = {};

    if (nama) {
      whereClause.name = { contains: nama };
    }
    if (nid) {
      whereClause.nid = nid;
    }
    if (type) {
      whereClause.type = type;
    }
    const data = await prisma.teacher.findMany({
      where: whereClause,
    });
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
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
exports.getParents = async (req, res, next) => {
  try {
    const data = await prisma.parent.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getParentByid = async (req, res, next) => {
  try {
    const data = await prisma.parent.findUnique({
      where: {
        nid: req.params.id,
      },
    });
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
