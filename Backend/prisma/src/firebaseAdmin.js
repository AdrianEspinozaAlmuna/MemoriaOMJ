const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let initialized = false;
let serviceAccountProjectId = null;
let resolvedBucketName = null;

function stripWrappedQuotes(value) {
  const text = String(value || "").trim();
  if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
    return text.slice(1, -1);
  }

  return text;
}

function resolveServiceAccountPath(rawPath) {
  const normalizedPath = stripWrappedQuotes(rawPath);
  if (!normalizedPath) return null;

  const candidatePaths = [];
  if (path.isAbsolute(normalizedPath)) {
    candidatePaths.push(normalizedPath);
  } else {
    candidatePaths.push(path.resolve(process.cwd(), normalizedPath));

    const withoutLeadingDotSlash = normalizedPath.replace(/^\.\//, "");
    if (withoutLeadingDotSlash !== normalizedPath) {
      candidatePaths.push(path.resolve(process.cwd(), withoutLeadingDotSlash));
    }

    const withoutBackendPrefix = normalizedPath.replace(/^(\.\/)?Backend[\\/]/, "");
    if (withoutBackendPrefix !== normalizedPath) {
      candidatePaths.push(path.resolve(process.cwd(), withoutBackendPrefix));
    }

    candidatePaths.push(path.resolve(process.cwd(), path.basename(normalizedPath)));
  }

  const uniqueCandidatePaths = [...new Set(candidatePaths)];
  for (const candidatePath of uniqueCandidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return uniqueCandidatePaths[0] || null;
}

function initFirebaseAdmin() {
  if (initialized) return admin;

  let credential = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(stripWrappedQuotes(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
      serviceAccountProjectId = parsed.project_id || serviceAccountProjectId;
      credential = admin.credential.cert(parsed);
    } catch (err) {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON invalid JSON");
    }
  }

  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const rawPath = stripWrappedQuotes(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const resolvedPath = resolveServiceAccountPath(rawPath);
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

function normalizeMessagingResponse(response = {}) {
  if (Array.isArray(response?.responses)) {
    return {
      successCount: Number(response.successCount || 0),
      failureCount: Number(response.failureCount || 0),
      results: response.responses
    };
  }

  if (Array.isArray(response?.results)) {
    return {
      successCount: Number(response.successCount || 0),
      failureCount: Number(response.failureCount || 0),
      results: response.results
    };
  }

  return {
    successCount: Number(response.successCount || 0),
    failureCount: Number(response.failureCount || 0),
    results: []
  };
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
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data
    });
    return normalizeMessagingResponse(response);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  initFirebaseAdmin,
  resolveExistingStorageBucket,
  sendToTokens
};
