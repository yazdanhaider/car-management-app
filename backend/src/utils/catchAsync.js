const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Caught Async Error:', {
        endpoint: `${req.method} ${req.originalUrl}`,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        body: req.body,
        params: req.params,
        query: req.query
      });
      next(error);
    });
  };
};

module.exports = catchAsync; 