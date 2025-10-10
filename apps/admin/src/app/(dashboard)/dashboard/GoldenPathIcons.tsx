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
  Utensils,
  User,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { StepKind } from "@/lib/api/goldenPathAnalysis";

const ICONS: Record<StepKind, LucideIcon> = {
  home: House,
  menu: Utensils,
  menuDetail: Search,
  event: Sparkles,
  cart: ShoppingCart,
  payment: CreditCard,
  login: LogIn,
  landing: FileText,
  profile: User,
  other: FileText,
};

export function iconFor(kind: StepKind, cls = "size-6"): ReactNode {
  const C = ICONS[kind] ?? FileText;
  return createElement(C, { className: cls });
}
