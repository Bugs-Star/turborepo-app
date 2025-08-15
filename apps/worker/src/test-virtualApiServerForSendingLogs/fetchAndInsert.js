// 이벤트 더미 전송
async function sendDummyEvents(count = 50) {
  try {
    const res = await fetch("http://localhost:4000/events/dummy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });

    const data = await res.json();
    console.log("Events queued:", data);
  } catch (err) {
    console.error("Error sending events:", err);
  }
}

// 주문 더미 전송
async function sendDummyOrders(count = 30) {
  try {
    const res = await fetch("http://localhost:4000/orders/dummy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });

    const data = await res.json();
    console.log("Orders queued:", data);
  } catch (err) {
    console.error("Error sending orders:", err);
  }
}

// 🔹 실행
(async () => {
  await sendDummyEvents(50);
  await sendDummyOrders(30);
})();
