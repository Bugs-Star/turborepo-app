"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, Coffee, ShoppingCart, User, ChevronUp } from "lucide-react";
import { useCartCountFetch, useAnalytics, useScrollPosition } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: cartCountData } = useCartCountFetch();
  const cartCount = cartCountData?.count || 0;
  const { trackNavLinkClick } = useAnalytics();
  const { isAuthenticated } = useAuthStore();
  const { showWarning } = useToast();
  const { showScrollToTop, scrollToTop } = useScrollPosition(300);

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
    trackNavLinkClick("profile", "MY");
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showWarning("로그인이 필요한 서비스입니다.");
      router.push("/login");
    }
    trackNavLinkClick("cart", "CART");
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 pt-3 pb-2 z-50">
      {/* 스크롤 투 탑 버튼 */}
      {showScrollToTop && (
        <div className="absolute -top-12 right-4 z-10">
          <button
            onClick={scrollToTop}
            className="bg-green-800 text-white rounded-full p-2 shadow-lg hover:bg-green-700 transition-colors duration-200"
            aria-label="맨 위로 이동"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex justify-around items-center">
        <Link
          href="/home"
          onClick={() => trackNavLinkClick("home", "HOME")}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/home"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <House
            className="w-5 h-5 mb-1"
            fill={pathname === "/home" ? "rgba(22, 101, 52, 0.2)" : "none"}
          />
          <span className="text-[10px]">HOME</span>
        </Link>
        <Link
          href="/menu"
          onClick={() => trackNavLinkClick("menu", "MENU")}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/menu"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <Coffee
            className="w-5 h-5 mb-1"
            fill={pathname === "/menu" ? "rgba(22, 101, 52, 0.2)" : "none"}
          />
          <span className="text-[10px]">MENU</span>
        </Link>
        <Link
          href="/cart"
          onClick={handleCartClick}
          className={`flex flex-col items-center transition-colors relative ${
            pathname === "/cart"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <div className="relative">
            <ShoppingCart
              className="w-5 h-5 mb-1"
              fill={pathname === "/cart" ? "rgba(22, 101, 52, 0.2)" : "none"}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">CART</span>
        </Link>
        <Link
          href="/profile"
          onClick={handleProfileClick}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/profile"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <User
            className="w-5 h-5 mb-1"
            fill={pathname === "/profile" ? "rgba(22, 101, 52, 0.2)" : "none"}
          />
          <span className="text-[10px]">MY</span>
        </Link>
      </div>
    </div>
  );
}
