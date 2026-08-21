/**
 * scripts/create-admin.mjs
 *
 * Manual CLI script to create or reset an ADMIN user with a one-time temporary password.
 *
 * Usage:
 *  node scripts/create-admin.mjs --email admin@example.com --name "Summit Administrator"
 *  node scripts/create-admin.mjs --email admin@example.com --name "Summit Administrator" --reset
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;
const SALT_LEN = 16;

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
  console.error("ERROR: MONGODB_URI environment variable is missing in .env.local.");
  process.exit(1);
}

// Robust CLI argument parsing
const args = process.argv.slice(2);
let email = "";
let name = "";
let forceReset = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--reset" || arg === "--force") {
    forceReset = true;
  } else if (arg === "--email" && args[i + 1]) {
    email = args[i + 1].trim();
    i++;
  } else if (arg.startsWith("--email=")) {
    email = arg.slice(8).trim();
  } else if (arg === "--name" && args[i + 1]) {
    name = args[i + 1].trim();
    i++;
  } else if (arg.startsWith("--name=")) {
    name = arg.slice(7).trim();
  } else if (!email && arg.includes("@")) {
    email = arg.trim();
  } else if (!name && !arg.startsWith("--")) {
    name = arg.trim();
  }
}

if (!email || !name) {
  console.error("Usage: node scripts/create-admin.mjs --email <admin-email> --name <admin-name> [--reset]");
  process.exit(1);
}

const { MongoClient } = await import("mongodb");

async function hashPassword(password) {
  const salt = randomBytes(SALT_LEN);
  const derivedKey = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt$v1$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function generateTemporaryPassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

async function main() {
  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const emailNormalized = email.toLowerCase().trim();
    const existing = await db.collection("users").findOne({ emailNormalized });

    if (existing && !forceReset) {
      console.error(`ERROR: User with email '${email}' already exists (emailNormalized: '${emailNormalized}').`);
      console.error("If you want to reset this admin user's temporary password, add the --reset flag.");
      process.exit(1);
    }

    const tempPassword = generateTemporaryPassword(16);
    const passHash = await hashPassword(tempPassword);
    const now = new Date();

    if (existing && forceReset) {
      await db.collection("users").updateOne(
        { _id: existing._id },
        {
          $set: {
            email: email.trim(),
            emailNormalized,
            name: name.trim(),
            passwordHash: passHash,
            role: "ADMIN",
            status: "ACTIVE",
            mustChangePassword: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
            updatedAt: now,
          },
        }
      );
      console.log("\n==================================================");
      console.log("ADMIN ACCOUNT RESET SUCCESSFULLY");
      console.log("==================================================");
      console.log(`ID:                 ${existing._id}`);
      console.log(`Email:              ${email.trim()}`);
      console.log(`Email Normalized:   ${emailNormalized}`);
      console.log(`Role:               ADMIN`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log("==================================================");
    } else {
      const adminDoc = {
        email: email.trim(),
        emailNormalized,
        name: name.trim(),
        passwordHash: passHash,
        role: "ADMIN",
        status: "ACTIVE",
        mustChangePassword: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        passwordChangedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      const result = await db.collection("users").insertOne(adminDoc);
      console.log("\n==================================================");
      console.log("ADMIN ACCOUNT CREATED SUCCESSFULLY");
      console.log("==================================================");
      console.log(`ID:                 ${result.insertedId}`);
      console.log(`Email:              ${email.trim()}`);
      console.log(`Email Normalized:   ${emailNormalized}`);
      console.log(`Role:               ADMIN`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log("==================================================");
    }

    console.log("WARNING: This temporary password is displayed ONCE ONLY.");
    console.log("Copy and securely save it now. You will be required to change it on first login.\n");
  } catch (err) {
    console.error("Failed to create/reset admin account:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
