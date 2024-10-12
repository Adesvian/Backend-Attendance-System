const prisma = require("../auth/prisma");

exports.createEvent = async (req, res, next) => {
  const { name, date } = req.body;

  try {
    const newEvent = await prisma.holidays.create({
      data: {
        name,
        date: new Date(date),
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};

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

exports.updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { name, date } = req.body;

  try {
    const updatedEvent = await prisma.holidays.update({
      where: { id: Number(id) },
      data: {
        name,
        date: new Date(date),
      },
    });

    res.status(200).json({ data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.holidays.delete({
      where: { id: Number(id) },
    });

    res.status(204).json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};
