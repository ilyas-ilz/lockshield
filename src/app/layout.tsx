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

// Runs before hydration so the admin never flashes light-then-dark on load.
// Scoped to /admin: the marketing site has no theme toggle and isn't
// designed with a dark variant, so this must never touch it.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    if (!window.location.pathname.startsWith("/admin")) return;
    var stored = localStorage.getItem("ls-admin-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme-init script below adds .dark to
    // this element before React hydrates (by design, to avoid a flash) -
    // without this, React treats that as a hydration mismatch and logs an
    // error on every admin page load, even though the mismatch is expected
    // and correct. Doesn't suppress mismatches on any other attribute or
    // any child content, only this element's own tag.
    <html lang="en" className={`${archivo.variable} ${chakraPetch.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased selection:bg-[#e01b24] selection:text-white">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
