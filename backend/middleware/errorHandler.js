// Express identifies error-handling middleware by arity: all four parameters
// must be declared even if next is never called.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }

  const statusCode = err.statusCode || 500;
  // Only forward the message to the client when it was explicitly set by app
  // code (i.e. a thrown HttpError). Unexpected errors get a generic message so
  // internals are never leaked to the caller.
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
