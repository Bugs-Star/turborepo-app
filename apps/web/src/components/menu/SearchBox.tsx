import { memo } from "react";
import { Input } from "@repo/ui";
import SortDropdown from "./SortDropdown";
import type { SortOption } from "@/types/product";

interface SearchBoxProps {
  onSearch?: (searchTerm: string) => void;
  onSortChange?: (sortOption: SortOption) => void;
  placeholder?: string;
  searchTerm?: string;
  sortOption?: SortOption;
  className?: string;
}

/**
 * 검색박스 컴포넌트
 * 검색 입력과 정렬 드롭다운을 포함
 */
const SearchBox = memo(function SearchBox({
  onSearch,
  onSortChange,
  placeholder = "상품을 검색해보세요",
  searchTerm = "",
  sortOption,
  className = "",
}: SearchBoxProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch?.(value);
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="flex-1">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          size="md"
          className="h-10 !h-10"
        />
      </div>
      <SortDropdown onSortChange={onSortChange} selectedOption={sortOption} />
    </div>
  );
});

export default SearchBox;
