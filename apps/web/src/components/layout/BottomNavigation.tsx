import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Menu, ShoppingCart, User } from "lucide-react";
import { useCartCountFetch } from "@/hooks";
import { tokenManager } from "@/lib/api";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { data: cartCountData } = useCartCountFetch();
  const cartCount = cartCountData?.count || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-50">
      <div className="flex justify-around items-center">
        <Link
          href="/home"
          className={`flex flex-col items-center transition-colors ${
            pathname === "/home"
              ? "text-green-700"
              : "text-gray-700 hover:text-green-700"
          }`}
        >
          <House
            className="w-6 h-6 mb-1"
            fill={pathname === "/home" ? "currentColor" : "none"}
          />
          <span className="text-xs">HOME</span>
        </Link>
        <Link
          href="/menu"
          className={`flex flex-col items-center transition-colors ${
            pathname === "/menu"
              ? "text-green-700"
              : "text-gray-700 hover:text-green-700"
          }`}
        >
          <Menu
            className="w-6 h-6 mb-1"
            fill={pathname === "/menu" ? "currentColor" : "none"}
          />
          <span className="text-xs">MENU</span>
        </Link>
        <Link
          href="/cart"
          className={`flex flex-col items-center transition-colors relative ${
            pathname === "/cart"
              ? "text-green-700"
              : "text-gray-700 hover:text-green-700"
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
          href="/profile"
          className={`flex flex-col items-center transition-colors ${
            pathname === "/profile"
              ? "text-green-700"
              : "text-gray-700 hover:text-green-700"
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
