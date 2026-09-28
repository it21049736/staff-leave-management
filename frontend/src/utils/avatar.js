const PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" },
  { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" },
  { bg: "bg-teal-100", text: "text-teal-800", ring: "ring-teal-200" },
  { bg: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  { bg: "bg-sky-100", text: "text-sky-800", ring: "ring-sky-200" },
];

export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function avatarTone(seed) {
  const key = String(seed ?? "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PALETTE[key % PALETTE.length];
}
