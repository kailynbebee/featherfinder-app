import { useState, useEffect, useRef } from "react";

/* ───────────── palette ───────────── */
const C = {
  bg: "#0E1214",
  surface: "#171D21",
  surfaceAlt: "#1E272D",
  text: "#EDE6DA",
  textSec: "#9B917F",
  accent1: "#C9A96E",
  accent2: "#4DA8A0",
  accent3: "#9B6BB5",
  border: "#2A3339",
  speckle: "#F5EDD9",
  success: "#6BAF7E",
  gradIridescent: "linear-gradient(135deg, #3D6B6B, #6B4A7B)",
  gradTwilight: "linear-gradient(180deg, #1A2028 0%, #0E1214 100%)",
};

/* ───────────── mock data ───────────── */
const BIRDS = [
  { id: 1, name: "European Starling", sci: "Sturnus vulgaris", set: "Base", habitat: "Grassland", food: "Invertebrate", points: 1, eggs: 5, nest: "Cavity", wingspan: 39, power: "When Activated: Gain 1 food from the birdfeeder.", sightings: 47, lastSeen: "2 hrs ago", played: 312, favorited: 189 },
  { id: 2, name: "Steller's Jay", sci: "Cyanocitta stelleri", set: "Base", habitat: "Forest", food: "Seed", points: 5, eggs: 2, nest: "Platform", wingspan: 48, power: "When Played: Tuck a card from your hand behind this bird.", sightings: 23, lastSeen: "Today", played: 245, favorited: 201 },
  { id: 3, name: "Anna's Hummingbird", sci: "Calypte anna", set: "Base", habitat: "Grassland", food: "Nectar", points: 4, eggs: 2, nest: "Platform", wingspan: 12, power: "When Activated: Lay 1 egg on this bird.", sightings: 31, lastSeen: "1 hr ago", played: 402, favorited: 378 },
  { id: 4, name: "Red-tailed Hawk", sci: "Buteo jamaicensis", set: "Base", habitat: "Grassland", food: "Rodent", points: 5, eggs: 2, nest: "Platform", wingspan: 122, power: "When Activated: Look at a bird from the deck. If its wingspan is less than 75cm, tuck it behind this bird.", sightings: 12, lastSeen: "Yesterday", played: 198, favorited: 267 },
  { id: 5, name: "Dark-eyed Junco", sci: "Junco hyemalis", set: "Base", habitat: "Grassland", food: "Seed", points: 3, eggs: 3, nest: "Ground", wingspan: 24, power: "When Activated: All players gain 1 seed from the supply.", sightings: 58, lastSeen: "30 min ago", played: 156, favorited: 134 },
  { id: 6, name: "Barn Owl", sci: "Tyto alba", set: "Base", habitat: "Grassland", food: "Rodent", points: 5, eggs: 3, nest: "Cavity", wingspan: 110, power: "When Activated: Look at a bird from the deck. If it has a rodent cost, tuck it behind this bird.", sightings: 3, lastSeen: "3 days ago", played: 287, favorited: 341 },
  { id: 7, name: "Spotted Towhee", sci: "Pipilo maculatus", set: "Oceania", habitat: "Forest", food: "Invertebrate", points: 4, eggs: 3, nest: "Ground", wingspan: 27, power: "When Activated: Gain 1 invertebrate from the supply.", sightings: 19, lastSeen: "Today", played: 89, favorited: 72 },
  { id: 8, name: "American Robin", sci: "Turdus migratorius", set: "Base", habitat: "Grassland", food: "Invertebrate", points: 1, eggs: 4, nest: "Platform", wingspan: 37, power: "When Activated: Lay 1 egg on this bird.", sightings: 64, lastSeen: "1 hr ago", played: 178, favorited: 145 },
];

const HABITAT_ICONS = { Grassland: "🌿", Forest: "🌲", Wetland: "💧" };
const FOOD_ICONS = { Seed: "🌾", Invertebrate: "🐛", Nectar: "🌸", Rodent: "🐁", Fish: "🐟", Fruit: "🍒" };

/* ───────────── components ───────────── */

