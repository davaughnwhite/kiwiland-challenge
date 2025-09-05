import express from "express";
import { router } from "./routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
  return app;
}

// Allow `tsx src/server.ts --demo` to quickly show outputs without HTTP clients
if (process.argv.includes("--demo")) {
  (async () => {
    const app = createApp();
    const port = 3000;
    const server = app.listen(port, async () => {
      console.log(`Demo server listening on http://localhost:${port}/api`);
      console.log("Try curl commands from README to see expected outputs.");
    });
    // Stop with Ctrl+C in the terminal.
  })();
}

