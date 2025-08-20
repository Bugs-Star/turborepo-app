"use client";

import React, { ReactNode } from "react";
import { useExpanded, useHovered, useFocused, useVisible } from "@/hooks";

// 확장 가능한 컴포넌트
interface ExpandableProps {
  children: ReactNode;
  expandedContent: ReactNode;
  key: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const Expandable = ({
  children,
  expandedContent,
  key,
  className = "",
  triggerClassName = "",
  contentClassName = "",
}: ExpandableProps) => {
  const { isExpanded, toggle } = useExpanded(key);

  return (
    <div className={className}>
      <div className={`cursor-pointer ${triggerClassName}`} onClick={toggle}>
        {children}
      </div>
      {isExpanded && <div className={contentClassName}>{expandedContent}</div>}
    </div>
  );
};

// 호버 가능한 컴포넌트
interface HoverableProps {
  children: ReactNode;
  hoverContent?: ReactNode;
  key: string;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export const Hoverable = ({
  children,
  hoverContent,
  key,
  className = "",
  onHoverStart,
  onHoverEnd,
}: HoverableProps) => {
  const { isHovered, startHover, stopHover } = useHovered(key);

  const handleMouseEnter = () => {
    startHover();
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    stopHover();
    onHoverEnd?.();
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {hoverContent && isHovered && (
        <div className="absolute z-10">{hoverContent}</div>
      )}
    </div>
  );
};

// 포커스 가능한 컴포넌트
interface FocusableProps {
  children: ReactNode;
  focusContent?: ReactNode;
  key: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Focusable = ({
  children,
  focusContent,
  key,
  className = "",
  onFocus,
  onBlur,
}: FocusableProps) => {
  const { isFocused, focus, blur } = useFocused(key);

  const handleFocus = () => {
    focus();
    onFocus?.();
  };

  const handleBlur = () => {
    blur();
    onBlur?.();
  };

  return (
    <div
      className={`relative ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {children}
      {focusContent && isFocused && (
        <div className="absolute z-10">{focusContent}</div>
      )}
    </div>
  );
};

// 모달 컴포넌트
interface ModalProps {
  children: ReactNode;
  key: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export const Modal = ({
  children,
  key,
  isOpen,
  onClose,
  className = "",
  overlayClassName = "",
  contentClassName = "",
}: ModalProps) => {
  const { isVisible, show, hide } = useVisible(key);

  // isOpen이 변경될 때 visible 상태 동기화
  React.useEffect(() => {
    if (isOpen) {
      show();
    } else {
      hide();
    }
  }, [isOpen, show, hide]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 ${overlayClassName}`}
        onClick={onClose}
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
};
