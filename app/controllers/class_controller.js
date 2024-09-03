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
