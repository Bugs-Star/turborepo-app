"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  return null; // 화면에 아무것도 보여주지 않음 (리다이렉트만 수행)
}
