"use client";

import { ReactNode, ButtonHTMLAttributes, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "green" | "red";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = "green",
  size = "md",
  fullWidth = false,
  style = {},
  ...props
}: ButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: React.CSSProperties = {
    fontWeight: "bold",
    transition:
      "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out",
    outline: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    ...style,
  };

  const getVariantStyles = (): React.CSSProperties => {
    const baseVariantStyles = {
      green: {
        backgroundColor: "#15803d", // green-700
        color: "white",
      },
      red: {
        backgroundColor: "#dc2626", // red-600
        color: "white",
      },
    };

    const hoverVariantStyles = {
      green: {
        backgroundColor: "#166534", // green-800
      },
      red: {
        backgroundColor: "#b91c1c", // red-700
      },
    };

    return {
      ...baseVariantStyles[variant],
      ...(isHovered ? hoverVariantStyles[variant] : {}),
    };
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: "8px 12px", // py-2 px-3
      fontSize: "14px", // text-sm
      borderRadius: "8px", // rounded-lg
    },
    md: {
      padding: "12px 16px", // py-3 px-4
      fontSize: "16px", // text-base
      borderRadius: "8px", // rounded-lg
    },
    lg: {
      padding: "16px 24px", // py-4 px-6
      fontSize: "18px", // text-lg
      borderRadius: "8px", // rounded-lg
    },
  };

  const widthStyle = fullWidth ? { width: "100%" } : {};

  const buttonStyles: React.CSSProperties = {
    ...baseStyles,
    ...getVariantStyles(),
    ...sizeStyles[size],
    ...widthStyle,
  };

  return (
    <button
      style={buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};
