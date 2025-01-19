const prisma = require("../auth/prisma");
const bcrypt = require("bcryptjs");
const { compareChanges } = require("../utils/compareChanges");

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

    req.body.activity = `Membuat data user "${req.body.role}": ${req.body.name}.`;
    next();

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
        req.body.username === "" ||
        req.body.username === false ||
        req.body.username === null ||
        req.body.username === undefined
          ? existingUser.username
          : req.body.username,
      password:
        req.body.password === "" ||
        req.body.password === false ||
        req.body.password === null ||
        req.body.password === undefined
          ? existingUser.password
          : await bcrypt.hash(req.body.password, 10),
    };

    const data = await prisma.user.update({
      where: {
        nid: req.params.id,
      },
      data: updatedData,
    });

    const changes = compareChanges(existingUser, updatedData);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update data user "${existingUser.role}": ${
        existingUser.name
      }.
    Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

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

    req.body.activity = `Menghapus data user "${data.role}": ${data.name}.`;
    next();

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

    req.body.activity = `Menambah data "Siswa": ${
      req.body.name
    } data: ${JSON.stringify(req.body)} `;
    next();

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

exports.updateStudent = async (req, res, next) => {
  try {
    const existingData = await prisma.student.findUnique({
      where: { rfid: req.params.id },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const data = await prisma.student.update({
      where: {
        rfid: req.params.id,
      },
      data: req.body,
    });

    const changes = compareChanges(existingData, req.body);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update data "Siswa": ${existingData.name}.
    Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

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

    req.body.activity = `Menghapus data "Siswa": ${data.name}.`;
    next();

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

    req.body.activity = `Membuat data "parent": ${
      req.body.name
    } data: ${JSON.stringify(req.body)} `;
    next();

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
    const existingData = await prisma.parent.findUnique({
      where: { nid: req.params.id },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const data = await prisma.parent.update({
      where: {
        nid: req.params.id,
      },
      data: req.body,
    });

    const changes = compareChanges(existingData, req.body);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update data "parent": ${existingData.name}.
    Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

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

    req.body.activity = `Menghapus data "parent": ${
      data.name
    }. Data: ${JSON.stringify(data)} `;
    next();

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

    req.body.activity = `Membuat data "teacher" dengan NIK: ${data.nid}`;
    next();

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
    const existingData = await prisma.teacher.findUnique({
      where: { nid: req.params.id },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const updatedData = await prisma.teacher.update({
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

    const changes = compareChanges(existingData, req.body);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update data "teacher" dengan NIK: ${
        existingData.nid
      }. 
    Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

    res.status(200).json({ msg: "Data updated", data: updatedData });
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
          error: error.message,
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

    req.body.activity = `Delete data "teacher" dengan NIK: ${req.params.id}.`;
    next();

    res.status(200).json({ msg: "Data deleted", data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.verify_reset = async (req, res, next) => {
  try {
    const { username, nid } = req.query;

    if (!username || !nid) {
      return res.status(404).json({ data: false });
    }

    const lastThreeDigits = nid.slice(-3);

    const whereClause = {
      username: username,
      nid: {
        endsWith: lastThreeDigits,
      },
    };

    const data = await prisma.user.findMany({
      where: whereClause,
    });

    if (data.length === 0) {
      return res.status(404).json({ data: false });
    }

    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.reset_password = async (req, res, next) => {
  try {
    const { username, nid, password } = req.body;

    const existingData = await prisma.user.findMany({
      where: {
        username: username,
      },
    });

    if (existingData.length === 0) {
      return res
        .status(404)
        .json({ data: false, msg: "Username tidak ditemukan." });
    }

    if (!username || !nid || !password) {
      return res
        .status(400)
        .json({ data: false, msg: "Semua field harus diisi." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ data: false, msg: "Password harus minimal 6 karakter." });
    }

    const lastThreeDigits = nid.slice(-3);

    const whereClause = {
      username: username,
      nid: {
        endsWith: lastThreeDigits,
      },
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await prisma.user.updateMany({
      where: whereClause,
      data: {
        password: hashedPassword,
      },
    });

    if (data.count === 0) {
      return res
        .status(404)
        .json({ data: false, msg: "Username atau NIK tidak ditemukan." });
    }

    const changes = compareChanges(existingData[0], {
      password: hashedPassword,
    });

    req.isReset = true;

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Melakukan reset password: ${JSON.stringify(
        changes
      )}.`;
      next();
    }
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server." });
  }
};

exports.createParentAndUser = async (req, res, next) => {
  const { parentData, userData } = req.body;

  try {
    // Cek apakah parentData atau userData kosong
    if (!parentData || !userData) {
      return res
        .status(400)
        .json({ msg: "Invalid data: parentData or userData is missing." });
    }

    // Hash password untuk user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Gunakan transaksi Prisma
    const [parent, user] = await prisma.$transaction([
      prisma.parent.create({ data: parentData }),
      prisma.user.create({ data: userData }),
    ]);

    req.body.activity = `Membuat data "parent" dan "user" dengan NIK: ${parent.nid}`;
    next();

    res.status(201).json({
      msg: "Parent and User created successfully",
      parent,
      user,
    });
  } catch (error) {
    // Tangani error berdasarkan kode Prisma
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
        res
          .status(500)
          .json({ msg: "Something went wrong", error: error.message });
    }
  }
};

exports.updateParentAndUser = async (req, res, next) => {
  const { parentData, userData } = req.body;
  const nid = req.params.id;

  try {
    // Cari data lama parent dan user
    const existingParent = await prisma.parent.findUnique({ where: { nid } });
    const existingUser = await prisma.user.findUnique({ where: { nid } });

    if (!existingParent || !existingUser) {
      return res.status(404).json({ msg: "Data not found" });
    }

    // Siapkan data yang akan diperbarui
    const updatedParentData = { ...parentData };
    const updatedUserData = {
      ...userData,
      password:
        userData.password && userData.password !== existingUser.password
          ? await bcrypt.hash(userData.password, 10)
          : existingUser.password,
    };

    // Gunakan transaksi Prisma untuk update atomik
    const [updatedParent, updatedUser] = await prisma.$transaction([
      prisma.parent.update({
        where: { nid },
        data: updatedParentData,
      }),
      prisma.user.update({
        where: { nid },
        data: updatedUserData,
      }),
    ]);

    // Cek perubahan dan catat aktivitas
    const parentChanges = compareChanges(existingParent, updatedParentData);
    const userChanges = compareChanges(existingUser, updatedUserData);

    if (
      Object.keys(parentChanges).length > 0 ||
      Object.keys(userChanges).length > 0
    ) {
      req.body.activity = `Update Parent: ${
        existingParent.name
      }, Changes: ${JSON.stringify(parentChanges)}. Update User: ${
        existingUser.name
      }, Changes: ${JSON.stringify(userChanges)}.`;
      next();
    }

    res.status(200).json({
      msg: "Parent and User updated successfully",
      updatedParent,
      updatedUser,
    });
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
        res
          .status(500)
          .json({ msg: "Something went wrong", error: error.message });
    }
  }
};

exports.createStudentWithParent = async (req, res, next) => {
  const { studentData, parentData, userData } = req.body;

  try {
    let hashedPassword = null;

    // Hash password jika userData tersedia dan memiliki password
    if (userData && userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword; // Overwrite password dengan hashed password
    }

    // Jalankan transaksi
    await prisma.$transaction(
      [
        parentData ? prisma.parent.create({ data: parentData }) : null,
        userData ? prisma.user.create({ data: userData }) : null,
        prisma.student.create({ data: studentData }),
      ].filter(Boolean)
    ); // filter(Boolean) untuk menghapus null

    // Tambahkan aktivitas ke request body untuk proses logging
    req.body.activity = `Menambah data "Siswa": ${
      studentData.name
    } data: ${JSON.stringify(req.body)} `;
    next();

    res.status(200).json({ message: "Success! All data created." });
  } catch (error) {
    // Error handling dengan switch case
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
        res
          .status(500)
          .json({ msg: "Something went wrong", error: error.message });
    }
  }
};
