import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hook-lab-fatmakahveci.opal-olive-4420.chatgpt.site"),
  openGraph: {
    title: "Hook Lab | React Custom Hooks",
    description: "Explore React hooks. One experiment at a time.",
    images: [{ url: "/og.png", alt: "Hook Lab — interactive React hook experiments" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hook Lab | React Custom Hooks",
    description: "Explore React hooks. One experiment at a time.",
    images: ["/og.png"],
  },
  title: "Hook Lab | React Custom Hooks",
  description:
    "Explore reusable React hooks with independent, interactive counters. Built with TypeScript and Next.js.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