function SpeckleField({ count = 30 }) {
  const dots = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.05,
      delay: Math.random() * 6,
    }))
  ).current;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            backgroundColor: C.speckle,
            opacity: d.opacity,
            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function StampBorder({ children, size = 120 }) {
  const scallops = 14;
  const r = 5;
  const clipPoints = [];
  for (let i = 0; i < scallops * 4; i++) {
    const side = Math.floor(i / scallops);
    const pos = (i % scallops) / scallops;
    const mid = ((i % scallops) + 0.5) / scallops;
    let x, y, mx, my;
    if (side === 0) { x = pos * 100; y = 0; mx = mid * 100; my = -r; }
    else if (side === 1) { x = 100; y = pos * 100; mx = 100 + r; my = mid * 100; }
    else if (side === 2) { x = (1 - pos) * 100; y = 100; mx = (1 - mid) * 100; my = 100 + r; }
    else { x = 0; y = (1 - pos) * 100; mx = -r; my = (1 - mid) * 100; }
    clipPoints.push(`${x}% ${y}%`);
  }

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: -3,
          background: C.gradIridescent,
          borderRadius: 8,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 6,
          overflow: "hidden",
          border: `2px solid ${C.accent1}44`,
        }}
      >
        {children}
      </div>
      {/* Corner stamps */}
      {[
        { top: -2, left: -2 },
        { top: -2, right: -2 },
        { bottom: -2, left: -2 },
        { bottom: -2, right: -2 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: C.accent1,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

function BirdPlaceholder({ name, index }) {
  const colors = [
    ["#2A4A4A", "#1A3333"],
    ["#3A2A4A", "#251A33"],
    ["#4A3A2A", "#33251A"],
    ["#2A3A4A", "#1A2533"],
    ["#3A4A2A", "#25331A"],
    ["#4A2A3A", "#331A25"],
    ["#2A4A3A", "#1A3325"],
    ["#3A2A2A", "#251A1A"],
  ];
  const [c1, c2] = colors[index % colors.length];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
      }}
    >
      {["🐦", "🪶", "🦅", "🦉", "🐤", "🦆", "🕊️", "🦜"][index % 8]}
    </div>
  );
}

function Tag({ label, color, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: small ? 10 : 11,
        padding: small ? "2px 7px" : "3px 10px",
        borderRadius: 20,
        backgroundColor: color + "1A",
        color: color,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 0",
        flex: 1,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
      <span style={{ fontSize: 9, color: C.textSec, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

/* ───────────── screens ───────────── */

function WelcomeScreen({ onNavigate }) {
  const [zip, setZip] = useState("");
  const [focused, setFocused] = useState(false);
  const valid = /^\d{5}$/.test(zip);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate("list");
    }, 1800);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <SpeckleField count={40} />

      {/* Atmospheric gradient top */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 260,
          background: "radial-gradient(ellipse at 50% 0%, #1A3333 0%, transparent 70%)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ padding: "52px 24px 0", position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.accent2,
            marginBottom: 12,
            opacity: 0.8,
          }}
        >
          Murmuration
        </div>
      </div>

      {/* Center content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
          marginTop: -40,
        }}
      >
        {/* Bird silhouette cluster */}
        <div style={{ marginBottom: 32, fontSize: 48, lineHeight: 1, opacity: 0.9 }}>
          <span style={{ filter: "brightness(0.8)" }}>🐦‍⬛</span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: C.text,
            margin: 0,
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          Discover the birds
          <br />
          <span style={{ 
            background: "linear-gradient(135deg, #4DA8A0, #9B6BB5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            in your world
          </span>
        </h1>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: C.textSec,
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 280,
            marginBottom: 36,
          }}
        >
          See which Wingspan birds have been spotted near you — and find awe in your own backyard.
        </p>

        {/* Input group */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: C.surface,
              borderRadius: 14,
              padding: "4px 4px 4px 16px",
              border: `1.5px solid ${focused ? C.accent2 + "88" : C.border}`,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              boxShadow: focused ? `0 0 20px ${C.accent2}15` : "none",
            }}
          >
            <span style={{ fontSize: 16, opacity: 0.5 }}>📍</span>
            <input
              type="text"
              placeholder="Enter your zip code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: C.text,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                padding: "12px 0",
                letterSpacing: "0.03em",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!valid || loading}
              style={{
                padding: "12px 20px",
                borderRadius: 11,
                border: "none",
                backgroundColor: valid ? C.accent1 : C.surfaceAlt,
                color: valid ? C.bg : C.textSec + "66",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: valid ? "pointer" : "default",
                transition: "all 0.3s ease",
                opacity: loading ? 0.7 : 1,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Finding..." : "Find birds"}
            </button>
          </div>
        </div>

        {/* Or use location */}
        <button
          onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onNavigate("list"); }, 1800); }}
          style={{
            background: "none",
            border: "none",
            color: C.accent2,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: loading ? 0.4 : 0.8,
          }}
        >
          <span style={{ fontSize: 12 }}>◎</span> Use my current location
        </button>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          padding: "20px 24px 32px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: C.textSec,
            fontFamily: "'IBM Plex Mono', monospace",
            opacity: 0.5,
            letterSpacing: "0.04em",
          }}
        >
          Powered by eBird · Not affiliated with Wingspan
        </span>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: C.bg + "CC",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div style={{ position: "relative", width: 60, height: 60, marginBottom: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: i * 8,
                  border: `1.5px solid ${C.accent2}`,
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: `spin ${1.2 + i * 0.4}s linear infinite ${i === 1 ? "reverse" : ""}`,
                  opacity: 1 - i * 0.25,
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSec }}>
            Scanning nearby sightings...
          </span>
        </div>
      )}
    </div>
  );
}

