const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../Backend/.env") });

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
