import { faker } from "@faker-js/faker";

/**
 * 더미 이벤트 생성
 */
export function generateDummyEvents(count = 50) {
  const pages = ["home", "menu", "cart", "checkout", "profile"];
  const stores = ["store123", "store456", "store789"];

  const events = [];
  for (let i = 0; i < count; i++) {
    events.push({
      event_id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      session_id: faker.string.uuid(),
      store_id: stores[Math.floor(Math.random() * stores.length)],
      event_time: faker.date.recent({ days: 30 }), // 최근 30일
      metadata: { page: pages[Math.floor(Math.random() * pages.length)] },
    });
  }
  return events;
}

/**
 * 더미 주문 생성
 */
export function generateDummyOrders(count = 30) {
  const menuItems = ["Americano", "Latte", "Espresso", "Mocha", "Cappuccino"];
  const stores = ["store123", "store456", "store789"];

  const orders = [];
  for (let i = 0; i < count; i++) {
    const quantity = faker.number.int({ min: 1, max: 5 });
    const price_per_item = faker.number.int({ min: 1000, max: 5000 });

    orders.push({
      order_id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      session_id: faker.string.uuid(),
      store_id: stores[Math.floor(Math.random() * stores.length)],
      menu_id: menuItems[Math.floor(Math.random() * menuItems.length)],
      quantity,
      price_per_item,
      total_price: quantity * price_per_item,
      status: "paid",
      ordered_at: faker.date.recent({ days: 30 }),
      updated_at: faker.date.recent({ days: 30 }),
    });
  }

  return orders;
}
