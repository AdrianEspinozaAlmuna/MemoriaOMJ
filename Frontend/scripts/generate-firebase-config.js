const fs = require("fs");
const path = require("path");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex < 0) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

const cwd = process.cwd();
const envFiles = [path.join(cwd, ".env.local"), path.join(cwd, ".env")];
const env = {};

for (const filePath of envFiles) {
  Object.assign(env, readEnvFile(filePath));
}

for (const key of Object.keys(process.env)) {
  if (process.env[key] !== undefined) {
    env[key] = process.env[key];
  }
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const outputPath = path.join(cwd, "public", "firebase-config.js");
const output = `self.__FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig, null, 2)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Firebase config generado en ${outputPath}`);