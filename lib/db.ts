// /lib/db.ts
import { MongoClient, Db, ObjectId } from "mongodb";

const uri: string = process.env.MONGODB_URI!;  // ✅ assert defined
const dbName = process.env.MONGODB_DB || "vaultDB";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("❌ MONGODB_URI is not defined in .env.local");

  if (db) return db;

  if (!client) {
    client = new MongoClient(uri); // ✅ no TS error anymore
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

export { ObjectId };
