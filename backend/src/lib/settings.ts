import { connectDB } from "./db";
import { Settings, type ISettings } from "@/models/Settings";

const SINGLETON_ID = "global";

/** Reads the one Settings document, creating it with schema defaults on first access. */
export async function getSettings(): Promise<ISettings> {
  await connectDB();
  const existing = await Settings.findById(SINGLETON_ID);
  if (existing) return existing;
  return Settings.create({ _id: SINGLETON_ID });
}
