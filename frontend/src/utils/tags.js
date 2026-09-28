const TAG_PALETTE = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-purple-50 text-purple-700 border-purple-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-amber-50 text-amber-700 border-amber-100",
  "bg-sky-50 text-sky-700 border-sky-100",
  "bg-pink-50 text-pink-700 border-pink-100",
];

const DOT_PALETTE = [
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-violet-500",
];

function hash(seed) {
  return String(seed ?? "")
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function tagTone(seed) {
  return TAG_PALETTE[hash(seed) % TAG_PALETTE.length];
}

export function dotTone(seed) {
  return DOT_PALETTE[hash(seed) % DOT_PALETTE.length];
}
