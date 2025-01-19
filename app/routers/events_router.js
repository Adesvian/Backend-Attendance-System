const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event_controller");
const { logger } = require("../controllers/log_controller");

const events = express.Router();

events.get("/events", getEvents);
events.get("/events/:id", getEventById);

events.post("/events", createEvent, logger);
events.put("/events/:id", updateEvent, logger);
events.delete("/events/:id", deleteEvent, logger);

module.exports = events;
