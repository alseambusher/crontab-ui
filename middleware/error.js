'use strict';

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const data = { message: err.message || 'Internal Server Error' };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    data.stack = err.stack;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(data);
}

module.exports = errorHandler;