function BirdListScreen({ onNavigate, onSelectBird }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Base", "Oceania"];
  const filtered = filter === "All" ? BIRDS : BIRDS.filter((b) => b.set === filter);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Top bar */}
      <div
        style={{
          padding: "48px 20px 16px",
          background: C.gradTwilight,
          position: "relative",
        }}
      >
        <SpeckleField count={15} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <button
            onClick={() => onNavigate("welcome")}
            style={{
              background: "none",
              border: "none",
              color: C.textSec,
              fontSize: 18,
              cursor: "pointer",
              padding: "4px 8px",
              marginLeft: -8,
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: 9,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.accent2,
            }}
          >
            Murmuration
          </span>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, marginTop: 12 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              marginBottom: 4,
            }}
          >
            Forest Grove, OR
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSec, margin: 0, marginBottom: 14 }}>
            {BIRDS.length} Wingspan birds spotted nearby · 97116
          </p>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${filter === f ? C.accent1 + "66" : C.border}`,
                  backgroundColor: filter === f ? C.accent1 + "1A" : "transparent",
                  color: filter === f ? C.accent1 : C.textSec,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bird list */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((bird, i) => (
            <div
              key={bird.id}
              onClick={() => onSelectBird(bird)}
              style={{
                display: "flex",
                gap: 14,
                padding: 12,
                backgroundColor: C.surface,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                transition: "transform 0.15s ease, border-color 0.2s ease",
                animation: `slideUp 0.4s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.borderColor = C.accent2 + "44";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
              }}
            >
              <StampBorder size={72}>
                <BirdPlaceholder name={bird.name} index={i} />
              </StampBorder>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                      {bird.name}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.textSec, marginBottom: 8, fontStyle: "italic" }}>
                      {bird.sci}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.accent2, opacity: 0.7, whiteSpace: "nowrap", marginTop: 2 }}>
                    {bird.lastSeen}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <Tag label={`${HABITAT_ICONS[bird.habitat] || "🌍"} ${bird.habitat}`} color={C.accent2} small />
                  <Tag label={bird.set} color={C.accent1} small />
                  <Tag label={`${bird.points} pts`} color={C.accent3} small />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BirdDetailScreen({ bird, onNavigate }) {
  const [states, setStates] = useState({ seen: false, wantSee: false, played: false });

  const toggleState = (key) => setStates((s) => ({ ...s, [key]: !s[key] }));

  const stateButtons = [
    { key: "seen", label: "Seen", icon: "👁", activeColor: C.accent2 },
    { key: "wantSee", label: "Want to See", icon: "✦", activeColor: C.accent1 },
    { key: "played", label: "Played", icon: "🃏", activeColor: C.accent3 },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "auto" }}>
      {/* Hero image area */}
      <div style={{ position: "relative", height: 240, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, #1A3333, #251A33)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 72, opacity: 0.8 }}>
            {["🐦", "🪶", "🦅", "🦉", "🐤", "🦆", "🕊️", "🦜"][bird.id % 8]}
          </span>
          <SpeckleField count={20} />
        </div>
        {/* Gradient overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(transparent, ${C.bg})` }} />
        {/* Back button */}
        <button
          onClick={() => onNavigate("list")}
          style={{
            position: "absolute",
            top: 44,
            left: 16,
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            backgroundColor: C.bg + "AA",
            backdropFilter: "blur(8px)",
            color: C.text,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          ←
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px 32px", marginTop: -24, position: "relative", zIndex: 1 }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Tag label={bird.set} color={C.accent1} />
            <Tag label={`${bird.sightings} recent sightings`} color={C.accent2} />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              color: C.text,
              margin: "8px 0 2px",
              lineHeight: 1.15,
            }}
          >
            {bird.name}
          </h1>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.textSec, fontStyle: "italic" }}>
            {bird.sci}
          </span>
        </div>

        {/* Toggle buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {stateButtons.map((btn) => {
            const active = states[btn.key];
            return (
              <button
                key={btn.key}
                onClick={() => toggleState(btn.key)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  borderRadius: 12,
                  border: `1.5px solid ${active ? btn.activeColor + "66" : C.border}`,
                  backgroundColor: active ? btn.activeColor + "15" : C.surface,
                  color: active ? btn.activeColor : C.textSec,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>{btn.icon}</span>
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Game stats */}
        <div
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: "4px 8px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "10px 8px 4px",
              fontSize: 9,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.textSec,
            }}
          >
            Wingspan Stats
          </div>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            <StatPill icon={HABITAT_ICONS[bird.habitat]} label="Habitat" value={bird.habitat} />
            <StatPill icon={FOOD_ICONS[bird.food]} label="Food" value={bird.food} />
            <StatPill icon="⭐" label="Points" value={bird.points} />
          </div>
          <div style={{ display: "flex" }}>
            <StatPill icon="🥚" label="Eggs" value={bird.eggs} />
            <StatPill icon="🪹" label="Nest" value={bird.nest} />
            <StatPill icon="📏" label="Span" value={`${bird.wingspan}cm`} />
          </div>
        </div>

        {/* Power */}
        <div
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.accent3,
              marginBottom: 8,
            }}
          >
            Bird Power
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: C.text,
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {bird.power}
          </p>
        </div>

        {/* Community stats */}
        <div
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.textSec,
              marginBottom: 12,
            }}
          >
            Community
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, color: C.accent1, marginBottom: 2 }}>
                {bird.favorited}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSec }}>favorited this bird</div>
            </div>
            <div style={{ width: 1, backgroundColor: C.border }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, color: C.accent3, marginBottom: 2 }}>
                {bird.played}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSec }}>played this card</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── app shell ───────────── */

