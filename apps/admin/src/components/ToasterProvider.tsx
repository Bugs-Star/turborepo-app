// apps/admin/src/components/ToasterProvider.tsx
"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      duration={3000}
      expand
    />
  );
}
