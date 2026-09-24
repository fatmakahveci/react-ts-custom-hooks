import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hook-lab-fatmakahveci.fatmakhv.chatgpt.site"),
  openGraph: {
    title: "Focus Desk | One task. Your full attention.",
    description: "Plan your tasks, focus on one thing, and keep a record of your progress.",
    images: [{ url: "/og.png", alt: "Focus Desk — One task. Your full attention." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus Desk | One task. Your full attention.",
    description: "Plan your tasks, focus on one thing, and keep a record of your progress.",
    images: ["/og.png"],
  },
  title: "Focus Desk | One task. Your full attention.",
  description:
    "A personal task workspace with a persistent focus timer, saved tasks, and session history. Built with reusable React hooks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