export default function MurmurationMVP() {
  const [screen, setScreen] = useState("welcome");
  const [selectedBird, setSelectedBird] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const navigate = (to) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(to);
      setTransitioning(false);
    }, 200);
  };

  const selectBird = (bird) => {
    setSelectedBird(bird);
    navigate("detail");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#080A0C",
        padding: "24px 16px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes twinkle {
          0%, 100% { opacity: 0.05; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        input::placeholder { color: #6B6158; }
      `}</style>

      {/* Screen label */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
          zIndex: 100,
        }}
      >
        {[
          { id: "welcome", label: "1 — Welcome" },
          { id: "list", label: "2 — Bird List" },
          { id: "detail", label: "3 — Detail" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => {
              if (s.id === "detail" && !selectedBird) {
                setSelectedBird(BIRDS[0]);
              }
              navigate(s.id);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: `1px solid ${screen === s.id ? C.accent1 + "66" : "#333"}`,
              backgroundColor: screen === s.id ? C.accent1 + "22" : "#1A1A1A",
              color: screen === s.id ? C.accent1 : "#666",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              cursor: "pointer",
              letterSpacing: "0.03em",
              transition: "all 0.2s ease",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div
        style={{
          width: 375,
          height: 812,
          borderRadius: 40,
          overflow: "hidden",
          backgroundColor: C.bg,
          position: "relative",
          boxShadow: `0 0 0 1px #2A2A2A, 0 20px 80px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 150,
            height: 30,
            backgroundColor: "#000",
            borderRadius: "0 0 20px 20px",
            zIndex: 50,
          }}
        />

        <div
          style={{
            height: "100%",
            opacity: transitioning ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {screen === "welcome" && <WelcomeScreen onNavigate={navigate} />}
          {screen === "list" && <BirdListScreen onNavigate={navigate} onSelectBird={selectBird} />}
          {screen === "detail" && selectedBird && <BirdDetailScreen bird={selectedBird} onNavigate={navigate} />}
        </div>
      </div>
    </div>
  );
}
