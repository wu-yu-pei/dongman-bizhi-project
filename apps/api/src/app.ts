import cors from "cors";
import express, { type Express, type Router } from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/error-handler.js";
import { buildSuccessResponse } from "./shared/http-response.js";

type CreateAppOptions = {
  corsOrigin?: string;
  registerRoutes?: (router: Router) => void;
};

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const router = express.Router();
  const corsOrigin = options.corsOrigin ?? "*";

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "10mb" }));

  router.get("/health", (_req, res) => {
    res.json(
      buildSuccessResponse({
        status: "ok",
        service: "dongman-bizhi-api",
      }),
    );
  });

  options.registerRoutes?.(router);

  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
