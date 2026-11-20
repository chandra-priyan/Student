function notFound(req, res) {
  res.status(404).json({ message: 'The requested resource was not found.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that identifier already exists.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'The submitted data is invalid.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
}

module.exports = { notFound, errorHandler };
