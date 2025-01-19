const prisma = require("../auth/prisma");

exports.getLogs = async (req, res, next) => {
  try {
    const data = await prisma.log.findMany();
    const sanitizedData = data.map((log) => ({
      ...log,
      id: log.id.toString(),
      date_time: new Date(log.date_time * 1000)
        .toLocaleString("en-GB", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(/,/g, ""),
    }));

    res.status(200).json({ data: sanitizedData });
  } catch (error) {
    next(error);
  }
};

exports.logger = async (req, res, next) => {
  const user = req.user === undefined ? req.body.username : req.user.username;
  const activity = req.body.activity;
  const source = req.headers["x-request-source"];
  try {
    await prisma.log.create({
      data: {
        user: user,
        activity: activity,
        date_time: Math.floor(Date.now() / 1000),
      },
    });

    if (req.loginresponse) {
      return res.status(200).json(req.loginresponse);
    }

    if (req.isReset) {
      return res
        .status(200)
        .json({ data: true, msg: "Password berhasil diubah." });
    }

    if (source === process.env.CLIENT_URL) {
      return res.status(200).json({ data: "logging successfully" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
