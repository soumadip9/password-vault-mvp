const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://prasantag179:20252026Piku@cluster0.yxfiyg6.mongodb.net/vault?retryWrites=true&w=majority&tls=true&appName=Cluster0";

async function test() {
  const client = new MongoClient(uri);
  try {
    console.log("⏳ Connecting...");
    await client.connect();
    console.log("✅ Connected successfully to MongoDB!");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

test();
