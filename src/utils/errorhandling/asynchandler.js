export const asynchandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (Object.keys(error).length === 0 || !error.message) {
        return next(new Error("Internal Server Error", { cause: 500 }));
      }
      next(error);
    });
  };
};

export const globalerrorhandling = (error, req, res, next) => {
  const status =
    error.cause && Number.isInteger(error.cause) ? error.cause : 500;

  return res.status(status).json({
    success: false,
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export const notfoundhandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};
