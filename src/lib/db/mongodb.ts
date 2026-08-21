/**
 * src/lib/db/mongodb.ts
 *
 * Server-only lazy MongoDB connection layer using official mongodb Node.js driver.
 *
 * Requirements:
 *  - Single reusable MongoClient / connection promise.
 *  - Connection creation is lazy (importing module does NOT connect).
 *  - Importing module does NOT break `next build` if unused.
 *  - Validates MONGODB_URI when a DB operation is actually attempted.
 *  - Does NOT expose credentials or client to browser components.
 */

import { MongoClient, Db } from "mongodb";

const DEFAULT_DB_NAME = "fpt_ico_summit";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Lazy helper to retrieve or initialize the shared MongoClient promise.
 * Ensures connection is only created upon explicit invocation.
 */
export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please set MONGODB_URI in your .env.local file."
    );
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable to preserve the MongoClient promise
    // across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, create a standard singleton promise.
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }
}

/**
 * Lazy helper to retrieve the MongoDB database instance.
 * Accepts optional custom database name, defaulting to process.env.MONGODB_DB_NAME or "fpt_ico_summit".
 */
export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  const name = dbName || process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;
  return client.db(name);
}
