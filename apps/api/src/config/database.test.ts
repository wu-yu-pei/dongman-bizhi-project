import { describe, expect, it } from "vitest";
import { buildMysqlPoolOptions } from "./database.js";

describe("buildMysqlPoolOptions", () => {
  it("converts app MySQL config to mysql2 pool options", () => {
    expect(
      buildMysqlPoolOptions({
        host: "db.local",
        port: 3307,
        database: "dongman_bizhi_test",
        user: "tester",
        password: "secret",
      }),
    ).toMatchObject({
      host: "db.local",
      port: 3307,
      database: "dongman_bizhi_test",
      user: "tester",
      password: "secret",
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  });
});
