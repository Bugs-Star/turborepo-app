import { useState, useEffect, useRef, useMemo } from "react";
import type { SortOption, SortOptionItem } from "@/types/product";
import { SORT_OPTIONS } from "@/types/constants";

interface SortDropdownProps {
  onSortChange?: (sortOption: SortOption) => void;
  selectedOption?: SortOption;
}

export default function SortDropdown({
  onSortChange,
  selectedOption: externalSelectedOption,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부에서 전달된 selectedOption 사용, 없으면 기본값
  const selectedOption = SORT_OPTIONS[externalSelectedOption || "latest"];

  // sortOptions를 useMemo로 최적화
  const sortOptions = useMemo(
    () =>
      Object.entries(SORT_OPTIONS).map(([value, label]) => ({
        value: value as SortOption,
        label,
      })),
    []
  );

  const handleOptionSelect = (option: SortOptionItem) => {
    setIsOpen(false);
    onSortChange?.(option.value);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-32 h-10 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:outline-none flex items-center justify-between"
      >
        <span>{selectedOption}</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
