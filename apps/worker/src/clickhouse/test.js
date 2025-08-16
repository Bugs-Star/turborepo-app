import { createClient } from "@clickhouse/client";

const client = createClient({
  url: "http://default:1234@localhost:8123", // HTTP URL 형식
  debug: true,
});

async function test() {
  try {
    const res = await client.query({ query: "SELECT 1", format: "JSON" });
    console.log(JSON.parse(await res.text()));
  } catch (err) {
    console.error("ClickHouse connection error:", err);
  }
}

test();
