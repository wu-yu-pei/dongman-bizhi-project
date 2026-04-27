import { describe, expect, it } from "vitest";
import {
  buildErrorResponse,
  buildPaginatedResponse,
  buildSuccessResponse,
} from "./http-response.js";

describe("API response contract", () => {
  it("wraps successful payloads in a stable success envelope", () => {
    expect(buildSuccessResponse({ id: 1, title: "精选壁纸" })).toEqual({
      success: true,
      data: { id: 1, title: "精选壁纸" },
    });
  });

  it("wraps paginated payloads with normalized pagination metadata", () => {
    expect(
      buildPaginatedResponse([{ id: 1 }], {
        page: 1,
        pageSize: 20,
        total: 45,
      }),
    ).toEqual({
      success: true,
      data: [{ id: 1 }],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 45,
        totalPages: 3,
      },
    });
  });

  it("wraps errors with a code, message, and optional details", () => {
    expect(
      buildErrorResponse("VALIDATION_ERROR", "分类名称不能为空", {
        field: "name",
      }),
    ).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "分类名称不能为空",
        details: { field: "name" },
      },
    });
  });
});
