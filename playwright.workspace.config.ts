import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./tests/workspace",
  timeout: 60000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      cwd: path.resolve("../accordbridge-backend"),
      command:
        "node --env-file=.env.test dist/src/migrate.js && node --env-file=.env.test dist/src/main.js",
      env: { PORT: "4100", FRONTEND_ORIGIN: "http://127.0.0.1:3100" },
      url: "http://127.0.0.1:4100/api/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --port 3100",
      env: { BACKEND_URL: "http://127.0.0.1:4100" },
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
    },
  ],
});
