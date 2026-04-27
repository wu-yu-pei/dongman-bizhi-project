import dotenv from "dotenv";
import { createApp } from "./app.js";
import { loadConfigFromEnv } from "./config/env.js";

dotenv.config();

const config = loadConfigFromEnv();
const app = createApp({ corsOrigin: config.api.corsOrigin });

app.listen(config.api.port, () => {
  console.log(`dongman-bizhi-api listening on port ${config.api.port}`);
});
