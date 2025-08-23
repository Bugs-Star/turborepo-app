"use client";

import { useEffect } from "react";
import { setupInterceptors } from "@/lib/interceptors";

export default function InitInterceptor() {
  useEffect(() => {
    setupInterceptors();
  }, []);

  return null;
}
