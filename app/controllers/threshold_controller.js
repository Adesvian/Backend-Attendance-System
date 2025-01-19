const prisma = require("../auth/prisma");
const { compareChanges } = require("../utils/compareChanges");

exports.getThresholds = async (req, res, next) => {
  try {
    let { class: kelas, method, custom } = req.query;
    const source = req.headers["x-request-source"];

    const whereClause = {};

    if (custom !== undefined) {
      whereClause.custom_time = custom;
    } else {
      if (source === process.env.CLIENT_URL) {
        whereClause.OR = [
          { custom_time: null },
          { custom_time: { not: "isFriday" } },
        ];
      }
    }

    if (method) {
      whereClause.method = parseInt(method);
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    const data = await prisma.timeThreshold.findMany({
      where: whereClause,
    });
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

    const existingData = await prisma.timeThreshold.findFirst({
      where: { method: method },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
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
      res.status(400).json({ msg: "Invalid method for this action" });
    }

    const changes = compareChanges(existingData, req.body);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update waku : ${
        method === 1001 ? "check-in" : "check-out"
      }.
          Perubahan: ${JSON.stringify(changes)}.`;
      next();
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

    // Validation
    if (!time) {
      return res.status(400).json({ msg: "Time is required." });
    }

    // Convert input time to Date object
    const [hours, minutes] = time.split(":");
    const timeDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));

    // Default time configuration (13:00)
    const DEFAULT_HOURS = 13;
    const DEFAULT_MINUTES = 0;

    // Get existing records
    const existingRecords = await prisma.timeThreshold.findMany({
      where: {
        class_id: Number(classId),
        method: 1002,
        OR: [
          {
            custom_time: {
              not: "isFriday",
            },
          },
          {
            custom_time: null,
          },
        ],
      },
    });

    let customTimeCondition;
    const newTimeInMinutes =
      timeDate.getUTCHours() * 60 + timeDate.getUTCMinutes();
    const defaultTimeInMinutes = DEFAULT_HOURS * 60 + DEFAULT_MINUTES;

    // Determine customTimeCondition based on conditions
    if (defaultTime === true) {
      // Case: Resetting to default time
      customTimeCondition = null;
    } else {
      // Case: Setting custom time
      if (newTimeInMinutes !== defaultTimeInMinutes) {
        customTimeCondition = "iscustom";
      } else {
        customTimeCondition = null;
      }
    }

    // Update the records
    const data = await prisma.timeThreshold.updateMany({
      where: {
        class_id: parseInt(classId, 10),
        method: 1002,
        OR: [
          {
            custom_time: {
              not: "isFriday",
            },
          },
          {
            custom_time: null,
          },
        ],
      },
      data: {
        time: timeDate,
        custom_time: customTimeCondition,
      },
    });

    // Track changes for activity log
    let changes = {};
    for (const record of existingRecords) {
      const existingTimeInMinutes =
        record.time.getUTCHours() * 60 + record.time.getUTCMinutes();

      if (existingTimeInMinutes !== newTimeInMinutes) {
        changes = {
          time: {
            from: `${String(record.time.getUTCHours()).padStart(
              2,
              "0"
            )}:${String(record.time.getUTCMinutes()).padStart(2, "0")}`,
            to: `${String(timeDate.getUTCHours()).padStart(2, "0")}:${String(
              timeDate.getUTCMinutes()
            ).padStart(2, "0")}`,
          },
        };
        break; // We only need one change record
      }
    }

    // Add activity log if there are changes
    if (Object.keys(changes).length !== 0) {
      req.body.activity = `${
        defaultTime
          ? "Menghapus waktu check out untuk Kelas"
          : "Setting waktu check out untuk Kelas"
      } ${classId}.
      Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

    res.status(200).json({
      data,
      message: defaultTime
        ? "Berhasil menghapus waktu check out"
        : "Berhasil mengatur waktu check out",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
