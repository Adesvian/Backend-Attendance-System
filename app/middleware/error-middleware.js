const { ValidationError, WhatsappError } = require("../utils/error");
const { responseErrorWithMessage } = require("../utils/response");

module.exports = function errorHandlerMiddleware(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json(responseErrorWithMessage(err.message));
  }
  if (err instanceof WhatsappError) {
    return res.status(err.code).json(responseErrorWithMessage(err.message));
  }
  return res.status(400).json(responseErrorWithMessage());
};
