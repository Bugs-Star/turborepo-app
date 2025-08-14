export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  detailedDescription: string;
  startDate: string;
  endDate: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  detailedDescription: string;
  startDate: string;
  endDate: string;
}

export const dummyNews: NewsItem[] = [
  {
    id: "summer-drinks-launch",
    title: "새로운 여름 음료 출시!",
    description: "상큼한 베리 스무디와 달콤한 복숭아 티",
    imageUrl:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop&crop=center",
    detailedDescription:
      "여름 시즌을 맞아 새로운 음료들이 출시되었습니다! 상큼한 베리 스무디는 신선한 블루베리, 라즈베리, 딸기가 조화를 이뤄 더운 여름날 시원함을 선사합니다. 달콤한 복숭아 티는 진한 복숭아 향과 은은한 홍차의 맛이 어우러져 특별한 경험을 제공합니다. 지금 바로 방문하여 새로운 여름 음료를 만나보세요!",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
  },
  {
    id: "friend-1plus1-event",
    title: "친구와 함께하는 1+1 할인 이벤트",
    description: "친구와 함께 방문하여 오늘의 커피 1+1 혜택을 누리세요.",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&h=200&fit=crop&crop=center",
    detailedDescription:
      "친구와 함께라면 더욱 즐거운 커피 시간! 친구와 함께 방문하시면 오늘의 커피를 1+1으로 즐길 수 있습니다. 아메리카노, 라떼, 카푸치노 등 모든 커피 메뉴가 대상입니다. 친구와 함께 특별한 순간을 만들어보세요. 이벤트 기간 동안 매일 적용되니 언제든 방문하셔도 됩니다!",
    startDate: "2024-06-15",
    endDate: "2024-09-15",
  },
  {
    id: "limited-md-products",
    title: "한정판 MD 상품 출시",
    description: "소장 가치 있는 텀블러와 머그컵을 지금 바로 확인하세요.",
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop&crop=center",
    detailedDescription:
      "소장 가치가 있는 한정판 MD 상품들이 출시되었습니다! 특별히 디자인된 텀블러와 머그컵은 고급스러운 마감과 실용성을 모두 갖추고 있습니다. 각 상품은 한정 수량으로 제작되어 소장 가치가 높으며, 커피를 더욱 특별하게 만들어줍니다. 지금 바로 구매하여 특별한 커피 경험을 시작하세요!",
    startDate: "2024-06-01",
    endDate: "2024-12-31",
  },
];

export const promoBanners: Record<string, PromotionItem> = {
  seasonal: {
    id: "seasonal-drinks",
    title: "새로운 시즌 음료, 지금 만나보세요!",
    subtitle: "여름의 활력을 더해줄 상큼한 베리 블렌디드와 피치",
    buttonText: "자세히 보기",
    imageUrl:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop&crop=center",
    detailedDescription:
      "여름 시즌 한정으로 출시된 상큼한 베리 블렌디드와 달콤한 복숭아 티를 만나보세요. 신선한 과일과 얼음이 조화를 이뤄 더욱 시원하고 맛있는 음료를 즐길 수 있습니다. 산에서 온 30년 묵은 약초와 깊은 바다의 영양분이 담긴 이 음료는 활력과 젊음을 되찾아주는 특별한 약이 될 것입니다. 서둘러 받아가세요!",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
  },
  summer: {
    id: "summer-promotion",
    title: "썸머 프로모션! 혜택 가득한 여름",
    subtitle:
      "다양한 프로모션으로 더욱 시원하고 즐거운 여름을 보내세요. 지금 참여하세요!",
    buttonText: "자세히 보기",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center",
    detailedDescription:
      "여름 시즌을 맞아 다양한 프로모션을 준비했습니다. 아이스 음료 1+1, 시즌 음료 할인, 그리고 특별한 이벤트까지! 더욱 시원하고 즐거운 여름을 보내세요. 신선한 과일과 얼음이 조화를 이뤄 더욱 시원하고 맛있는 음료를 즐길 수 있습니다. 산에서 온 30년 묵은 약초와 깊은 바다의 영양분이 담긴 이 음료는 활력과 젊음을 되찾아주는 특별한 약이 될 것입니다. 서둘러 받아가세요!",
    startDate: "2024-06-15",
    endDate: "2024-09-15",
  },
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export const dummyCartItems: CartItem[] = [
  {
    id: "1",
    name: "아이스 카페 아메리카노",
    price: 4500,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "2",
    name: "카라멜 마키아또",
    price: 5900,
    quantity: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "3",
    name: "초코 크루아상",
    price: 3800,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center",
  },
];

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
}

export const dummyOrderHistory: OrderHistoryItem[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    orderDate: "2024-01-15",
    totalAmount: 20100,
    items: [
      {
        id: "1",
        name: "아이스 카페 아메리카노",
        price: 4500,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "2",
        name: "카라멜 마키아또",
        price: 5900,
        quantity: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "3",
        name: "초코 크루아상",
        price: 3800,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    orderDate: "2024-01-10",
    totalAmount: 8900,
    items: [
      {
        id: "4",
        name: "바닐라 라떼",
        price: 5200,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "5",
        name: "블루베리 머핀",
        price: 3700,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    orderDate: "2024-01-05",
    totalAmount: 15600,
    items: [
      {
        id: "6",
        name: "에스프레소",
        price: 3500,
        quantity: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "7",
        name: "티라미수",
        price: 8600,
        quantity: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop&crop=center",
      },
    ],
  },
];
