import Link from "next/link";
import { House, Menu, ShoppingCart, User } from "lucide-react";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-50">
      <div className="flex justify-around items-center">
        <Link
          href="/home"
          className="flex flex-col items-center text-gray-700 hover:text-green-700 transition-colors"
        >
          <House className="w-6 h-6 mb-1" />
          <span className="text-xs">HOME</span>
        </Link>
        <Link
          href="/menu"
          className="flex flex-col items-center text-gray-700 hover:text-green-700 transition-colors"
        >
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-xs">MENU</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center text-gray-700 hover:text-green-700 transition-colors"
        >
          <ShoppingCart className="w-6 h-6 mb-1" />
          <span className="text-xs">CART</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center text-gray-700 hover:text-green-700 transition-colors"
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">MY</span>
        </Link>
      </div>
    </div>
  );
}
