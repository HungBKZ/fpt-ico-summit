import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

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
const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "fpt_ico_summit";

const args = process.argv.slice(2);
let email = "";
let password = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--email" && args[i + 1]) email = args[i + 1];
  if (args[i] === "--password" && args[i + 1]) password = args[i + 1];
}

if (!email || !password) {
  console.log("Usage: node scripts/diagnose-auth.mjs --email <email> --password <password>");
  process.exit(1);
}

async function verifyPassword(inputPassword, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4) return false;
  const [, version, saltHex, derivedKeyHex] = parts;
  if (version !== "v1" || !saltHex || !derivedKeyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(derivedKeyHex, "hex");
  try {
    const derivedKey = (await scryptAsync(inputPassword, salt, 64));
    if (derivedKey.length !== storedKey.length) return false;
    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

async function diagnose() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const emailNormalized = email.trim().toLowerCase();

    const user = await db.collection("users").findOne({ emailNormalized });

    const userFound = !!user;
    let hashFormatValid = false;
    let passwordVerify = false;

    if (userFound && user.passwordHash) {
      const parts = user.passwordHash.split("$");
      hashFormatValid =
        user.passwordHash.startsWith("scrypt$") &&
        parts.length === 4 &&
        parts[1] === "v1" &&
        parts[2].length > 0 &&
        parts[3].length > 0;

      passwordVerify = await verifyPassword(password, user.passwordHash);
    }

    console.log(`USER_FOUND=${userFound}`);
    console.log(`HASH_FORMAT_VALID=${hashFormatValid}`);
    console.log(`PASSWORD_VERIFY=${passwordVerify}`);
  } catch (err) {
    console.log("ERROR=", err.message);
  } finally {
    await client.close();
  }
}

diagnose();
