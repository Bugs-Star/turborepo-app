import { memo } from "react";
import { Input } from "@repo/ui";

interface SearchBoxProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  searchTerm?: string;
  className?: string;
}

/**
 * 검색박스 컴포넌트
 * 검색 입력과 정렬 드롭다운을 포함
 */
const SearchBox = memo(function SearchBox({
  onSearch,
  placeholder = "상품을 검색해보세요",
  searchTerm = "",
  className = "",
}: SearchBoxProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch?.(value);
  };

  return (
    <div className={`w-full ${className}`}>
      <Input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={placeholder}
        size="md"
        className="h-10 !h-10"
      />
    </div>
  );
});

export default SearchBox;
