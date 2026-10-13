/** "Mohammed Ilyas" -> "MI", "sara@x.ae" -> "SX", "Zt" -> "ZT". */
export function initialsOf(text: string): string {
  const words = text.trim().split(/[\s@._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}
