import type { Metadata } from "next";
import { Archivo, Chakra_Petch } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Lock Shield Fire Safety UAE",
    default: "Lock Shield | Certified Firefighting & Safety Equipment Dubai UAE",
  },
  description:
    "Civil Defence Approved Firefighting & Safety Solutions in Dubai & UAE. Annual Maintenance Contracts (AMC), FM-200, Fire Extinguishers, and Fire Suppression Systems.",
  icons: {
    icon: "/assets/images/favicon-32x32.png",
    apple: "/assets/images/logo-shield.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${chakraPetch.variable}`}>
      <body className="font-sans antialiased selection:bg-[#e01b24] selection:text-white">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
