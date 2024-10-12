const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event_controller");

const events = express.Router();

events.post("/events", createEvent);
events.get("/events", getEvents);
events.get("/events/:id", getEventById);
events.put("/events/:id", updateEvent);
events.delete("/events/:id", deleteEvent);

module.exports = events;
