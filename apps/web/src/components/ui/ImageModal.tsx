"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  src,
  alt,
}: ImageModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative max-w-md max-h-[90vh] w-full mx-4">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          aria-label="이미지 닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 이미지 */}
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={800}
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
}
