const prisma = require("../auth/prisma");
const { localISO } = require("../utils/date-format");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("./whatsapp_controller");
const { toJid } = require("../utils/number-to-jid");
const { sendTextMessage } = require("./whatsapp.services");

const logDirectory = path.join(__dirname, "../..", "public");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
// Function for Classes controller
exports.getAttendances = async (req, res, next) => {
  try {
    const { rfid, name, class: kelas, method, status, parent } = req.query;

    const whereClause = {};

    if (parent) {
      whereClause.student = { parent_nid: parent };
    }

    if (rfid) {
      whereClause.student_rfid = { contains: rfid };
    }

    if (name) {
      whereClause.student_name = { contains: name };
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    if (method) {
      whereClause.method = parseInt(method);
    }

    if (status) {
      whereClause.status = parseInt(status);
    }

    const data = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: { student: { include: { class: true } } },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getAttendancestoday = async (req, res, next) => {
  try {
    const { rfid, class: kelas } = req.query;
    // Get the start and end of today in Unix timestamp format
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

    const whereClause = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    if (rfid) {
      whereClause.student_rfid = rfid;
    }

    const data = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: { student: { include: { class: true } } },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};

exports.getSubjectAttendances = async (req, res, next) => {
  try {
    const { name, class: kelas, subject, parent } = req.query;

    const whereClause = {};

    if (parent) {
      whereClause.student = { parent_nid: parent };
    }

    if (name) {
      whereClause.student = {
        name: {
          contains: name,
        },
      };
    }

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    if (subject) {
      const subjectArray = subject.split(",").map((k) => parseInt(k.trim()));
      whereClause.subject_id = { in: subjectArray };
    }

    const data = await prisma.subjectAttendance.findMany({
      where: whereClause,

      include: {
        subject: true,
        student: { include: { class: true } },
      },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
exports.getSubjectAttendancestoday = async (req, res, next) => {
  try {
    const { rfid, class: kelas } = req.query;
    // Get the start and end of today in Unix timestamp format
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

    const whereClause = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (kelas) {
      const kelasArray = kelas.split(",").map((k) => parseInt(k.trim()));
      whereClause.class_id = { in: kelasArray };
    }

    if (rfid) {
      whereClause.student_rfid = rfid;
    }

    const data = await prisma.subjectAttendance.findMany({
      where: whereClause,

      include: { subject: true, student: { include: { class: true } } },
    });

    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
exports.createAttendance = async (req, res, next) => {
  const { rfid } = req.body;
  const startTime = Date.now();
  const date = new Date();
  const dayName = date
    .toLocaleDateString("id-ID", { weekday: "long" })
    .toLowerCase();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  date.setHours(0, 0, 0, 0);
  const today = Math.floor(date.getTime() / 1000);
  const currentTime = `${hours}:${minutes}`;
  const unix_timestamp = Math.floor(Date.now() / 1000);

  const wa = await prisma.WaSession.findMany({
    where: {
      status: "active",
    },
    select: {
      name: true,
    },
  });

  try {
    const student = await getStudentByid(rfid);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const isChekin = await prisma.attendanceRecord.findMany({
      where: {
        student_rfid: student.rfid,
        date: {
          gte: today,
        },
        method: 1001,
      },
    });

    if (isChekin.length === 0) {
      const status = await getCheckInStatus(currentTime);
      const record = {
        student_rfid: student.rfid,
        class_id: student.class_id,
        date: unix_timestamp,
        method: 1001,
        status,
      };
      const result = await saveRecordAttendance(record);

      const subjects = await getCurrentSubjectTime(
        student.class_id,
        unix_timestamp,
        dayName
      );
      const currentSubject = subjects.length > 0 ? subjects[0] : null;
      if (currentSubject) {
        const subjectRecord = {
          student_rfid: student.rfid,
          class: student.class.id,
          date: unix_timestamp,
          subject_id: currentSubject.subject_id,
        };
        const result = await saveRecordSubjectAttendance(subjectRecord);
        const localDate = new Date(result.date * 1000).toLocaleString();
        const duration = Date.now() - startTime;
        const logMessage = `subject attendance recorded with ID ${result.id}|${result.student_rfid}|${localDate}|${result.subject_name}|${duration} ms\n`;

        const filePath = path.join(logDirectory, "subject_attendance_logs.txt");
        fs.appendFileSync(filePath, logMessage);
      }
      const localDate = new Date(result.date * 1000).toLocaleString();
      const duration = Date.now() - startTime;
      const logMessage = `Check-in recorded with ID ${result.id}|${result.student_rfid}|${localDate}|${duration} ms\n`;

      const filePath = path.join(logDirectory, "attendance_logs.txt");
      fs.appendFileSync(filePath, logMessage);
      if (wa.length > 0 && student.parent.phone_num != null) {
        const phone = toJid(student.parent.phone_num);
        req.body.phone = phone;
        req.body.name = student.name;
        req.body.method = "Check-in";
        req.body.status = status;
        await sendMessage(req, res, next);
      }
      return {
        status: 200,
        message: logMessage.trim(),
      };
    } else {
      const isCheckout = await prisma.attendanceRecord.findMany({
        where: {
          student_rfid: student.rfid,
          date: {
            gte: today,
          },
          method: 1002,
        },
      });

      if (isCheckout.length > 0) {
        return { status: 400, message: "Already checked out" };
      }

      if ((await getCheckOutStatus(currentTime, student.class)) === 200) {
        const status = await getCheckOutStatus(currentTime, student.class);
        const checkoutRecord = {
          student_rfid: student.rfid,
          class_id: student.class_id,
          date: unix_timestamp,
          method: 1002,
          status,
        };
        const result = await saveRecordAttendance(checkoutRecord);

        const localDate = new Date(result.date * 1000).toLocaleString();
        const duration = Date.now() - startTime;
        const logMessage = `Check-out recorded with ID ${result.id}|${result.student_rfid}|${localDate}|${duration} ms\n`;

        const filePath = path.join(logDirectory, "attendance_logs.txt");
        fs.appendFileSync(filePath, logMessage);
        if (wa.length > 0 && student.parent.phone_num != null) {
          const phone = toJid(student.parent.phone_num);
          req.body.phone = phone;
          req.body.name = student.name;
          req.body.method = "Check-out";
          req.body.status = status;
          await sendMessage(req, res, next);
        }
        return { status: 200, message: logMessage.trim() };
      }

      const subjects = await getCurrentSubjectTime(
        student.class_id,
        unix_timestamp,
        dayName
      );

      const currentSubject = subjects.length > 0 ? subjects[0] : null;
      if (currentSubject) {
        const subjectResults = await prisma.subjectAttendance.findMany({
          where: {
            student_rfid: student.rfid,
            date: {
              gte: today,
            },
            subject_id: currentSubject.subject_id,
          },
        });

        if (subjectResults.length === 0) {
          const subjectRecord = {
            student_rfid: student.rfid,
            class: student.class.id,
            date: unix_timestamp,
            subject_id: currentSubject.subject_id,
          };
          const result = await saveRecordSubjectAttendance(subjectRecord);
          const localDate = new Date(result.date * 1000).toLocaleString();
          const duration = Date.now() - startTime;
          const logMessage = `subject attendance recorded with ID ${result.id}|${result.student_rfid}|${localDate}|${result.subject_name}|${duration} ms\n`;

          const filePath = path.join(
            logDirectory,
            "subject_attendance_logs.txt"
          );
          fs.appendFileSync(filePath, logMessage);
          return {
            status: 200,
            message: logMessage.trim(),
          };
        }
        return {
          status: 400,
          message:
            "Subject attendance already recorded for today for this session.",
        };
      }
      return {
        status: 400,
        message: "No subjects for the current time session.",
      };
    }
  } catch (error) {
    next(error);
  }
};

const saveRecordAttendance = async (record) => {
  try {
    const data = await prisma.attendanceRecord.create({
      data: {
        student_rfid: record.student_rfid,
        class_id: record.class_id,
        date: record.date,
        method: record.method,
        status: record.status,
      },
    });
    return {
      id: data.id,
      student_rfid: data.student_rfid,
      date: data.date,
    };
  } catch (error) {
    console.error("Error inserting record:", error);
    throw error;
  }
};

const saveRecordSubjectAttendance = async (record) => {
  try {
    const data = await prisma.subjectAttendance.create({
      data: {
        student_rfid: record.student_rfid,
        class_id: record.class,
        date: record.date,
        subject_id: record.subject_id,
      },
      select: {
        id: true,
        student_rfid: true,
        date: true,
        subject_id: true,
        subject: true,
      },
    });
    return {
      id: data.id,
      student_rfid: data.student_rfid,
      date: data.date,
      subject_name: data.subject.name,
    };
  } catch (error) {
    console.error("Error inserting record:", error);
    throw error;
  }
};

const getStudentByid = async (rfid) => {
  try {
    const data = await prisma.student.findUnique({
      where: { rfid },
      include: { class: true, parent: true },
    });
    if (data == null) {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

const getCheckInStatus = async (timeCapt) => {
  try {
    const data = await prisma.timeThreshold.findFirst({
      where: { method: 1001 },
      select: { time: true },
    });

    if (!data) throw new Error("Time threshold not found");

    const timeParts = data.time
      .toISOString()
      .substr(11, 5)
      .split(":")
      .map(Number);
    const [setHours, setMinutes] = timeParts;

    const [hours, minutes] = timeCapt.split(":").map(Number);

    return hours < setHours || (hours === setHours && minutes <= setMinutes)
      ? 200
      : 201;
  } catch (error) {
    console.error("Error fetching time threshold:", error);
    return 201;
  }
};

const getCheckOutStatus = async (timeCapt, student_class) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    let data;
    if (dayOfWeek === 5) {
      data = { time: new Date("1970-01-01T11:15:00.000Z") };
    } else {
      data = await prisma.timeThreshold.findFirst({
        where: { class_id: student_class.id, method: 1002 },
        select: { time: true },
      });

      if (!data) throw new Error("Time setting not found for the given class.");
    }

    const timeParts = data.time
      .toISOString()
      .substr(11, 5)
      .split(":")
      .map(Number);

    const [minHours, minMinutes] = timeParts;
    const [hours, minutes] = timeCapt.split(":").map(Number);

    return hours > minHours || (hours === minHours && minutes >= minMinutes)
      ? 200
      : 201;
  } catch (error) {
    console.error("Error fetching time setting:", error);
    return 201;
  }
};

const getCurrentSubjectTime = async (classId, unix_timestamp, dayName) => {
  try {
    const time = localISO(unix_timestamp);
    const data = await prisma.classSchedule.findMany({
      where: {
        class_id: classId,
        start_time: { lte: time },
        end_time: { gte: time },
        day: dayName,
      },
      include: {
        subject: true,
      },
    });
    const result = data.map(({ subject }) => ({
      subject_id: subject.id,
      subject_category: subject.category_id,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.attendanceRecord.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSubjectAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.subjectAttendance.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting subject attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
