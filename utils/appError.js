class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // calls the parent function, and sets this.message = message, which this child class will of course inherit.
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4')
      ? 'Client Error!'
      : 'Internal Server Error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); // persists the function where the error occured in the Error stack trace. (not 100% sure)
  }
}

module.exports = AppError;
