// controllers/uid_controller.js
const { responseSuccessWithData } = require("../utils/response");
const Error = require("../utils/error");

const processUid = (uid, io, listUid) => {
  try {
    uid = uid.toLowerCase();

    if (listUid.includes(uid)) {
      return { status: true };
    } else {
      io.emit("rfidData", uid);
      return { status: false };
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error processing UID");
  }
};

exports.getUID = async (req, res, next) => {
  let listUid = ["a0e39325", "74230804"];
  try {
    let uid = req.body.uid || req.query.uid;
    if (!uid) {
      throw new Error.ValidationError("Bad Request");
    }
    const result = processUid(uid, req.io, listUid);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.renderForm = async (req, res, next) => {
  try {
    return res.render("form");
  } catch (error) {
    next(error);
  }
};
