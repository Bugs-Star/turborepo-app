"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui";

interface WebsiteTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebsiteTermsModal({
  isOpen,
  onClose,
}: WebsiteTermsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden transform transition-all duration-200 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">홈페이지 이용약관</h2>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제1조 (주문의 실수)
              </h3>
              <p>
                주문을 잘못 눌러도 걱정하지 마세요. 앱은 이를 '커피 인생의 작은
                실수'로 기록하며, 웃음과 함께 교정될 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제2조 (버그 처리)
              </h3>
              <p>
                앱 내에서 발생하는 모든 버그는 잠시 '커피 찌꺼기'처럼 남아
                있다가, 개발자들이 마법처럼 청소합니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제3조 (서비스 지연)
              </h3>
              <p>
                앱이 가끔 느려지거나 튕기더라도, 그것은 단순히 당신에게 잠시
                휴식을 권하는 '커피 타임'이라고 이해해 주세요.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제4조 (이벤트 참여)
              </h3>
              <p>
                모든 이벤트는 당신에게 즐거움을 주기 위해 설계되었습니다. 단,
                예상치 못한 웃음 폭발은 앱이 책임지지 않습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제5조 (메뉴 사진)
              </h3>
              <p>
                앱에 올라간 메뉴 사진은 맛있게 보이도록 '포토샵된 커피'일 수
                있습니다. 현실과 약간 다른 점은 양념으로 받아주세요.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제6조 (방문 빈도)
              </h3>
              <p>
                앱은 당신이 자주 돌아오기를 원합니다. 하지만 너무 자주 방문해도,
                커피 중독에 대한 책임은 지지 않습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제7조 (예측 불가한 즐거움)
              </h3>
              <p>
                앱 사용 중 발생하는 모든 예측 불가한 즐거움은 무료로 제공되며,
                추가 비용이나 책임은 없습니다.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                본 약관은 사용자가 이 글을 본 시점부터 시행됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-center p-6 border-t border-gray-200 bg-gray-50">
          <Button onClick={handleClose} variant="green" size="md">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
