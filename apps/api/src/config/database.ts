import mysql, { type PoolOptions } from "mysql2/promise";
import type { AppConfig } from "./env.js";

type MysqlConfig = AppConfig["mysql"];

export function buildMysqlPoolOptions(mysqlConfig: MysqlConfig): PoolOptions {
  return {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  };
}

export function createDatabasePool(mysqlConfig: MysqlConfig) {
  return mysql.createPool(buildMysqlPoolOptions(mysqlConfig));
}
