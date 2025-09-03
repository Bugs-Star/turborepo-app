import { useState, useEffect } from "react";

interface ScrollPositionReturn {
  isAtTop: boolean;
  isHeroHidden: boolean;
}

export function useScrollPosition(): ScrollPositionReturn {
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isHeroHidden, setIsHeroHidden] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      // main 요소의 스크롤 위치 확인
      const mainElement: HTMLElement | null = document.querySelector("main");
      const scrollY: number = mainElement?.scrollTop ?? 0;
      const newIsAtTop: boolean = scrollY <= 10;
      const newIsHeroHidden: boolean = scrollY >= 200;

      setIsAtTop(newIsAtTop);
      setIsHeroHidden(newIsHeroHidden);
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
  }, []);

  return { isAtTop, isHeroHidden };
}
