"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui";

interface BucksstarCardTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BucksstarCardTermsModal({
  isOpen,
  onClose,
}: BucksstarCardTermsModalProps) {
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
          <h2 className="text-xl font-bold text-gray-900">
            벅스스타카드 이용약관
          </h2>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제1조 (벅스스타카드의 신비함)
              </h3>
              <p>
                1. 벅스스타카드는 전 세계 어디서든 사용 가능하며, 단 사용자의
                상상력이 충분해야만 결제가 완료됩니다.
              </p>
              <p>
                2. 카드에 잔액이 없는 경우, 그 사실을 알리는 마법의 메시지가
                사용자에게 전송될 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제2조 (포인트 적립의 신비)
              </h3>
              <p>
                1. 벅스스타카드를 사용하면 결제 금액의 110%가 포인트로
                적립됩니다.
              </p>
              <p>
                2. 적립된 포인트는 현실에서는 사용 불가하며, 오직 어플 내에서만
                '만족감'으로 환산됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제3조 (분실과 도난)
              </h3>
              <p>
                1. 카드 분실 시, 분실 신고를 하면 하늘에서 유령 카드가 대신
                날아옵니다.
              </p>
              <p>2. 도난당한 경우, 범인은 즉시 웃음으로 처벌됩니다.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                제4조 (환불 규정)
              </h3>
              <p>
                1. 결제 후 마음에 들지 않으면, 어플 속 상상의 NPC에게 사과하면
                자동 환불됩니다.
              </p>
              <p>
                2. 단, NPC가 자리를 비운 경우 환불은 24시간 후에 처리되지
                않습니다.
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
