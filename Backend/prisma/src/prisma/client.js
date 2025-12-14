const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = { prisma };
// símbolo exportado: `prismaClient` -> usa [`prisma`](backend/src/prisma/client.js)