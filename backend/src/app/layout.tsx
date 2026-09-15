import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lock Shield",
  description: "Lock Shield Firefighting & Safety Equipment Installation LLC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
