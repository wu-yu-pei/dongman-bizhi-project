import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "./app-error.js";

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          "VALIDATION_ERROR",
          "请求参数错误",
          400,
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
}
