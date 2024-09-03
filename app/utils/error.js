class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  code;
}

class WhatsappError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  code;
}

module.exports = {
  ValidationError,
  WhatsappError,
};
