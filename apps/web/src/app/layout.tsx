import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui";
import QueryProvider from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bugs Star",
  description: "Bugs Star - Coffee & Dessert",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} max-w-md mx-auto`}>
        <ErrorBoundary>
          <QueryProvider>
            <main className="h-screen overflow-y-scroll scrollbar-hide">
              {children}
            </main>
            <ToastContainer />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
