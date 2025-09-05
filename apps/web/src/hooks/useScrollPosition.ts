import { useState, useEffect, useCallback } from "react";

interface ScrollPositionReturn {
  isAtTop: boolean;
  isHeroHidden: boolean;
  showScrollToTop: boolean;
  scrollToTop: () => void;
}

export function useScrollPosition(
  scrollToTopThreshold: number = 300
): ScrollPositionReturn {
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isHeroHidden, setIsHeroHidden] = useState<boolean>(false);
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      // main 요소의 스크롤 위치 확인
      const mainElement: HTMLElement | null = document.querySelector("main");
      const scrollY: number = mainElement?.scrollTop ?? 0;

      // 모든 스크롤 상태를 한 번에 계산
      const newIsAtTop: boolean = scrollY <= 10;
      const newIsHeroHidden: boolean = scrollY >= 200;
      const newShowScrollToTop: boolean = scrollY >= scrollToTopThreshold;

      setIsAtTop(newIsAtTop);
      setIsHeroHidden(newIsHeroHidden);
      setShowScrollToTop(newShowScrollToTop);
    };

    // main 요소 찾기
    const mainElement: HTMLElement | null = document.querySelector("main");

    if (mainElement) {
      // 초기 스크롤 위치 설정
      handleScroll();

      // main 요소에 이벤트 리스너 등록
      mainElement.addEventListener("scroll", handleScroll, { passive: true });
      return (): void =>
        mainElement.removeEventListener("scroll", handleScroll);
    }
  }, [scrollToTopThreshold]);

  const scrollToTop = useCallback((): void => {
    const mainElement: HTMLElement | null = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  return { isAtTop, isHeroHidden, showScrollToTop, scrollToTop };
}
