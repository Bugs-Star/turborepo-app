"use client";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface NewsSectionProps {
  news: NewsItem[];
  onNewsClick?: (news: NewsItem) => void;
}

export default function NewsSection({ news, onNewsClick }: NewsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 px-6 mb-4">새로운 소식</h2>
      <div className="flex flex-col gap-4 px-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNewsClick?.(item)}
          >
            <div className="flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
