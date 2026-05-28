const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;
let serviceAccountProjectId = null;
let resolvedBucketName = null;

function initFirebaseAdmin() {
  if (initialized) return admin;

  let credential = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      serviceAccountProjectId = parsed.project_id || serviceAccountProjectId;
      credential = admin.credential.cert(parsed);
    } catch (err) {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON invalid JSON");
    }
  }

  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const rawPath = String(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "").trim();
      const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(`FIREBASE_SERVICE_ACCOUNT_PATH no existe: ${resolvedPath}`);
      } else {
        const fileContent = fs.readFileSync(resolvedPath, "utf8");
        const parsed = JSON.parse(fileContent);
        serviceAccountProjectId = parsed.project_id || serviceAccountProjectId;
        credential = admin.credential.cert(parsed);
      }
    } catch (err) {
      console.error("No se pudo leer FIREBASE_SERVICE_ACCOUNT_PATH:", err.message || err);
    }
  }

  if (!credential) {
    console.warn("Firebase Admin no inicializado: no se encontró credencial. Define FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH.");
    return admin;
  }

  const initOptions = { credential };
  if (process.env.FIREBASE_PROJECT_ID) initOptions.projectId = String(process.env.FIREBASE_PROJECT_ID).trim();
  if (process.env.FIREBASE_STORAGE_BUCKET) initOptions.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  admin.initializeApp(initOptions);
  initialized = true;
  console.log("Firebase Admin inicializado correctamente.", process.env.FIREBASE_STORAGE_BUCKET ? `Bucket=${process.env.FIREBASE_STORAGE_BUCKET}` : "");
  return admin;
}

async function resolveExistingStorageBucket() {
  initFirebaseAdmin();
  if (!admin.apps || admin.apps.length === 0) return null;
  if (resolvedBucketName) return resolvedBucketName;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    serviceAccountProjectId ||
    admin.app().options.projectId ||
    null;

  const candidates = [];
  if (process.env.FIREBASE_STORAGE_BUCKET) candidates.push(String(process.env.FIREBASE_STORAGE_BUCKET).trim());
  if (projectId) {
    candidates.push(`${projectId}.appspot.com`);
    candidates.push(`${projectId}.firebasestorage.app`);
  }

  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  for (const candidate of uniqueCandidates) {
    try {
      const [exists] = await admin.storage().bucket(candidate).exists();
      if (exists) {
        resolvedBucketName = candidate;
        if (process.env.FIREBASE_STORAGE_BUCKET && process.env.FIREBASE_STORAGE_BUCKET !== candidate) {
          console.warn(`FIREBASE_STORAGE_BUCKET no coincide con bucket real. Usando: ${candidate}`);
        }
        return candidate;
      }
    } catch (err) {
      // continuar con el siguiente candidato
    }
  }

  return null;
}

function buildMessagePayload(notification = {}, data = {}) {
  const payload = {
    notification: {
      title: notification.title || notification.titulo || "",
      body: notification.body || notification.descripcion || ""
    },
    data: Object.keys(data).reduce((acc, k) => ({ ...acc, [k]: String(data[k]) }), {})
  };
  return payload;
}

async function sendToTokens(tokens = [], notification = {}) {
  initFirebaseAdmin();
  if (!admin.apps || admin.apps.length === 0) {
    throw new Error("Firebase Admin no inicializado");
  }
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, results: [] };
  }
  const payload = buildMessagePayload(notification, notification.data || {});
  try {
    const response = await admin.messaging().sendToDevice(tokens, payload);
    return response;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  initFirebaseAdmin,
  resolveExistingStorageBucket,
  sendToTokens
};
