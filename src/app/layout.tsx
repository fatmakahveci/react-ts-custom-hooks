import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hook Lab | React Custom Hooks",
  description: "Explore reusable React hooks with independent, interactive counters. Built with TypeScript and Next.js.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
