import dotenv from "dotenv";
import { createApp } from "./app.js";
import { createDatabasePool } from "./config/database.js";
import { loadConfigFromEnv } from "./config/env.js";
import { createContentRouter } from "./modules/content/content-router.js";
import {
  createMysqlContentRepositories,
  type MysqlExecutor,
  type SqlValue,
} from "./modules/content/mysql-content-repositories.js";

dotenv.config();

const config = loadConfigFromEnv();
const databasePool = createDatabasePool(config.mysql);
const mysqlExecutor: MysqlExecutor = {
  async execute<T = unknown>(
    sql: string,
    params: SqlValue[] = [],
  ): Promise<[T, unknown]> {
    const [rows, fields] = await databasePool.execute(sql, params);
    return [rows as T, fields];
  },
};
const contentRepositories = createMysqlContentRepositories(mysqlExecutor);
const app = createApp({
  corsOrigin: config.api.corsOrigin,
  registerRoutes: (router) => {
    router.use(createContentRouter(contentRepositories));
  },
});

app.listen(config.api.port, () => {
  console.log(`dongman-bizhi-api listening on port ${config.api.port}`);
});
