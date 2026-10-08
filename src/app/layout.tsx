import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccordBridge — Workspace demo",
  description:
    "A sample-data preview of clearer freelance agreements and milestone payments on Stellar.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
