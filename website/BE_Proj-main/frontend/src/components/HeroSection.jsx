import { Search, MapPin, Sparkles, Star, Shield, LogIn, UserPlus, Languages } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../redux/workSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ─────────────── GLOBE CANVAS COMPONENT ─────────────── */
const GlobeBackground = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    rotation: 0,
    zoom: 1,
    zoomPhase: "revolve", // revolve → zoomIn → hold → zoomOut → revolve
    phaseTimer: 0,
    stars: [],
    dots: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate background stars
    const s = stateRef.current;
    s.stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    // Simplified lat/lon dots for globe (major land masses + India highlight)
    const landDots = [];
    // India region: lat 8–37, lon 68–97
    for (let lat = -80; lat <= 80; lat += 4) {
      for (let lon = -180; lon <= 180; lon += 4) {
        const isIndia = lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97;
        const isLand = checkLandMass(lat, lon);
        if (isLand) {
          landDots.push({ lat, lon, india: isIndia });
        }
      }
    }
    s.dots = landDots;

    const FPS = 60;
    let last = 0;

    const draw = (timestamp) => {
      const dt = Math.min((timestamp - last) / 1000, 0.05);
      last = timestamp;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Deep space background gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
      bg.addColorStop(0, "#04061a");
      bg.addColorStop(0.5, "#020510");
      bg.addColorStop(1, "#010208");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      s.stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
        ctx.fill();
      });

      // Phase logic
      s.phaseTimer += dt;
      if (s.zoomPhase === "revolve") {
        s.rotation += dt * 0.18;
        if (s.phaseTimer > 5) { s.zoomPhase = "zoomIn"; s.phaseTimer = 0; }
      } else if (s.zoomPhase === "zoomIn") {
        s.zoom += dt * 0.55;
        if (s.zoom >= 2.4) { s.zoomPhase = "hold"; s.phaseTimer = 0; }
      } else if (s.zoomPhase === "hold") {
        s.rotation += dt * 0.04;
        if (s.phaseTimer > 2.5) { s.zoomPhase = "zoomOut"; s.phaseTimer = 0; }
      } else if (s.zoomPhase === "zoomOut") {
        s.zoom -= dt * 0.35;
        s.rotation += dt * 0.1;
        if (s.zoom <= 1) { s.zoom = 1; s.zoomPhase = "revolve"; s.phaseTimer = 0; }
      }

      // Globe parameters
      const cx = W * 0.5;
      const cy = H * 0.52;
      const radius = Math.min(W, H) * 0.32 * s.zoom;

      // Outer glow ring (tricolor aura)
      const glowSteps = [
        { r: radius * 1.35, color: "rgba(255,153,51,0.08)" },
        { r: radius * 1.22, color: "rgba(255,255,255,0.06)" },
        { r: radius * 1.12, color: "rgba(19,136,8,0.08)" },
      ];
      glowSteps.forEach(({ r, color }) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 12;
        ctx.stroke();
      });

      // Globe base gradient (deep ocean)
      const globeGrad = ctx.createRadialGradient(
        cx - radius * 0.28, cy - radius * 0.25, radius * 0.05,
        cx, cy, radius
      );
      globeGrad.addColorStop(0, "#1a3a6b");
      globeGrad.addColorStop(0.4, "#0d2247");
      globeGrad.addColorStop(0.85, "#071530");
      globeGrad.addColorStop(1, "#030b1a");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();

      // Clip future draws to globe circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
      ctx.clip();

      // Grid lines (latitude / longitude)
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.5;
      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy + Math.sin(latRad) * radius;
        const r2 = Math.sqrt(Math.max(0, radius * radius - (y - cy) ** 2));
        ctx.beginPath();
        ctx.ellipse(cx, y, r2, r2 * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Longitude lines
      for (let lon = 0; lon < 360; lon += 20) {
        const angle = ((lon * Math.PI) / 180) + s.rotation;
        const cosA = Math.cos(angle);
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(cosA) * radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Land mass dots
      s.dots.forEach(({ lat, lon, india }) => {
        const latRad = (lat * Math.PI) / 180;
        const lonRad = (lon * Math.PI) / 180 + s.rotation;
        const cosLat = Math.cos(latRad);
        const x3d = cosLat * Math.sin(lonRad);
        const y3d = Math.sin(latRad);
        const z3d = cosLat * Math.cos(lonRad);

        if (z3d < 0) return; // back face

        const px = cx + x3d * radius;
        const py = cy - y3d * radius;
        const vis = Math.pow(z3d, 0.3); // brightness based on depth

        if (india) {
          // India in saffron/green tricolor glow
          const indiaGrad = ctx.createRadialGradient(px, py, 0, px, py, 3.5 * s.zoom);
          indiaGrad.addColorStop(0, `rgba(255,153,51,${vis * 0.95})`);
          indiaGrad.addColorStop(0.5, `rgba(19,136,8,${vis * 0.6})`);
          indiaGrad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(px, py, 3.2 * s.zoom, 0, Math.PI * 2);
          ctx.fillStyle = indiaGrad;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 1.6 * s.zoom, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(120,180,255,${vis * 0.55})`;
          ctx.fill();
        }
      });

      ctx.restore();

      // Globe glass shine overlay
      const shineGrad = ctx.createRadialGradient(
        cx - radius * 0.3, cy - radius * 0.3, 0,
        cx - radius * 0.1, cy - radius * 0.1, radius * 0.85
      );
      shineGrad.addColorStop(0, "rgba(255,255,255,0.18)");
      shineGrad.addColorStop(0.3, "rgba(255,255,255,0.06)");
      shineGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = shineGrad;
      ctx.fill();

      // Globe border
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,200,100,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tricolor orbit ring
      const ringRadius = radius * 1.08;
      const ringGrad = ctx.createConicalGradient
        ? null // fallback below
        : null;
      // Draw tricolor arc segments
      const ringW = 3;
      [[0, Math.PI * 0.66, "#FF9933"], [Math.PI * 0.66, Math.PI * 1.33, "#FFFFFF"], [Math.PI * 1.33, Math.PI * 2, "#138808"]].forEach(
        ([start, end, color]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, start, end);
          ctx.strokeStyle = color + "88";
          ctx.lineWidth = ringW;
          ctx.stroke();
        }
      );

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

// Simplified land-mass heuristic (covers major continents)
function checkLandMass(lat, lon) {
  // India
  if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) return true;
  // Europe
  if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 40) return true;
  // Africa
  if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) return true;
  // North America
  if (lat >= 15 && lat <= 72 && lon >= -168 && lon <= -52) return true;
  // South America
  if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -34) return true;
  // Asia (mainland)
  if (lat >= 0 && lat <= 72 && lon >= 36 && lon <= 145) return true;
  // Australia
  if (lat >= -44 && lat <= -10 && lon >= 112 && lon <= 154) return true;
  // Greenland
  if (lat >= 60 && lat <= 84 && lon >= -58 && lon <= -16) return true;
  // Japan
  if (lat >= 30 && lat <= 46 && lon >= 129 && lon <= 146) return true;
  return false;
}

/* ─────────────── MAIN HERO SECTION ─────────────── */
const HeroSection = () => {
  const { t } = useTranslation();
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [focused, setFocused] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  const searchWorkerHandler = () => {
    const combined = [skill, location].filter(Boolean).join(" ");
    dispatch(setSearchQuery(combined));
    navigate("/workers");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchWorkerHandler();
  };

  const pills = [
    t("hero.quick.plumber"),
    t("hero.quick.electrician"),
    t("hero.quick.cook"),
    t("hero.quick.carpenter"),
    t("hero.quick.painter"),
    t("hero.quick.driver"),
  ];
  const stats = [
    { icon: Languages, value: "6", label: t("hero.stats.multilingual") },
    { icon: Star, value: "4.8★", label: t("hero.stats.avgRating") },
    { icon: Shield, value: t("hero.stats.trusted"), label: t("hero.stats.onlyTrusted") },
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;1,400&display=swap');

        .hero-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Liquid Glass base ── */
        .liq-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          position: relative;
          overflow: hidden;
        }
        .liq-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.2px;
          background: linear-gradient(
            160deg,
            rgba(255,153,51,0.5) 0%,
            rgba(255,255,255,0.3) 20%,
            rgba(19,136,8,0.3) 50%,
            rgba(255,255,255,0.1) 80%,
            rgba(255,153,51,0.4) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* ── Strong glass (CTA / panels) ── */
        .liq-glass-strong {
          background: rgba(2, 8, 30, 0.55);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          position: relative;
          overflow: hidden;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.45),
            inset 0 1px 1px rgba(255,255,255,0.12),
            inset 0 -1px 1px rgba(255,153,51,0.08);
        }
        .liq-glass-strong::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(
            160deg,
            rgba(255,153,51,0.6) 0%,
            rgba(255,255,255,0.2) 25%,
            transparent 50%,
            rgba(19,136,8,0.3) 75%,
            rgba(255,153,51,0.5) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Mirror shine pseudo on panels */
        .liq-glass-strong::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.07) 0%,
            transparent 100%
          );
          border-radius: inherit;
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 6rem 1.5rem 4rem;
          text-align: center;
        }

        /* Tricolor top stripe */
        .tricolor-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%);
          z-index: 20;
        }

        /* Badge pill */
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,220,160,0.95);
          margin-bottom: 1.5rem;
          animation: fadeSlideDown 0.8s ease;
        }

        /* Heading */
        .hero-h1 {
          font-size: clamp(2.4rem, 6vw, 4.8rem);
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 1.2rem;
          animation: fadeSlideUp 0.9s ease 0.1s both;
        }
        .hero-h1 .saffron { color: #FF9933; }
        .hero-h1 .green   { color: #6ee87b; }
        .hero-h1 em {
          font-family: 'Libre Baskerville', serif;
          font-style: italic;
          color: rgba(255,220,160,0.9);
        }

        .hero-sub {
          font-size: clamp(0.9rem, 1.8vw, 1.1rem);
          color: rgba(255,255,255,0.65);
          max-width: 540px;
          margin: 0 auto 2.5rem;
          line-height: 1.65;
          animation: fadeSlideUp 0.9s ease 0.2s both;
        }

        /* Search bar */
        .search-bar {
          display: flex;
          width: min(680px, 92vw);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          animation: fadeSlideUp 0.9s ease 0.3s both;
          box-shadow:
            0 0 0 1px rgba(255,153,51,0.3),
            0 8px 40px rgba(0,0,0,0.4),
            0 0 60px rgba(255,153,51,0.08);
        }
        .search-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 1.2rem;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .search-input-wrap input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.9rem;
          font-family: 'Poppins', sans-serif;
          width: 100%;
          padding: 1rem 0;
        }
        .search-input-wrap input::placeholder { color: rgba(255,255,255,0.38); }
        .search-icon { color: rgba(255,180,80,0.7); flex-shrink: 0; }
        .search-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1.8rem;
          background: linear-gradient(135deg, #FF9933, #e8650a);
          color: #fff;
          font-weight: 600;
          font-size: 0.88rem;
          font-family: 'Poppins', sans-serif;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .search-btn:hover { background: linear-gradient(135deg, #ffaa55, #FF9933); transform: scale(1.02); }
        .search-btn:active { transform: scale(0.98); }

        /* Quick skill pills */
        .quick-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          justify-content: center;
          margin-bottom: 3rem;
          animation: fadeSlideUp 0.9s ease 0.4s both;
        }
        .quick-pill {
          padding: 0.35rem 1rem;
          border-radius: 999px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Poppins', sans-serif;
        }
        .quick-pill:hover {
          color: #FF9933;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255,153,51,0.2);
        }

        /* Stats row */
        .stats-row {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          animation: fadeSlideUp 0.9s ease 0.5s both;
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1rem 1.6rem;
          border-radius: 1.2rem;
          min-width: 90px;
          transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-icon {
          width: 2rem; height: 2rem;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,153,51,0.15);
          margin-bottom: 0.3rem;
        }
        .stat-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
        }
        .stat-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.04em;
          text-transform: none;
          text-align: center;
          line-height: 1.25;
          max-width: 112px;
        }

        /* Chakra spinner */
        .chakra-wrap {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 11;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          color: rgba(255,255,255,0.35);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .chakra-svg {
          width: 22px; height: 22px;
          animation: spin 8s linear infinite;
          opacity: 0.55;
        }

        /* Decorative tricolor gradient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }
        .orb-saffron {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(255,153,51,0.12) 0%, transparent 70%);
          top: -120px; right: -80px;
        }
        .orb-green {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(19,136,8,0.10) 0%, transparent 70%);
          bottom: -60px; left: -80px;
        }
        .orb-navy {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(6,3,141,0.15) 0%, transparent 70%);
          top: 40%; left: 20%;
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-saffron {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,153,51,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255,153,51,0); }
        }

        @media (max-width: 600px) {
          .stats-row { gap: 0.8rem; }
          .stat-card { padding: 0.75rem 1rem; min-width: 70px; }
          .search-btn span { display: none; }
          .search-btn { padding: 0 1.2rem; }
        }
      `}</style>

      <div className="hero-root">
        {/* Tricolor top stripe */}
        <div className="tricolor-bar" />

        {/* Animated globe background */}
        <GlobeBackground />

        {/* Decorative orbs */}
        <div className="orb orb-saffron" />
        <div className="orb orb-green" />
        <div className="orb orb-navy" />

        {/* Main content */}
        <div className="hero-content">

          {/* Badge */}
          <div className="liq-glass badge-pill">
            <Sparkles size={12} style={{ color: "#FF9933" }} />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Heading */}
          <h1 className="hero-h1">
            {t("hero.heading.connecting")}{" "}
            <span className="saffron">{t("hero.heading.skilledHands")}</span>
            <br />
            {t("hero.heading.to")}{" "}
            <em>{t("hero.heading.opportunities")}</em>{" "}
            <span className="green">{t("hero.heading.acrossIndia")}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub">
            {t("hero.subtitle.prefix")}{" "}
            <strong style={{ color: "rgba(255,220,160,0.9)" }}>{t("hero.subtitle.bharat")}</strong>.
          </p>

          {/* Search bar — only for logged-in users */}
          {user ? (
            <>
              <div className="search-bar liq-glass-strong" style={{ borderRadius: "999px" }}>
                <div
                  className="search-input-wrap"
                  style={{ borderRadius: "999px 0 0 999px" }}
                >
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder={t("hero.search.skillPlaceholder")}
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused("skill")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
                <div className="search-input-wrap" style={{ borderRight: "none" }}>
                  <MapPin size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder={t("hero.search.locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused("loc")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
                <button className="search-btn" onClick={searchWorkerHandler}>
                  <Search size={15} />
                  <span>{t("hero.search.search")}</span>
                </button>
              </div>

              {/* Quick skill pills */}
              <div className="quick-pills">
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginRight: "0.3rem", alignSelf: "center" }}>
                  {t("hero.search.try")}
                </span>
                {pills.map((p) => (
                  <button
                    key={p}
                    className="liq-glass quick-pill"
                    onClick={() => { setSkill(p); searchWorkerHandler(); }}
                    style={{ borderRadius: "999px", cursor: "pointer", background: "transparent", border: "none" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ── Guest CTA ── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "3rem", animation: "fadeSlideUp 0.9s ease 0.3s both" }}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", margin: 0, fontFamily: "'Poppins',sans-serif" }}>
                {t("hero.guest.joinText")}
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button
                    className="liq-glass"
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.85rem 2.2rem", borderRadius: "999px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1.5px solid rgba(255,153,51,0.5)",
                      color: "#fff", fontSize: "1rem", fontWeight: 600,
                      fontFamily: "'Poppins',sans-serif",
                      cursor: "pointer", transition: "all 0.25s ease",
                      backdropFilter: "blur(20px)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,153,51,0.18)"; e.currentTarget.style.borderColor="#FF9933"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor="rgba(255,153,51,0.5)"; e.currentTarget.style.transform="translateY(0)"; }}
                  >
                    <LogIn size={18} /> {t("nav.login")}
                  </button>
                </Link>
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <button
                    className="search-btn"
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.85rem 2.2rem", borderRadius: "999px",
                      background: "linear-gradient(135deg,#FF9933,#e8650a)",
                      border: "none", color: "#fff", fontSize: "1rem", fontWeight: 700,
                      fontFamily: "'Poppins',sans-serif",
                      cursor: "pointer", transition: "all 0.25s ease",
                      boxShadow: "0 8px 32px rgba(255,153,51,0.4)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(255,153,51,0.55)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(255,153,51,0.4)"; }}
                  >
                    <UserPlus size={18} /> {t("hero.guest.signupFree")}
                  </button>
                </Link>
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                {[
                  { emoji: "✅", text: t("hero.guest.freeToJoin") },
                  { emoji: "🤝", text: t("hero.guest.onlyTrusted") },
                  { emoji: "🇮🇳", text: t("hero.guest.madeForBharat") },
                ].map(({ emoji, text }) => (
                  <span key={text} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Poppins',sans-serif" }}>
                    {emoji} {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-row">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="liq-glass-strong stat-card">
                <div className="stat-icon">
                  <Icon size={14} style={{ color: "#FF9933" }} />
                </div>
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ashoka Chakra watermark */}
        <div className="chakra-wrap">
          <svg className="chakra-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <circle cx="50" cy="50" r="8" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x1 = 50 + 8 * Math.cos(angle);
              const y1 = 50 + 8 * Math.sin(angle);
              const x2 = 50 + 46 * Math.cos(angle);
              const y2 = 50 + 46 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>;
            })}
          </svg>
          <span>{t("hero.brand")}</span>
          <svg className="chakra-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <circle cx="50" cy="50" r="8" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x1 = 50 + 8 * Math.cos(angle);
              const y1 = 50 + 8 * Math.sin(angle);
              const x2 = 50 + 46 * Math.cos(angle);
              const y2 = 50 + 46 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>;
            })}
          </svg>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
