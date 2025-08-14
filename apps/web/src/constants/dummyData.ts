export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
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

export const promoBanners = {
  seasonal: {
    title: "새로운 시즌 음료, 지금 만나보세요!",
    subtitle: "여름의 활력을 더해줄 상큼한 베리 블렌디드와 피치",
    buttonText: "자세히 보기",
    bgColor: "bg-green-100",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center",
  },
  summer: {
    title: "썸머 프로모션! 혜택 가득한 여름",
    subtitle:
      "다양한 프로모션으로 더욱 시원하고 즐거운 여름을 보내세요. 지금 참여하세요!",
    buttonText: "자세히 보기",
    bgColor: "bg-blue-100",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&h=200&fit=crop&crop=center",
  },
};
