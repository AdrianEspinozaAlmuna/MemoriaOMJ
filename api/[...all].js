const app = require("../Backend/prisma/src/index");

module.exports = (req, res) => app(req, res);
