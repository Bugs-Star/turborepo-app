"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  variant?: "default";
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, variant = "default", size = "md", style = {}, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseStyles: React.CSSProperties = {
      width: "100%",
      border: "1px solid",
      transition: "all 0.2s ease-in-out",
      outline: "none",
      borderRadius: "8px", // rounded-lg
      ...style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: "8px 12px", // py-2 px-3
        fontSize: "14px", // text-sm
      },
      md: {
        padding: "12px 16px", // py-3 px-4
        fontSize: "16px", // text-base
      },
      lg: {
        padding: "16px 20px", // py-4 px-5
        fontSize: "18px", // text-lg
      },
    };

    // 에러 상태일 때 빨간 테두리, 포커스 상태일 때 초록 테두리
    const getBorderColor = () => {
      if (error) return "#ef4444"; // red-500
      if (isFocused) return "#15803d"; // green-700
      return "#e5e7eb"; // gray-200
    };

    const inputStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      borderColor: getBorderColor(),
      color: "#111827", // gray-900
    };

    const containerStyles: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "12px", // space-y-3
    };

    const labelStyles: React.CSSProperties = {
      display: "block",
      color: "#374151", // gray-700
      fontSize: "14px", // text-sm
      fontWeight: "bold",
    };

    const errorStyles: React.CSSProperties = {
      color: "#ef4444", // red-500
      fontSize: "14px", // text-sm
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}
        <input
          ref={ref}
          style={inputStyles}
          placeholder={props.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && <p style={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
