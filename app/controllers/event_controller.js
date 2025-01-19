const prisma = require("../auth/prisma");
const { compareChanges } = require("../utils/compareChanges");

// Get all events
exports.getEvents = async (req, res, next) => {
  try {
    const events = await prisma.holidays.findMany();
    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await prisma.holidays.findUnique({
      where: { id: Number(id) },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ data: event });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  const { name, date } = req.body;

  try {
    const newEvent = await prisma.holidays.create({
      data: {
        name,
        date: new Date(date),
      },
    });

    req.body.activity = `Menambah data event: ${JSON.stringify({
      ...req.body,
      date: new Date(date).toISOString().substring(0, 10),
    })}`;
    next();

    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { name, date } = req.body;

  try {
    const existingData = await prisma.holidays.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    const updatedEvent = await prisma.holidays.update({
      where: { id: Number(id) },
      data: {
        name,
        date: new Date(date),
      },
    });

    const changes = compareChanges(existingData, req.body);

    if (Object.keys(changes).length !== 0) {
      req.body.activity = `Update data event: ${
        existingData.name
      }. Perubahan: ${JSON.stringify(changes)}.`;
      next();
    }

    res.status(200).json({ data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingData = await prisma.holidays.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingData) {
      return res.status(404).json({ msg: "Data not found" });
    }

    await prisma.holidays.delete({
      where: { id: Number(id) },
    });

    req.body.activity = `Menghapus data event: ${JSON.stringify({
      name: existingData.name,
      date: new Date(existingData.date).toISOString().substring(0, 10),
    })}`;
    next();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};
