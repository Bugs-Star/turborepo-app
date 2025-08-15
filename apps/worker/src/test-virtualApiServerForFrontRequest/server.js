import express from "express";
import bodyParser from "body-parser";
import { queryClickHouse } from "./clickhouseClient.js";

const app = express();
app.use(bodyParser.json());
const PORT = process.env.FRONT_PORT || 4001;

// summaryStats 조회
app.get("/aggregations/summaryStats/:period", async (req, res) => {
  const { period } = req.params;

  if (!["weekly", "monthly"].includes(period)) {
    return res
      .status(400)
      .json({ error: "Invalid period, must be 'weekly' or 'monthly'" });
  }

  try {
    const query = `
      SELECT *
      FROM summary_stats_by_period
      WHERE period_type = '${period}'
      ORDER BY period_start, store_id
    `;
    const rows = await queryClickHouse(query);
    res.json(rows);
  } catch (err) {
    console.error("ClickHouse query failed:", err);
    res.status(500).json({ error: "ClickHouse query failed" });
  }
});

// 전체 summaryStats 조회
app.get("/aggregations/summaryStats", async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM summary_stats_by_period
      ORDER BY period_type, period_start, store_id
    `;
    const rows = await queryClickHouse(query);
    res.json(rows);
  } catch (err) {
    console.error("ClickHouse query failed:", err);
    res.status(500).json({ error: "ClickHouse query failed" });
  }
});

app.listen(PORT, () => {
  console.log(`[VirtualFront] Server running at http://localhost:${PORT}`);
});
