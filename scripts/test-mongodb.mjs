/**
 * scripts/test-mongodb.mjs
 *
 * Non-public development utility script to test MongoDB connection.
 *
 * Usage:
 *  node scripts/test-mongodb.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv(envLocalPath);
loadEnv(envPath);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "fpt_ico_summit";

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is missing.");
  console.error("Please create a .env.local file with MONGODB_URI=<your-connection-string>.");
  process.exit(1);
}

const { MongoClient } = await import("mongodb");

async function ping() {
  console.log(`Testing MongoDB connection to '${dbName}'...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    console.log(`Connected to database '${dbName}' successfully.`);
    console.log("MongoDB connection OK");
  } catch (err) {
    console.error("MongoDB connection test failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

ping();
