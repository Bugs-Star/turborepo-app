"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, Menu, ShoppingCart, User } from "lucide-react";
import { useCartCountFetch, useAnalytics } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";

const basePath = "/bugs-star";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: cartCountData } = useCartCountFetch();
  const cartCount = cartCountData?.count || 0;
  const { trackNavLinkClick } = useAnalytics();
  const { isAuthenticated } = useAuthStore();
  const { showWarning } = useToast();

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`${basePath}/login`);
    }
    trackNavLinkClick("profile", "MY");
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showWarning("로그인이 필요한 서비스입니다.");
      router.push(`${basePath}/login`);
    }
    trackNavLinkClick("cart", "CART");
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 py-3 z-50">
      <div className="flex justify-around items-center">
        <Link
          href={`${basePath}/home`}
          onClick={() => trackNavLinkClick("home", "HOME")}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/home"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <House
            className="w-6 h-6 mb-1"
            fill={pathname === "/home" ? "currentColor" : "none"}
          />
          <span className="text-xs">HOME</span>
        </Link>
        <Link
          href={`${basePath}/menu`}
          onClick={() => trackNavLinkClick("menu", "MENU")}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/menu"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <Menu
            className="w-6 h-6 mb-1"
            fill={pathname === "/menu" ? "currentColor" : "none"}
          />
          <span className="text-xs">MENU</span>
        </Link>
        <Link
          href={`${basePath}/cart`}
          onClick={handleCartClick}
          className={`flex flex-col items-center transition-colors relative ${
            pathname === "/cart"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <div className="relative">
            <ShoppingCart
              className="w-6 h-6 mb-1"
              fill={pathname === "/cart" ? "currentColor" : "none"}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-xs">CART</span>
        </Link>
        <Link
          href={`${basePath}/profile`}
          onClick={handleProfileClick}
          className={`flex flex-col items-center transition-colors ${
            pathname === "/profile"
              ? "text-green-800"
              : "text-gray-700 hover:text-green-800"
          }`}
        >
          <User
            className="w-6 h-6 mb-1"
            fill={pathname === "/profile" ? "currentColor" : "none"}
          />
          <span className="text-xs">MY</span>
        </Link>
      </div>
    </div>
  );
}
