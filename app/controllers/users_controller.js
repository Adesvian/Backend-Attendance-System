const prisma = require("../auth/prisma");
const bcrypt = require("bcryptjs");

// Function for Users controller
exports.getUsers = async (req, res, next) => {
  try {
    const data = await prisma.user.findMany();
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getUserByid = async (req, res, next) => {
  try {
    const data = await prisma.user.findUnique({
      select: {
        id: true,
        nid: true,
        name: true,
        username: true,
        role: true,
      },
      where: {
        nid: req.params.id,
      },
    });
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Data found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    const data = await prisma.user.create({
      data: req.body,
    });
    res.status(200).json({ msg: "Data created", data: data });
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        nid: req.params.id,
      },
    });

    const updatedData = {
      ...req.body,
      username:
        req.body.username === "" ? existingUser.username : req.body.username,
      password:
        req.body.password === ""
          ? existingUser.password
          : await bcrypt.hash(req.body.password, 10),
    };

    const data = await prisma.user.update({
      where: {
        nid: req.params.id,
      },
      data: updatedData,
    });

    res.status(200).json({ msg: "Data updated", data: data });
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const data = await prisma.user.delete({
      where: {
        nid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data deleted", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

// Function for Students controller
exports.getStudents = async (req, res, next) => {
  try {
    const { nama, class: kelas, parent } = req.query;

    const whereClause = {};

    if (nama) {
      whereClause.name = { contains: nama };
    }

    if (parent) {
      whereClause.parent_nid = parent;
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    const data = await prisma.student.findMany({
      where: whereClause,

      include: {
        class: true,
        parent: true,
      },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getStudentCountByParentNid = async (req, res, next) => {
  try {
    const nid = req.params.nid;

    const count = await prisma.student.count({
      where: {
        parent_nid: nid,
      },
    });

    res.status(200).json({ count: count });
  } catch (error) {
    console.error("Error fetching student count:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getStudentByid = async (req, res, next) => {
  try {
    const data = await prisma.student.findUnique({
      where: {
        rfid: req.params.id,
      },
      include: {
        class: true,
        parent: true,
      },
    });
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Data found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const data = await prisma.student.create({
      data: req.body,
    });
    res.status(200).json({ msg: "Data created", data: data });
  } catch (error) {
    console.log(error);
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const data = await prisma.student.update({
      where: {
        rfid: req.params.id,
      },
      data: req.body,
    });
    res.status(200).json({ msg: "Data updated", data: data });
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const data = await prisma.student.delete({
      where: {
        rfid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data deleted", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getParents = async (req, res, next) => {
  try {
    const data = await prisma.parent.findMany();
    res.status(200).json({ data: data });
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
    res.status(200).json({ msg: "Data found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addParent = async (req, res, next) => {
  try {
    const data = await prisma.parent.create({
      data: req.body,
    });
    res.status(200).json({ msg: "Data created", data: data });
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.updateParent = async (req, res, next) => {
  try {
    const data = await prisma.parent.update({
      where: {
        nid: req.params.id,
      },
      data: req.body,
    });
    res.status(200).json({ msg: "Data updated", data: data });
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
        res.status(500).json({ msg: "Something went wrong" });
    }
  }
};

exports.deleteParent = async (req, res, next) => {
  try {
    const data = await prisma.parent.delete({
      where: {
        nid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data deleted", data: data });
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

      include: {
        class: true,
      },
    });
    res.status(200).json({ data: data });
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
      include: {
        class: true,
      },
    });
    if (data == null) {
      return res.status(404).json({ msg: "Not Found" });
    }
    res.status(200).json({ msg: "Data found", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addTeacher = async (req, res, next) => {
  try {
    const data = await prisma.teacher.create({
      data: {
        nid: req.body.nid,
        name: req.body.name,
        gender: req.body.gender,
        birth_of_place: req.body.birth_of_place,
        birth_of_date: req.body.birth_of_date,
        type: req.body.type,
        class_id: req.body.class_id,
        address: req.body.address,
      },
    });

    res.status(201).json({ msg: "Data created", data: data });
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

exports.updateTeacher = async (req, res, next) => {
  try {
    const data = await prisma.teacher.update({
      where: {
        nid: req.params.id,
      },
      data: {
        nid: req.body.nid,
        name: req.body.name,
        gender: req.body.gender,
        birth_of_place: req.body.birth_of_place,
        birth_of_date: req.body.birth_of_date,
        type: req.body.type,
        class_id: req.body.class_id,
        address: req.body.address,
      },
    });
    res.status(200).json({ msg: "Data updated", data: data });
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

exports.deleteTeacher = async (req, res, next) => {
  try {
    const data = await prisma.teacher.delete({
      where: {
        nid: req.params.id,
      },
    });
    res.status(200).json({ msg: "Data deleted", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
