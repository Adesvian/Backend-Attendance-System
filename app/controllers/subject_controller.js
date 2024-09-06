const prisma = require("../auth/prisma");

// Function for Subject controller
exports.getSubjects = async (req, res, next) => {
  try {
    const data = await prisma.subject.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
