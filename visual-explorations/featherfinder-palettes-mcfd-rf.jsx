import { useState } from "react";

const palettes = {
  mcfd: {
    name: "Many-Colored Fruit Dove",
    subtitle: "Clean, bright, map-forward",
    bgDescription: "Pure white canvas — lets the map and data breathe",
    colors: [
      { name: "White Canvas", hex: "#FFFFFF", role: "Background", text: "#1a1a1a" },
      { name: "Deep Magenta", hex: "#8C1A4A", role: "Heat High / Headers", text: "#fff" },
      { name: "Warm Salmon", hex: "#D4607A", role: "Heat Medium", text: "#fff" },
      { name: "Rosy Pink", hex: "#E8A0B0", role: "Heat Low / Soft accent", text: "#1a1a1a" },
      { name: "Butter Yellow", hex: "#E8D868", role: "Highlight / Badge", text: "#1a1a1a" },
      { name: "Chartreuse", hex: "#C8D84C", role: "Tertiary / Transition", text: "#1a1a1a" },
      { name: "Fresh Green", hex: "#4CAF50", role: "Primary CTA", text: "#fff" },
      { name: "Leaf Green", hex: "#2E7D32", role: "CTA Hover / Active", text: "#fff" },
      { name: "Soft Gray", hex: "#F5F5F5", role: "Card / Surface", text: "#1a1a1a" },
      { name: "Charcoal", hex: "#2D2D2D", role: "Body text", text: "#fff" },
    ],
    heatGradient: ["#E8A0B0", "#D4607A", "#8C1A4A"],
    accent: "#4CAF50",
    accentHover: "#2E7D32",
    bg: "#FFFFFF",
    surface: "#F5F5F5",
    text: "#2D2D2D",
    textLight: "#666",
  },
  rf: {
    name: "Royal Flycatcher",
    subtitle: "Warm, textured, field-guide feel — with jungle teal",
    bgDescription: "Warm cream base — feels like a naturalist's notebook",
    colors: [
      { name: "Warm Cream", hex: "#F5F0E8", role: "Background", text: "#1a1a1a" },
      { name: "Flycatcher Red", hex: "#D94420", role: "Primary / CTA", text: "#fff" },
      { name: "Burnt Orange", hex: "#BF5B2E", role: "CTA Hover / Warm accent", text: "#fff" },
      { name: "Jungle Teal", hex: "#2A8C82", role: "Secondary / CTA alt", text: "#fff" },
      { name: "Deep Teal", hex: "#1B6B63", role: "Headers / Nav", text: "#fff" },
      { name: "Warm Tan", hex: "#C4B396", role: "Borders / Dividers", text: "#1a1a1a" },
      { name: "Deep Brown", hex: "#4A3728", role: "Body text", text: "#fff" },
      { name: "Dot Black", hex: "#1A1A1A", role: "Polka dot accent", text: "#fff" },
      { name: "Parchment", hex: "#FAF6EF", role: "Card / Surface", text: "#1a1a1a" },
      { name: "Ivory White", hex: "#FFFDF8", role: "Input / Light surface", text: "#1a1a1a" },
    ],
    heatGradient: ["#C4B396", "#BF5B2E", "#D94420"],
    accent: "#D94420",
    accentHover: "#BF5B2E",
    bg: "#F5F0E8",
    surface: "#FAF6EF",
    text: "#4A3728",
    textLight: "#7A6B5A",
  },
};

