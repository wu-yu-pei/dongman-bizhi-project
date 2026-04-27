import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "./app-error.js";
import { buildErrorResponse } from "./http-response.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError("NOT_FOUND", "接口不存在", 404));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(buildErrorResponse(err.code, err.message, err.details));
    return;
  }

  res
    .status(500)
    .json(buildErrorResponse("INTERNAL_SERVER_ERROR", "服务器内部错误"));
};
