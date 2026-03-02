import { useState } from "react";

const palettes = {
  light: {
    name: "Light Mode — Sunlit Underside",
    description: "Warm bronze and cream tones, like starling plumage catching afternoon light. Grounded, approachable, Scandinavian warmth.",
    background: { hex: "#FAF6F0", name: "Parchment", role: "Page background" },
    surface: { hex: "#F0E8DB", name: "Warm Linen", role: "Cards, panels" },
    surfaceAlt: { hex: "#E6D9C7", name: "Toasted Oat", role: "Secondary surfaces, hover states" },
    text: { hex: "#2C2520", name: "Charred Bark", role: "Primary text" },
    textSecondary: { hex: "#6B5D52", name: "Driftwood", role: "Secondary text, captions" },
    accent1: { hex: "#7B6B4A", name: "Burnished Bronze", role: "Primary accent, buttons, links" },
    accent2: { hex: "#3D6B6B", name: "Teal Shimmer", role: "Interactive states, badges" },
    accent3: { hex: "#6B4A7B", name: "Plum Iridescence", role: "Highlights, notifications" },
    border: { hex: "#D4C4AF", name: "Flax", role: "Borders, dividers" },
    speckle: { hex: "#FFFDF8", name: "Cream Speckle", role: "Highlights, active states" },
  },
  dark: {
    name: "Dark Mode — Outer Plumage",
    description: "Deep oil-slick iridescence shifting between teal and purple, punctuated by warm speckle highlights. Atmospheric, awe-inspiring.",
    background: { hex: "#0E1214", name: "Midnight Roost", role: "Page background" },
    surface: { hex: "#171D21", name: "Deep Canopy", role: "Cards, panels" },
    surfaceAlt: { hex: "#1E272D", name: "Twilight", role: "Secondary surfaces, hover states" },
    text: { hex: "#EDE6DA", name: "Starlight Cream", role: "Primary text" },
    textSecondary: { hex: "#9B917F", name: "Lichen", role: "Secondary text, captions" },
    accent1: { hex: "#C9A96E", name: "Golden Bronze", role: "Primary accent, buttons, links" },
    accent2: { hex: "#4DA8A0", name: "Iridescent Teal", role: "Interactive states, badges" },
    accent3: { hex: "#9B6BB5", name: "Iridescent Violet", role: "Highlights, notifications" },
    border: { hex: "#2A3339", name: "Wing Edge", role: "Borders, dividers" },
    speckle: { hex: "#F5EDD9", name: "Cream Speckle", role: "Highlights, active states" },
  },
};

const semanticRoles = [
  { label: "Success", light: "#4A7B5A", dark: "#6BAF7E", name: { light: "Forest Moss", dark: "Spring Canopy" } },
  { label: "Warning", light: "#A67B3D", dark: "#D4A054", name: { light: "Amber Bark", dark: "Warm Amber" } },
  { label: "Error", light: "#8B4A4A", dark: "#C47070", name: { light: "Rosehip", dark: "Flushed Berry" } },
  { label: "Info", light: "#3D6B6B", dark: "#4DA8A0", name: { light: "Teal Shimmer", dark: "Iridescent Teal" } },
];

const gradients = [
  { name: "Iridescence Shift", css: "linear-gradient(135deg, #3D6B6B, #6B4A7B)", description: "Teal → purple, like light moving across plumage" },
  { name: "Golden Hour", css: "linear-gradient(135deg, #C9A96E, #7B6B4A)", description: "Bronze gradient for warm interactive moments" },
  { name: "Twilight Roost", css: "linear-gradient(180deg, #171D21, #0E1214)", description: "Subtle depth for dark mode surfaces" },
  { name: "Dawn Warmth", css: "linear-gradient(180deg, #FAF6F0, #E6D9C7)", description: "Gentle warmth for light mode surfaces" },
];

