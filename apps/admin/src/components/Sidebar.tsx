"use client";

import useLogout from "@/hooks/useLogout";
import {
  Coffee,
  ShoppingCart,
  Users,
  Megaphone,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Dancing_Script, Pacifico } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "메뉴, 이벤트 관리", icon: Coffee, path: "/menu-event" },
  { label: "재고관리", icon: ShoppingCart, path: "/stock-management" },
  { label: "고객관리", icon: Users, path: "/customer-management" },
  { label: "광고관리", icon: Megaphone, path: "/ads-management" },
  { label: "보고서", icon: BarChart3, path: "/dashboard" },
];

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400", "400"],
});

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <div className="flex flex-col w-48 h-screen border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 cursor-pointer">
        <img src="/bugs_star_logo.png" alt="Bugs Star" className="w-10 h-10" />
        <span className={`${pacifico.className} font-extrabold text-[#005C14]`}>
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
              className={`flex items-center w-full px-4 py-2 text-sm 
                ${isActive ? "bg-gray-100 font-semibold text-green-700" : "text-gray-700 hover:bg-gray-50 cursor-pointer"}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-2" />

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={() => void logout()}
          className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
