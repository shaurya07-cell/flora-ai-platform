const errorHandler = (err, req, res, next) => {
  // Determine HTTP status code
  const statusCode = err.status || err.statusCode || 500;

  // Determine machine-readable error code
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Determine human-readable message
  let message = err.message || 'An unexpected error occurred';

  // Determine error details
  const details = err.details || {};

  // Special handling for Multer errors
  if (err.name === 'MulterError') {
    errorCode = `MULTER_${err.code}`;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'The uploaded file exceeds the maximum permitted size of 10MB.';
      details.maxSize = 10485760; // 10MB in bytes
    }
  }

  // Log error details for server diagnostics
  console.error(`[Error] Code: ${errorCode}, Status: ${statusCode}, Message: ${message}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  // Send API contract response (do not expose internal stack trace to client)
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      details: details
    }
  });
};

export default errorHandler;
