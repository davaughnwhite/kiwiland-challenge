import { createApp } from "./server.js";

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();
app.listen(PORT, () => {
  console.log(`Kiwiland API listening on http://localhost:${PORT}/api`);
});
