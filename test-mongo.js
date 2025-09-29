import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI || "mongodb+srv://bugsstar:bugsstar@cluster0.nmjlztu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB 연결 성공");
    const db = client.db("admin");
    const result = await db.command({ ping: 1 });
    console.log("Ping 결과:", result);
  } catch (err) {
    console.error("❌ 연결 실패:", err);
  } finally {
    await client.close();
  }
}

run();