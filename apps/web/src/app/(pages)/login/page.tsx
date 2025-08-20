"use client";

import { Logo } from "@/components/ui";
import { LoginForm } from "@/components/forms";
import { BottomNavigation } from "@/components/layout";

export default function LoginPage() {
  return (
    <>
      <div className="min-h-screen bg-white flex flex-col pb-20">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </>
  );
}
