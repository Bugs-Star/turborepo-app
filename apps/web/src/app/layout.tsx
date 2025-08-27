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
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            {children}
            <ToastContainer />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
