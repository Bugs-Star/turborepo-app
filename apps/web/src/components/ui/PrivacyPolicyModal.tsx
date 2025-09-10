"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
}: PrivacyPolicyModalProps) {
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
          <h2 className="text-xl font-bold text-gray-900">개인정보처리방침</h2>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제1조 (개인정보의 안전한 보관)
              </h3>
              <p>
                사용자가 입력하는 이름, 이메일, 주문 내역 등 모든 정보는 저희
                마음속 '커피 컵 홀더'에 안전하게 담겨 있으며, 절대 무단으로
                흘려보내지 않습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제2조 (데이터 보관 방식)
              </h3>
              <p>
                당신의 데이터는 신선한 원두처럼 보관되며, 장기간 사용하지
                않더라도 '익스트림 다크 로스트' 수준으로 안전하게 숙성됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제3조 (개인정보의 활용 목적)
              </h3>
              <p>
                수집된 정보는 메뉴 추천, 이벤트 안내, 앱 개선 등 오직 '당신의
                커피 경험'을 풍부하게 만들기 위해 사용됩니다. 단, 추천 메뉴가
                실패하더라도 웃음으로 넘어가 주시기 바랍니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제4조 (사용 기록의 처리)
              </h3>
              <p>
                앱 사용 기록은 '커피 향'처럼 은은하게 남으며, 필요 시 개발자만
                감각적으로 탐지할 수 있습니다.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                본 방침은 사용자가 이 글을 본 시점부터 시행됩니다.
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
