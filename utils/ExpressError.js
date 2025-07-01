class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message); // Call the parent constructor
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