function Swatch({ hex, name, role, size = "normal", isLight }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const isVeryDark = (h) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  };

  const textColor = isVeryDark(hex) ? "#EDE6DA" : "#2C2520";

  return (
    <div
      onClick={handleCopy}
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      }}
    >
      <div
        style={{
          backgroundColor: hex,
          height: size === "large" ? 80 : 56,
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          border: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
          borderBottom: "none",
        }}
      >
        {copied && (
          <span
            style={{
              color: textColor,
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              letterSpacing: "0.05em",
              animation: "fadeIn 0.2s ease",
            }}
          >
            Copied!
          </span>
        )}
      </div>
      <div
        style={{
          padding: "10px 12px",
          backgroundColor: isLight ? "#FFFFFF" : "#1A2028",
          borderRadius: "0 0 10px 10px",
          border: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
          borderTop: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isLight ? "#2C2520" : "#EDE6DA",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: isLight ? "#6B5D52" : "#9B917F",
              letterSpacing: "0.02em",
            }}
          >
            {hex}
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            color: isLight ? "#9B8E7E" : "#6B6158",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {role}
        </span>
      </div>
    </div>
  );
}

function GradientSwatch({ gradient, isLight }) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(gradient.css);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          background: gradient.css,
          height: 48,
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {copied && (
          <span
            style={{
              color: "#EDE6DA",
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
            }}
          >
            Copied!
          </span>
        )}
      </div>
      <div
        style={{
          padding: "10px 12px",
          backgroundColor: isLight ? "#FFFFFF" : "#1A2028",
          borderRadius: "0 0 10px 10px",
          border: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
          borderTop: "none",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isLight ? "#2C2520" : "#EDE6DA",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 2,
          }}
        >
          {gradient.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: isLight ? "#9B8E7E" : "#6B6158",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {gradient.description}
        </div>
      </div>
    </div>
  );
}

