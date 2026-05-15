// Shared design constants — HireOnyx blue/teal palette

export const SURFACE = {
  background: "#0F1520",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
};

export const LABEL = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#94A3B8",
};

export const INPUT = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "#161D2E",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#F0F4FF",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

// Primary gradient button — blue → teal (matches logo)
export const BTN_PRIMARY = {
  borderRadius: 10,
  background: "linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)",
  color: "#080C14",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 0 20px rgba(79,142,247,0.30)",
};

export const BTN_SECONDARY = {
  borderRadius: 10,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#F0F4FF",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

// Match score colors
export const matchColor = (m) =>
  m >= 85 ? "#00C2A8" : m >= 60 ? "#4F8EF7" : "#E05252";

export const matchGlow = (m) =>
  m >= 85
    ? "0 0 12px rgba(0,194,168,0.30)"
    : m >= 60
    ? "0 0 12px rgba(79,142,247,0.25)"
    : "0 0 12px rgba(224,82,82,0.25)";

// Brand colors
export const BLUE  = "#4F8EF7";
export const TEAL  = "#00C2A8";
export const GRAD  = "linear-gradient(135deg, #4F8EF7 0%, #00C2A8 100%)";
