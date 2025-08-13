import express from "express";
import bodyParser from "body-parser";
import { generateDummyEvents, generateDummyOrders } from "./dummyData.js";
import redis from "../redis/redisClient.js";

const app = express();
app.use(bodyParser.json());

// 🎯 더미 이벤트 큐에 넣기
app.post("/events/dummy", async (req, res) => {
  const count = req.body.count || 50;
  const events = generateDummyEvents(count);

  try {
    for (const e of events) {
      await redis.xadd(
        "event_stream",
        "*",
        "event_id",
        e.event_id,
        "user_id",
        e.user_id,
        "session_id",
        e.session_id,
        "store_id",
        e.store_id,
        "event_time",
        e.event_time.toISOString(),
        "metadata",
        JSON.stringify(e.metadata)
      );
    }

    res.json({ success: true, queued: events.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🎯 더미 주문 큐에 넣기
app.post("/orders/dummy", async (req, res) => {
  const count = req.body.count || 30;
  const orders = generateDummyOrders(count);

  try {
    for (const o of orders) {
      await redis.xadd(
        "event_stream",
        "*",
        "order_id",
        o.order_id,
        "user_id",
        o.user_id,
        "session_id",
        o.session_id,
        "store_id",
        o.store_id,
        "menu_id",
        o.menu_id,
        "quantity",
        o.quantity.toString(),
        "price_per_item",
        o.price_per_item.toString(),
        "total_price",
        o.total_price.toString(),
        "status",
        o.status,
        "ordered_at",
        o.ordered_at.toISOString(),
        "updated_at",
        o.updated_at.toISOString()
      );
    }

    res.json({ success: true, queued: orders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Dummy API server running on http://localhost:${PORT}`);
});
