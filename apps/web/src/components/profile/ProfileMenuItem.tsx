"use client";

import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ProfileMenuItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  variant?: "default" | "bordered";
  onClick?: () => void;
}

export default function ProfileMenuItem({
  icon: Icon,
  title,
  href,
  variant = "default",
  onClick,
}: ProfileMenuItemProps) {
  const baseClasses =
    "flex items-center justify-between p-4 bg-white rounded-lg transition-colors";
  const variantClasses = {
    default: "hover:bg-gray-50",
    bordered: "border border-green-200 hover:bg-green-50",
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="text-gray-900 font-medium">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}
