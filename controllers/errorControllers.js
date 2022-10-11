module.exports = (error, req, res, next) => {
  // console.log(error.stack); // logs the error stack trace
  const statusCode = error.statusCode || 500;
  const status = error.status || 'Internal server error';
  return res.status(statusCode).json({
    status: status,
    message: error.message,
  });
};
