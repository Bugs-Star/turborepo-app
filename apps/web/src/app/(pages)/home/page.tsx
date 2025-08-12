"use client";

import { BottomNavigation } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-green-700">홈</h1>
        <p className="text-gray-600 text-center">홈 페이지입니다.</p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
