import { createClient } from "@clickhouse/client";

export const ch = createClient({
  host: process.env.CLICKHOUSE_HOST!,
  database: process.env.CLICKHOUSE_DATABASE,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
});
