const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const { prisma } = require("./prisma/client");
const { initRealtimeServer } = require("./realtime");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);

app.get("/api/health", async (req, res) => {
  // prueba simple de conexión a la BD
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (e) {
    res.status(500).json({ status: "error", db: "disconnected", error: e.message });
  }
});

const PORT = process.env.PORT || 4000;

if (require.main === module && process.env.VERCEL !== "1") {
  const server = http.createServer(app);
  initRealtimeServer(server);
  server.listen(PORT, "localhost", () => console.log(`Backend iniciado en http://localhost:${PORT}`));
}

module.exports = app;