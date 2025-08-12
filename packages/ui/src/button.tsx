"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-bold transition-colors focus:outline-none cursor-pointer flex items-center justify-center";

  const variantClasses = {
    primary: "bg-green-700 hover:bg-green-800 text-white",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white",
    outline:
      "border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white",
    ghost: "text-green-700 hover:bg-green-100",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizeClasses = {
    sm: "py-2 px-3 text-sm rounded-lg",
    md: "py-3 px-4 text-base rounded-lg",
    lg: "py-4 px-6 text-lg rounded-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};
