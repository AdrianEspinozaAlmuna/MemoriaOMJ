const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const { prisma } = require("./prisma/client");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

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
app.listen(PORT, "localhost", () => console.log(`Backend iniciado en http://localhost:${PORT}`));