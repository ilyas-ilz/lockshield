import * as React from "react";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/frontend/Navbar";
import { Footer } from "@/components/frontend/Footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let settingsData: any = {};
  try {
    const s = await getSettings();
    settingsData = s.toObject ? s.toObject() : s;
  } catch {
    // Graceful fallback if database temporarily unavailable
  }

  const phone = settingsData.phones?.[0] || "+971 4 272 7333";

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff] text-[#0d1220]">
      <Navbar phone={phone} siteName={settingsData.siteName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settingsData} />
    </div>
  );
}
