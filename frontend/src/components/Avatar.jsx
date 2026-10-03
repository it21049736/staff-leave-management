import { useState } from "react";
import { initials, avatarTone } from "../utils/avatar";
import { mediaUrl } from "../utils/media";

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
  xl: "w-16 h-16 text-xl",
};

/** Renders a real profile photo when avatarUrl is set, falling back to the
 *  existing colored-initials circle otherwise - including if the image URL
 *  turns out to be stale/broken (deleted file, bad link), so a dangling
 *  reference never shows a broken-image icon. */
export default function Avatar({ name, avatarUrl, size = "md", ring = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const url = mediaUrl(avatarUrl);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name || "Profile"}
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${ring ? "ring-2 ring-indigo-500/20" : ""} ${className}`}
      />
    );
  }

  const tone = avatarTone(name);
  return (
    <div
      className={`${sizeClass} rounded-full font-bold flex items-center justify-center shrink-0 ${tone.bg} ${tone.text} ${
        ring ? `ring-1 ${tone.ring}` : ""
      } ${className}`}
    >
      {initials(name)}
    </div>
  );
}
