import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getEnv } from "@/lib/env";
import { DEFAULT_OPEN_GRAPH } from "@/lib/seo/site-metadata";
import "./globals.css";

// NOTE: Previously used `next/font/google` (Archivo + Chakra Petch).
// That loader fetches Google Fonts CSS at *build time* and crashes the
// Vercel build with `TypeError: Cannot read properties of null (reading '1')`
// in `loader.js` when the fetched CSS / font-file URL shape isn't what the
// pinned Next version expects (no offline fallback possible).
// Load the fonts via <link> instead so the build never depends on outbound
// Google Fonts access; rendering falls back to system fonts if blocked.
const FONT_ARCHIVO = "'Archivo', ui-sans-serif, system-ui, -apple-system, sans-serif";
const FONT_CHAKRA = "'Chakra Petch', ui-monospace, monospace";

// WHY a fallback instead of letting getEnv() throw: this layout wraps every
// route (admin + error pages included), so a bad env var must not take the
// whole site down just to resolve SEO URLs.
function siteUrl(): URL {
  try {
    return new URL(getEnv().SITE_URL);
  } catch {
    return new URL("https://www.lockshield.ae");
  }
}

export const metadata: Metadata = {
  // SITE_URL decides the one host Google indexes; every canonical/og:url
  // below resolves against it, so apex vs www is a single env var.
  metadataBase: siteUrl(),
  title: {
    // Pages pass the bare topic; the brand is appended once, here.
    template: "%s | Lock Shield UAE",
    default: "Lock Shield | Certified Firefighting & Safety Equipment Dubai UAE",
  },
  description:
    "Civil Defence Approved Firefighting & Safety Solutions in Dubai & UAE. Annual Maintenance Contracts (AMC), FM-200, Fire Extinguishers, and Fire Suppression Systems.",
  // "./" is resolved against each page's own pathname, so every page gets a
  // self-referencing canonical and the www/apex duplicate collapses to one.
  alternates: { canonical: "./" },
  openGraph: DEFAULT_OPEN_GRAPH,
  icons: {
    icon: "/assets/images/favicon-32x32.png",
    apple: "/assets/images/logo-shield.png",
  },
};

// Runs before hydration so the admin never flashes light-then-dark (or the
// sidebar open-then-collapsed) on load.
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
    if (localStorage.getItem("ls-admin-sidebar") === "collapsed") {
      document.documentElement.setAttribute("data-sidebar", "collapsed");
    }
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
    <html
      lang="en"
      style={
        {
          "--font-archivo": FONT_ARCHIVO,
          "--font-chakra": FONT_CHAKRA,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800&family=Chakra+Petch:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased selection:bg-[#e01b24] selection:text-white">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
