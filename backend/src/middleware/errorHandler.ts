import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Neon / PostgreSQL connection errors
  const msg = err.message || "";
  if (
    msg.includes("password authentication failed") ||
    msg.includes("NeonDbError") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("connection refused")
  ) {
    console.error("[DB Error]", msg);
    res.status(503).json({
      success: false,
      message: "Database is not configured. Please check your DATABASE_URL in .env",
    });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
  });
};
