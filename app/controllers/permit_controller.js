const prisma = require("../auth/prisma");
const { compareChanges } = require("../utils/compareChanges");

exports.getPermits = async (req, res, next) => {
  try {
    const { rfid, name, class: kelas, status, parent } = req.query;

    const whereClause = {};

    if (rfid) {
      whereClause.student_rfid = { contains: rfid };
    }

    if (parent) {
      whereClause.student = { parent_nid: parent };
    }

    if (name) {
      whereClause.name = name;
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    if (status) {
      whereClause.status = parseInt(status);
    }

    const data = await prisma.permit.findMany({
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

exports.getPermitstoday = async (req, res, next) => {
  try {
    // Get the start and end of today in Unix timestamp format
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

    const whereClause = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    const data = await prisma.permit.findMany({
      where: whereClause,
    });

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addPermit = async (req, res, next) => {
  try {
    const { rfid, class: student_class, reason, date, notes } = req.body;
    const file = req.file; // Mengambil file yang diupload
    const attachment = file.filename;

    if (!rfid || !student_class || !reason || !req.file) {
      return res
        .status(400)
        .json({ success: false, msg: "Bad Request: Missing required fields" });
    }
    const dateConverted = Math.floor(Number(date));

    const data = await prisma.permit.create({
      data: {
        student_rfid: rfid,
        class_id: parseInt(student_class),
        reason,
        attachment,
        date: parseInt(dateConverted),
        notes,
        status: 300,
      },
    });

    const student = await prisma.student.findUnique({
      where: { rfid: rfid },
    });

    req.body.activity = `Membuat pengajuan izin untuk: ${
      student.name
    }. Data: ${JSON.stringify(data)}`;
    next();

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.updateStatusPermit = async (req, res, next) => {
  try {
    const existingData = await prisma.permit.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const data = await prisma.permit.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: req.body,
    });

    const student = await prisma.student.findUnique({
      where: { rfid: data.student_rfid },
    });

    const changes = compareChanges(existingData, req.body);

    req.body.activity = `Update status izin untuk: ${
      student.name
    }. Data: ${JSON.stringify(changes)}`;
    next();

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
