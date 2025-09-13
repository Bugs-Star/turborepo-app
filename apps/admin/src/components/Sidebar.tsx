"use client";

import useLogout from "@/hooks/auth/useLogout";
import {
  Coffee,
  ShoppingCart,
  Users,
  Megaphone,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Pacifico } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "이벤트, 추천메뉴 관리", icon: Coffee, path: "/event-menu" },
  { label: "제품 관리", icon: ShoppingCart, path: "/product-management" },
  { label: "고객 관리", icon: Users, path: "/customer-management" },
  { label: "광고 관리", icon: Megaphone, path: "/promo-management" },
  { label: "보고서", icon: BarChart3, path: "/dashboard" },
];

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
});

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <div className="flex flex-col w-48 h-screen border-r border-border bg-card text-card-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 cursor-pointer">
        <img src="/bugs_star_logo.png" alt="Bugs Star" className="w-10 h-10" />
        <span className={`${pacifico.className} font-extrabold text-brand`}>
          Bugs Star
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`flex items-center w-full px-4 py-2 text-sm rounded
                ${
                  isActive
                    ? "bg-muted font-semibold text-brand"
                    : "text-muted-foreground hover:bg-muted cursor-pointer"
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-border mx-2" />

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={() => void logout()}
          className="flex items-center justify-center w-full px-4 py-2 text-sm border border-border rounded bg-muted hover:opacity-90 cursor-pointer text-card-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
