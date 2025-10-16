"use client";

import { createElement } from "react";
import type { ReactNode } from "react";
import {
  House,
  ShoppingCart,
  CreditCard,
  LogIn,
  Sparkles,
  FileText,
  User,
  Search,
  type LucideIcon,
  Coffee,
  Gift,
} from "lucide-react";
import type { StepKind } from "@/lib/api/goldenPathAnalysis";

const ICONS: Record<StepKind, LucideIcon> = {
  home: House,
  menu: Coffee,
  menuDetail: Search,
  event: Sparkles,
  promotion: Gift,
  cart: ShoppingCart,
  payment: CreditCard,
  login: LogIn,
  profile: User,
  other: FileText,
};

export function iconFor(kind: StepKind, cls = "size-6"): ReactNode {
  const C = ICONS[kind] ?? FileText;
  return createElement(C, { className: cls });
}
