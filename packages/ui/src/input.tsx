"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  variant?: "default" | "rounded";
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      variant = "default",
      size = "md",
      className = "",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses =
      "w-full border transition-all duration-200 focus:outline-none";

    const variantClasses = {
      default: "rounded-md",
      rounded: "rounded-lg",
    };

    const sizeClasses = {
      sm: "py-2 px-3 text-sm",
      md: "py-3 px-4 text-base",
      lg: "py-4 px-5 text-lg",
    };

    const inputClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    // 에러 상태일 때 빨간 테두리, 포커스 상태일 때 초록 테두리
    const getBorderColor = () => {
      if (error) return "rgb(239 68 68)"; // red-500
      if (isFocused) return "rgb(21 128 61)"; // green-700
      return "rgb(229 231 235)"; // gray-200
    };

    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-gray-700 text-sm font-bold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          style={
            {
              "--tw-placeholder-opacity": "1",
              "--tw-placeholder-color": "rgb(75 85 99)",
              color: "rgb(17 24 39)",
              borderColor: getBorderColor(),
              "&::placeholder": {
                color: "rgb(75 85 99)",
                opacity: "1",
              },
            } as React.CSSProperties
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
