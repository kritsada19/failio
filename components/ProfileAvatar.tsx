type ProfileAvatarProps = {
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

/** สีพื้นหลังชุดสวยๆ สโทน warm–cool ของ Failio */
const AVATAR_COLORS = [
  { bg: "#F97316", text: "#fff" }, // orange
  { bg: "#8B5CF6", text: "#fff" }, // violet
  { bg: "#0EA5E9", text: "#fff" }, // sky
  { bg: "#10B981", text: "#fff" }, // emerald
  { bg: "#F43F5E", text: "#fff" }, // rose
  { bg: "#FBBF24", text: "#1e1e1e" }, // amber
  { bg: "#6366F1", text: "#fff" }, // indigo
  { bg: "#14B8A6", text: "#fff" }, // teal
];

/** hash ชื่อ → index สี (deterministic = สีเดิมทุกครั้ง) */
function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

const sizeMap = {
  sm: { circle: 32, font: 13 },
  md: { circle: 44, font: 18 },
  lg: { circle: 72, font: 30 },
  xl: { circle: 112, font: 48 },
};

export default function ProfileAvatar({
  name,
  size = "md",
}: ProfileAvatarProps) {
  const displayName = name?.trim() || "?";
  const initial = displayName[0].toUpperCase();
  const color = getColorFromName(displayName);
  const { circle, font } = sizeMap[size];

  return (
    <div
      role="img"
      aria-label={`Avatar of ${displayName}`}
      style={{
        width: circle,
        height: circle,
        backgroundColor: color.bg,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <span
        style={{
          color: color.text,
          fontSize: font,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {initial}
      </span>
    </div>
  );
}
