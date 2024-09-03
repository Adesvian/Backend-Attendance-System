const prisma = require("../auth/prisma");

exports.getPermits = async (req, res, next) => {
  try {
    const data = await prisma.permit.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addPermit = async (req, res, next) => {
  try {
    const { name, class: student_class, reason, date, notes } = req.body;
    const file = req.file; // Mengambil file yang diupload
    const attachment = file.filename;

    if (!name || !student_class || !reason || !req.file) {
      return res
        .status(400)
        .json({ success: false, msg: "Bad Request: Missing required fields" });
    }
    const dateConverted = Math.floor(Number(date));

    const data = await prisma.permit.create({
      data: {
        name,
        class: student_class,
        reason,
        attachment,
        date: dateConverted,
        notes,
        status: "Pending",
      },
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Something went wrong" });
  }
};

exports.acceptPermit = async (req, res, next) => {
  try {
    const data = await prisma.permit.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.rejectPermit = async (req, res, next) => {
  try {
    const data = await prisma.permit.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};
