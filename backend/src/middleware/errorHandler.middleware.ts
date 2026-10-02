import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  console.error(`[Error] [${req.method} ${req.url}]:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    code,
    errors: err.errors || []
  });
}
