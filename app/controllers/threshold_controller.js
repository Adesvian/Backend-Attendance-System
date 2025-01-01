const prisma = require("../auth/prisma");

exports.getThresholds = async (req, res, next) => {
  try {
    const data = await prisma.timeThreshold.findMany();
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.setTimeThreshold = async (req, res, next, method) => {
  try {
    const classIds = [1, 2, 3, 4, 5, 6];

    if (req.body.time) {
      const [hours, minutes] = req.body.time.split(":");
      const timeDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
      req.body.time = timeDate;

      if (method === 1001) {
        // Check-in time logic
        if (timeDate > new Date(Date.UTC(1970, 0, 1, 7, 30, 0))) {
          req.body.custom_time = "iscustom";
        } else {
          req.body.custom_time = null;
        }
      } else if (method === 1002) {
        if (timeDate > new Date(Date.UTC(1970, 0, 1, 13, 0, 0))) {
          req.body.custom_time = "iscustom";
        }
      }
    }

    if (method === 1001) {
      const data = await prisma.timeThreshold.updateMany({
        where: {
          class_id: { in: classIds },
          method: method,
        },
        data: req.body,
      });

      res.status(200).json({ data });
    } else if (method === 1002) {
      const data = await prisma.timeThreshold.updateMany({
        where: {
          class_id: { in: classIds },
          method: method,
          custom_time: null,
        },
        data: req.body,
      });

      res.status(200).json({ data });
    } else {
      // If method is neither 1001 nor 1002, return an error
      res.status(400).json({ msg: "Invalid method for this action" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
// Wrapper for check-in
exports.setCheckInTime = (req, res, next) => {
  return exports.setTimeThreshold(req, res, next, 1001);
};

// Wrapper for check-out
exports.setCheckOutTime = (req, res, next) => {
  return exports.setTimeThreshold(req, res, next, 1002);
};

exports.setCheckOutTimeByClass = async (req, res, next) => {
  try {
    const classId = req.params.class;
    const { time, defaultTime } = req.body;

    if (!time) {
      return res.status(400).json({ msg: "Time is required." });
    }

    const [hours, minutes] = time.split(":");
    const timeDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));

    const existingRecords = await prisma.timeThreshold.findMany({
      where: {
        class_id: parseInt(classId, 10),
        method: 1002,
        NOT: {
          custom_time: "isFriday",
        },
      },
      select: {
        custom_time: true,
      },
    });

    const hasCustomTime = existingRecords.some(
      (record) => record.custom_time === "iscustom"
    );

    const customTimeCondition = defaultTime
      ? null
      : hasCustomTime
      ? "iscustom"
      : "iscustom";

    const data = await prisma.timeThreshold.updateMany({
      where: {
        class_id: parseInt(classId, 10),
        method: 1002,
        custom_time: defaultTime ? "iscustom" : null,
      },
      data: {
        time: timeDate,
        custom_time: customTimeCondition,
      },
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