function DotPattern({ color = "#1A1A1A", opacity = 0.08 }) {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill={color} opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

function HeatBar({ colors, label }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 28 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, color: i === 0 ? "#666" : "#fff", opacity: 0.8 }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMockup({ palette, id }) {
  const p = palettes[palette];
  const isMcfd = palette === "mcfd";

  return (
    <div style={{
      background: p.bg,
      borderRadius: 16,
      padding: 20,
      position: "relative",
      overflow: "hidden",
      border: `1px solid ${isMcfd ? "#e0e0e0" : "#d4c9b8"}`,
      minHeight: 320,
    }}>
      {!isMcfd && <DotPattern color="#4A3728" opacity={0.05} />}

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative" }}>
        <div style={{
          fontFamily: isMcfd ? "'DM Sans', sans-serif" : "'Libre Baskerville', Georgia, serif",
          fontWeight: 700,
          fontSize: 16,
          color: p.text,
          letterSpacing: isMcfd ? "-0.01em" : "0.01em",
        }}>
          {isMcfd ? "🪶 " : ""}FeatherFinder
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: p.accent, display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 12,
        }}>
          ☰
        </div>
      </div>

      {/* Search */}
      <div style={{
        background: p.surface,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 14,
        border: `1px solid ${isMcfd ? "#e8e8e8" : "#d4c9b8"}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        position: "relative",
      }}>
        <span style={{ opacity: 0.4 }}>🔍</span>
        <span style={{ color: p.textLight, fontSize: 13 }}>Search species near Forest Grove...</span>
      </div>

      {/* Map placeholder */}
      <div style={{
        borderRadius: 10,
        height: 100,
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
        background: isMcfd
          ? "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 40%, #fff9c4 100%)"
          : "linear-gradient(135deg, #e8e0d4 0%, #f0ebe0 60%, #f5f0e8 100%)",
      }}>
        {/* Heat dots */}
        {[
          { x: 25, y: 30, size: 28, intensity: 2 },
          { x: 60, y: 50, size: 22, intensity: 1 },
          { x: 45, y: 70, size: 16, intensity: 0 },
          { x: 75, y: 35, size: 20, intensity: 1 },
        ].map((dot, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${dot.x}%`, top: `${dot.y}%`,
            width: dot.size, height: dot.size,
            borderRadius: "50%",
            background: p.heatGradient[dot.intensity],
            opacity: 0.6,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${dot.size / 2}px ${p.heatGradient[dot.intensity]}40`,
          }} />
        ))}
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          fontSize: 9, color: p.textLight, opacity: 0.6,
          background: `${p.bg}cc`, padding: "2px 6px", borderRadius: 4,
        }}>
          eBird sightings
        </div>
      </div>

      {/* Bird card */}
      <div style={{
        background: p.surface,
        borderRadius: 10,
        padding: 12,
        display: "flex",
        gap: 12,
        alignItems: "center",
        border: `1px solid ${isMcfd ? "#e8e8e8" : "#d4c9b8"}`,
        position: "relative",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8,
          background: isMcfd
            ? "linear-gradient(135deg, #C8D84C, #4CAF50)"
            : "linear-gradient(135deg, #C4B396, #2A8C82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
          border: isMcfd ? "none" : "2px solid #d4c9b8",
        }}>
          🐦
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: p.text,
            fontFamily: isMcfd ? "'DM Sans', sans-serif" : "'Libre Baskerville', Georgia, serif",
          }}>
            Anna's Hummingbird
          </div>
          <div style={{ fontSize: 11, color: p.textLight, fontStyle: "italic" }}>
            Calypte anna · Spotted today
          </div>
        </div>
        <div style={{
          background: p.accent,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 20,
          letterSpacing: "0.03em",
        }}>
          VIEW
        </div>
      </div>

      {/* CTA */}
      <button style={{
        width: "100%",
        marginTop: 14,
        padding: "12px 0",
        background: p.accent,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        fontFamily: isMcfd ? "'DM Sans', sans-serif" : "'Libre Baskerville', Georgia, serif",
        letterSpacing: "0.02em",
        position: "relative",
      }}>
        Find Birds Near Me
      </button>
    </div>
  );
}

export default function FeatherFinderPalettes() {
  const [active, setActive] = useState("mcfd");

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      minHeight: "100vh",
      background: "#fafaf8",
      padding: "32px 20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, margin: 0, color: "#1a1a1a",
          letterSpacing: "-0.02em",
        }}>
          FeatherFinder Palettes
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
          Color exploration from two source birds
        </p>
      </div>

      {/* Toggle */}
      <div style={{
        display: "flex",
        gap: 4,
        background: "#eee",
        borderRadius: 12,
        padding: 4,
        maxWidth: 480,
        margin: "0 auto 32px",
      }}>
        {Object.entries(palettes).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: active === key ? 700 : 500,
              fontSize: 13,
              background: active === key ? "#fff" : "transparent",
              color: active === key ? "#1a1a1a" : "#888",
              boxShadow: active === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Palette info */}
        <div style={{
          background: palettes[active].bg,
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          border: `1px solid ${active === "mcfd" ? "#e0e0e0" : "#d4c9b8"}`,
          position: "relative",
          overflow: "hidden",
        }}>
          {active === "rf" && <DotPattern color="#4A3728" opacity={0.04} />}
          <div style={{ position: "relative" }}>
            <h2 style={{
              fontSize: 20, fontWeight: 700, margin: "0 0 4px",
              color: palettes[active].text,
              fontFamily: active === "rf" ? "'Libre Baskerville', Georgia, serif" : undefined,
            }}>
              {palettes[active].name}
            </h2>
            <p style={{
              color: palettes[active].textLight,
              fontSize: 13, margin: "0 0 16px",
              fontStyle: active === "rf" ? "italic" : undefined,
            }}>
              {palettes[active].subtitle}
            </p>

            {/* Color swatches */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
              {palettes[active].colors.map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 10,
                    background: c.hex,
                    border: c.hex === "#FFFFFF" || c.hex === "#FFFDF8" || c.hex === "#FAF6EF" || c.hex === "#F5F0E8" || c.hex === "#F5F5F5"
                      ? "1px solid #ddd" : "none",
                    marginBottom: 4,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }} />
                  <div style={{ fontSize: 9, fontWeight: 600, color: palettes[active].text, lineHeight: 1.2 }}>{c.name}</div>
                  <div style={{ fontSize: 8, color: palettes[active].textLight, marginTop: 1 }}>{c.hex}</div>
                  <div style={{
                    fontSize: 8, color: palettes[active].accent, fontWeight: 600, marginTop: 2,
                    opacity: 0.8,
                  }}>{c.role}</div>
                </div>
              ))}
            </div>

            <HeatBar colors={palettes[active].heatGradient} label="Heat map gradient (fewer → more sightings)" />

            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: active === "mcfd" ? "#f0f9f0" : "#f5efe5",
              borderRadius: 8,
              fontSize: 12,
              color: palettes[active].text,
              lineHeight: 1.5,
            }}>
              <strong>Background:</strong> {palettes[active].bgDescription}
            </div>
          </div>
        </div>

        {/* Mini mockup */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#999", fontWeight: 600, marginBottom: 8, paddingLeft: 4,
          }}>
            Quick mockup preview
          </div>
          <MiniMockup palette={active} />
        </div>

        {/* Comparison notes */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          marginTop: 20,
          border: "1px solid #e8e8e8",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "#1a1a1a" }}>
            Quick comparison
          </h3>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <td style={{ padding: "8px 4px", fontWeight: 700, color: "#999", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}></td>
                <td style={{ padding: "8px 4px", fontWeight: 700, color: "#999", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fruit Dove</td>
                <td style={{ padding: "8px 4px", fontWeight: 700, color: "#999", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Royal Flycatcher</td>
              </tr>
            </thead>
            <tbody>
              {[
                ["Vibe", "Modern, clean, data-first", "Warm, editorial, field-guide"],
                ["Map feel", "Bright & clinical — sightings pop", "Earthy & exploratory — treasure map"],
                ["Heat map", "Salmon → Magenta (intuitive)", "Tan → Burnt Orange (organic)"],
                ["Typography", "Sans-serif (DM Sans etc.)", "Serif pairs well (Baskerville etc.)"],
                ["Texture", "Flat & minimal", "Polka dot pattern, paper grain"],
                ["Accent", "Fresh green CTA", "Jungle teal + red-orange"],
                ["Accessibility", "High contrast on white", "Needs care with warm-on-warm"],
              ].map(([label, a, b], i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "8px 4px", fontWeight: 600, color: "#555" }}>{label}</td>
                  <td style={{ padding: "8px 4px", color: "#444" }}>{a}</td>
                  <td style={{ padding: "8px 4px", color: "#444" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
