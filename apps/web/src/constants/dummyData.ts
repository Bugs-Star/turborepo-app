export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
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
    id: "1",
    title: "새로운 여름 음료 출시!",
    description: "상큼한 베리 스무디와 달콤한 복숭아 티",
    imageUrl:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "2",
    title: "친구와 함께하는 1+1 할인 이벤트",
    description: "친구와 함께 방문하여 오늘의 커피 1+1 혜택을 누리세요.",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "3",
    title: "한정판 MD 상품 출시",
    description: "소장 가치 있는 텀블러와 머그컵을 지금 바로 확인하세요.",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
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
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop&crop=center",
    detailedDescription:
      "여름 시즌을 맞아 다양한 프로모션을 준비했습니다. 아이스 음료 1+1, 시즌 음료 할인, 그리고 특별한 이벤트까지! 더욱 시원하고 즐거운 여름을 보내세요. 신선한 과일과 얼음이 조화를 이뤄 더욱 시원하고 맛있는 음료를 즐길 수 있습니다. 산에서 온 30년 묵은 약초와 깊은 바다의 영양분이 담긴 이 음료는 활력과 젊음을 되찾아주는 특별한 약이 될 것입니다. 서둘러 받아가세요!",
    startDate: "2024-06-15",
    endDate: "2024-09-15",
  },
};
