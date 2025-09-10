"use client";

import { useState } from "react";
import PrivacyPolicyModal from "@/components/ui/PrivacyPolicyModal";
import WebsiteTermsModal from "@/components/ui/WebsiteTermsModal";
import BucksstarCardTermsModal from "@/components/ui/BucksstarCardTermsModal";

export default function Footer() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isWebsiteTermsModalOpen, setIsWebsiteTermsModalOpen] = useState(false);
  const [isBucksstarCardTermsModalOpen, setIsBucksstarCardTermsModalOpen] =
    useState(false);

  const handlePrivacyClick = () => {
    setIsPrivacyModalOpen(true);
  };

  const handleWebsiteTermsClick = () => {
    setIsWebsiteTermsModalOpen(true);
  };

  const handleBucksstarCardTermsClick = () => {
    setIsBucksstarCardTermsModalOpen(true);
  };

  return (
    <div className="bg-white py-8">
      {/* 상단 내비게이션 링크 섹션 */}
      <div className="mb-6 bg-gray-50 -mx-6 px-6 py-4">
        <div className="text-sm text-gray-500 px-6">
          <span
            className="font-semibold cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handlePrivacyClick}
          >
            개인정보처리방침
          </span>
          <span className="mx-2 text-gray-300 pointer-events-none">|</span>
          <span
            className="font-semibold cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handleWebsiteTermsClick}
          >
            홈페이지 이용약관
          </span>
          <span className="mx-2 text-gray-300 pointer-events-none">|</span>
          <span
            className="font-semibold cursor-pointer hover:text-gray-700 transition-colors"
            onClick={handleBucksstarCardTermsClick}
          >
            벅스스타카드 이용약관
          </span>
        </div>
      </div>

      <div className="px-6 pointer-events-none">
        {/* 회사 정보 섹션 */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-green-800 font-bold text-lg">
              BUCKSSTAR®
            </span>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <div>주식회사 벅스스타컴퍼니</div>
            <div className="flex items-center">
              <span>대표이사 : 칼디(Kaldi)</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>사업자등록번호 : 012-34-56789</span>
              <span className="mx-2 text-gray-300">|</span>
            </div>
            <div className="flex items-center">
              <span>TEL : 1234-1234</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>개인정보 보호책임자 : 바바 부단(Baba Budan)</span>
              <span className="mx-2 text-gray-300">|</span>
            </div>
            <div>통신판매업신고번호 : 2025-카페라떼-0070</div>
            <div>
              주소 : 서울특별시 아메리카노구 카페라떼로 77, 모카프라푸치노타워
              10층
            </div>
          </div>
        </div>

        {/* 저작권 및 호스팅 정보 섹션 */}
        <div className="text-xs text-gray-500">
          © 2025 Bucksstar Coffee Company. All Rights Reserved. Hosting By
          Caffeine Overflow Co.
        </div>
      </div>

      {/* 개인정보처리방침 모달 */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* 홈페이지 이용약관 모달 */}
      <WebsiteTermsModal
        isOpen={isWebsiteTermsModalOpen}
        onClose={() => setIsWebsiteTermsModalOpen(false)}
      />

      {/* 벅스스타카드 이용약관 모달 */}
      <BucksstarCardTermsModal
        isOpen={isBucksstarCardTermsModalOpen}
        onClose={() => setIsBucksstarCardTermsModalOpen(false)}
      />
    </div>
  );
}
