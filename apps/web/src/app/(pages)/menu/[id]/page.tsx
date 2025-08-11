interface MenuItemDetailPageProps {
  params: {
    id: string;
  };
}

export default function MenuItemDetailPage({ params }: MenuItemDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">메뉴 상세</h1>
      <p className="text-gray-600">메뉴 ID: {params.id}</p>
      <p className="text-gray-600">메뉴 아이템 상세 페이지입니다.</p>
    </div>
  );
}
