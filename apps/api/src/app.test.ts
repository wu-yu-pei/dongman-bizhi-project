import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createApp } from "./app.js";
import { AppError } from "./shared/app-error.js";
import { buildSuccessResponse } from "./shared/http-response.js";
import { validateBody } from "./shared/validate-request.js";

describe("Express app foundation", () => {
  it("returns health status in the shared success envelope", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
        service: "dongman-bizhi-api",
      },
    });
  });

  it("uses the configured CORS origin", async () => {
    const response = await request(
      createApp({ corsOrigin: "http://localhost:5173" }),
    )
      .get("/health")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("returns a normalized not found error for unknown routes", async () => {
    const response = await request(createApp()).get("/missing").expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "接口不存在",
      },
    });
  });

  it("returns a normalized validation error for invalid request bodies", async () => {
    const app = createApp({
      registerRoutes: (router) => {
        router.post(
          "/__test/categories",
          validateBody(
            z.object({
              name: z.string().min(1, "分类名称不能为空"),
            }),
          ),
          (_req, res) => {
            res.json(buildSuccessResponse({ ok: true }));
          },
        );
      },
    });

    const response = await request(app)
      .post("/__test/categories")
      .send({ name: "" })
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "请求参数错误",
        details: [
          {
            path: "name",
            message: "分类名称不能为空",
          },
        ],
      },
    });
  });

  it("maps known application errors to their configured status code", async () => {
    const app = createApp({
      registerRoutes: (router) => {
        router.get("/__test/app-error", () => {
          throw new AppError("TEST_ERROR", "测试错误", 418);
        });
      },
    });

    const response = await request(app).get("/__test/app-error").expect(418);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "TEST_ERROR",
        message: "测试错误",
      },
    });
  });

  it("hides unexpected error details behind a generic error response", async () => {
    const app = createApp({
      registerRoutes: (router) => {
        router.get("/__test/unexpected-error", () => {
          throw new Error("database password leaked");
        });
      },
    });

    const response = await request(app)
      .get("/__test/unexpected-error")
      .expect(500);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误",
      },
    });
  });
});
