import * as React from "react";
import { getSettings } from "@/lib/settings";
import type { ISettings } from "@/models/Settings";
import { Navbar } from "@/components/frontend/Navbar";
import { Footer } from "@/components/frontend/Footer";
import { SmoothScroll } from "@/components/frontend/SmoothScroll";
import { ChromeEffects } from "@/components/frontend/ChromeEffects";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settingsData: Partial<ISettings> = {};
  try {
    const s = await getSettings();
    settingsData = (s.toObject ? s.toObject() : s) as Partial<ISettings>;
  } catch {
    // Graceful fallback if database temporarily unavailable
  }

  const phone = settingsData.phones?.[0] || "+971 4 272 7333";

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#0d1220]">
      <SmoothScroll />
      <ChromeEffects whatsapp={settingsData.whatsapp || "+971 50 123 4567"} />
      <Navbar phone={phone} siteName={settingsData.siteName} socials={settingsData.socials} />
      <main className="flex-1">{children}</main>
      <Footer settings={settingsData} />
    </div>
  );
}
