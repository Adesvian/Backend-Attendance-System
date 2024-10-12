const prisma = require("../auth/prisma");

// Function for Subject controller
exports.getSubjects = async (req, res, next) => {
  try {
    const data = await prisma.subject.findMany({
      include: { category: true },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getSubjectById = async (req, res, next) => {
  try {
    const data = await prisma.subject.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: { category: true },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.addSubjects = async (req, res, next) => {
  try {
    const data = await prisma.subject.create({
      data: {
        name: req.body.name,
        category_id: req.body.category_id,
      },
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

exports.updateSubjects = async (req, res, next) => {
  try {
    const data = await prisma.subject.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        name: req.body.name,
        category_id: req.body.category_id,
      },
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

exports.deleteSubjects = async (req, res, next) => {
  try {
    const data = await prisma.subject.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