function MiniPreview({ mode, isLight }) {
  const p = palettes[mode];
  return (
    <div
      style={{
        backgroundColor: p.background.hex,
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${p.border.hex}`,
        maxWidth: 300,
      }}
    >
      <div style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: p.textSecondary.hex, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
        Preview — {mode} mode
      </div>

      {/* Mini card */}
      <div
        style={{
          backgroundColor: p.surface.hex,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          border: `1px solid ${p.border.hex}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${p.accent2.hex}, ${p.accent3.hex})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🐦
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: p.text.hex, fontFamily: "'DM Sans', sans-serif" }}>
              European Starling
            </div>
            <div style={{ fontSize: 10, color: p.textSecondary.hex, fontFamily: "'DM Sans', sans-serif" }}>
              Sturnus vulgaris · Base game
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
              backgroundColor: p.accent2.hex + "22",
              color: p.accent2.hex,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Seen
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
              backgroundColor: p.accent3.hex + "22",
              color: p.accent3.hex,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Played
          </span>
          <span
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
              backgroundColor: p.accent1.hex + "22",
              color: p.accent1.hex,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Favorite
          </span>
        </div>
      </div>

      {/* Mini button */}
      <div
        style={{
          backgroundColor: p.accent1.hex,
          color: mode === "light" ? "#FAF6F0" : "#0E1214",
          textAlign: "center",
          padding: "10px 16px",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        Find birds near me
      </div>
    </div>
  );
}

export default function MurmurationPalette() {
  const [activeMode, setActiveMode] = useState("light");
  const isLight = activeMode === "light";
  const p = palettes[activeMode];
  const colorKeys = Object.keys(p).filter((k) => k !== "name" && k !== "description");

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: isLight ? "#FAF6F0" : "#0E1214",
        minHeight: "100vh",
        transition: "background-color 0.5s ease",
        padding: "40px 24px",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=IBM+Plex+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 12,
            }}
          >
            Brand Color System v1.0
          </div>
          <h1
            style={{
              fontSize: 42,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: isLight ? "#2C2520" : "#EDE6DA",
              margin: 0,
              marginBottom: 6,
              lineHeight: 1.1,
            }}
          >
            Murmuration
          </h1>
          <p
            style={{
              fontSize: 14,
              color: isLight ? "#6B5D52" : "#9B917F",
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            A color system drawn from European Starling plumage — iridescent outer feathers for dark mode, warm sunlit underside for light mode. The same bird, seen from two angles.
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: isLight ? "#E6D9C7" : "#1E272D",
            borderRadius: 10,
            padding: 3,
            marginBottom: 36,
          }}
        >
          {["light", "dark"].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.03em",
                backgroundColor: activeMode === mode ? (isLight ? "#FAF6F0" : "#2A3339") : "transparent",
                color: activeMode === mode ? (isLight ? "#2C2520" : "#EDE6DA") : (isLight ? "#9B8E7E" : "#6B6158"),
                transition: "all 0.3s ease",
                boxShadow: activeMode === mode ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {mode === "light" ? "☀ Light" : "◑ Dark"}
            </button>
          ))}
        </div>

        {/* Mode Description */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: isLight ? "#F0E8DB" : "#171D21",
            borderRadius: 12,
            marginBottom: 36,
            borderLeft: `3px solid ${isLight ? "#7B6B4A" : "#C9A96E"}`,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isLight ? "#2C2520" : "#EDE6DA",
              marginBottom: 4,
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: isLight ? "#6B5D52" : "#9B917F",
              lineHeight: 1.5,
            }}
          >
            {p.description}
          </div>
        </div>

        {/* Core Palette */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 16,
            }}
          >
            Core Palette
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
              gap: 12,
            }}
          >
            {colorKeys.map((key) => (
              <Swatch
                key={key}
                hex={p[key].hex}
                name={p[key].name}
                role={p[key].role}
                isLight={isLight}
                size={key === "background" || key === "text" ? "large" : "normal"}
              />
            ))}
          </div>
        </div>

        {/* Semantic Colors */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 16,
            }}
          >
            Semantic Colors
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {semanticRoles.map((s) => (
              <Swatch
                key={s.label}
                hex={isLight ? s.light : s.dark}
                name={s.name[activeMode]}
                role={s.label}
                isLight={isLight}
              />
            ))}
          </div>
        </div>

        {/* Gradients */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 16,
            }}
          >
            Iridescent Gradients
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {gradients.map((g) => (
              <GradientSwatch key={g.name} gradient={g} isLight={isLight} />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 16,
            }}
          >
            Component Preview
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <MiniPreview mode="light" isLight={isLight} />
            <MiniPreview mode="dark" isLight={isLight} />
          </div>
        </div>

        {/* Typography suggestion */}
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: isLight ? "#F0E8DB" : "#171D21",
            borderRadius: 12,
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#9B8E7E" : "#6B6158",
              marginBottom: 14,
            }}
          >
            Typography Pairing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: isLight ? "#2C2520" : "#EDE6DA",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Playfair Display
              </span>
              <span style={{ fontSize: 11, color: isLight ? "#9B8E7E" : "#6B6158", fontFamily: "'IBM Plex Mono', monospace" }}>
                Display / Headlines — elegant, editorial, nature-journal feel
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 400,
                  color: isLight ? "#2C2520" : "#EDE6DA",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                DM Sans — clean and friendly for body text
              </span>
              <span style={{ fontSize: 11, color: isLight ? "#9B8E7E" : "#6B6158", fontFamily: "'IBM Plex Mono', monospace" }}>
                Body / UI — Scandinavian-clean, warm readability
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  fontWeight: 400,
                  color: isLight ? "#2C2520" : "#EDE6DA",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                IBM Plex Mono — data, labels, stats
              </span>
              <span style={{ fontSize: 11, color: isLight ? "#9B8E7E" : "#6B6158", fontFamily: "'IBM Plex Mono', monospace" }}>
                Mono / Data — game stats, bird taxonomy, metadata
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: isLight ? "#C4B8A6" : "#2A3339",
            fontFamily: "'IBM Plex Mono', monospace",
            paddingTop: 20,
            borderTop: `1px solid ${isLight ? "#E6D9C7" : "#1E272D"}`,
          }}
        >
          Click any swatch to copy its hex value · Murmuration Brand System · 2026
        </div>
      </div>
    </div>
  );
}
