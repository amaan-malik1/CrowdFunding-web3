import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Brand tokens
───────────────────────────────────────────── */
const BRAND = {
  primary: "#00E5C0",       // electric teal
  primaryDim: "#00B89A",
  accent: "#7B5EFF",        // violet
  accentDim: "#5A42CC",
  surface: "#0B0F1A",       // near-black bg
  surfaceCard: "#111827",
  surfaceBorder: "rgba(255,255,255,0.07)",
  textPrimary: "#F5F7FF",
  textMuted: "#8A93A8",
  danger: "#FF4D6A",
  warning: "#FFBB38",
};

/* ─────────────────────────────────────────────
   Inline global styles (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: ${BRAND.surface};
    color: ${BRAND.textPrimary};
    font-family: 'DM Sans', system-ui, sans-serif;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }

  .lp-hero-headline {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.4rem, 6vw, 5rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #ffffff 30%, ${BRAND.primary} 70%, ${BRAND.accent} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lp-section-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${BRAND.primary};
  }

  .lp-section-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: ${BRAND.textPrimary};
  }

  @keyframes lp-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-14px) rotate(4deg); }
    66% { transform: translateY(-6px) rotate(-3deg); }
  }
  @keyframes lp-pulse-ring {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes lp-shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes lp-fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lp-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes lp-ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .lp-fade-up { animation: lp-fade-up 0.7s ease both; }
  .lp-fade-up-d1 { animation-delay: 0.1s; }
  .lp-fade-up-d2 { animation-delay: 0.22s; }
  .lp-fade-up-d3 { animation-delay: 0.34s; }
  .lp-fade-up-d4 { animation-delay: 0.46s; }

  .lp-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: ${BRAND.primary};
    color: #000;
    border: none;
    border-radius: 100px;
    padding: 14px 32px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }
  .lp-btn-primary:hover:not(:disabled) {
    background: #00ffd5;
    transform: translateY(-2px);
    box-shadow: 0 0 32px rgba(0,229,192,0.45);
  }
  .lp-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .lp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .lp-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: ${BRAND.textPrimary};
    border: 1px solid ${BRAND.surfaceBorder};
    border-radius: 100px;
    padding: 13px 28px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
  }
  .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }

  .lp-card {
    background: ${BRAND.surfaceCard};
    border: 1px solid ${BRAND.surfaceBorder};
    border-radius: 20px;
    padding: 2rem;
    transition: border-color 0.2s, transform 0.2s;
  }
  .lp-card:hover {
    border-color: rgba(0,229,192,0.25);
    transform: translateY(-4px);
  }

  .lp-stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,229,192,0.08);
    border: 1px solid rgba(0,229,192,0.2);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 500;
    color: ${BRAND.primary};
  }

  .lp-step-line {
    position: absolute;
    left: 20px;
    top: 44px;
    bottom: -20px;
    width: 1px;
    background: linear-gradient(to bottom, ${BRAND.primary}60, transparent);
  }

  .lp-ticker-wrap {
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  }
  .lp-ticker-inner {
    display: flex;
    gap: 2.5rem;
    width: max-content;
    animation: lp-ticker 28s linear infinite;
  }

  .lp-glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }

  .lp-wallet-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .lp-wallet-modal {
    background: #141924;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    position: relative;
  }

  .lp-sticky-cta {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 900;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(11,15,26,0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 100px;
    padding: 8px 8px 8px 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    transition: opacity 0.3s, transform 0.3s;
  }

  .lp-avatar-stack {
    display: flex;
    align-items: center;
  }
  .lp-avatar-stack img, .lp-avatar-stack div {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid ${BRAND.surfaceCard};
    margin-left: -8px;
  }
  .lp-avatar-stack > :first-child { margin-left: 0; }

  @media (max-width: 768px) {
    .lp-hero-cols { flex-direction: column; }
    .lp-features-grid { grid-template-columns: 1fr !important; }
    .lp-steps-row { flex-direction: column !important; }
    .lp-footer-cols { flex-direction: column; gap: 2rem !important; }
    .lp-hero-visual { display: none; }
  }
`;

/* ─────────────────────────────────────────────
   Floating particle canvas
───────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,192,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────
   Wallet connection modal
───────────────────────────────────────────── */
const WALLETS = [
  { id: "metamask", name: "MetaMask", icon: "🦊", desc: "Most popular Web3 wallet" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", desc: "Scan with any mobile wallet" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵", desc: "Powered by Coinbase" },
  { id: "phantom", name: "Phantom", icon: "👻", desc: "Solana & multi-chain" },
];

function WalletModal({ onClose, onConnected }) {
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = useCallback(async (wallet) => {
    setError(null);
    setConnecting(wallet.id);
    try {
      // Real integration: call wallet-specific connect logic here.
      // For MetaMask: await window.ethereum.request({ method: 'eth_requestAccounts' })
      // For WalletConnect: await provider.connect()
      // Simulated delay to mimic real wallet handshake:
      await new Promise((res, rej) => setTimeout(() => {
        // Simulate occasional error for demo realism:
        if (Math.random() < 0.05) rej(new Error("User rejected the request"));
        else res();
      }, 1600));
      onConnected({ wallet: wallet.id, address: "0x" + Math.random().toString(16).slice(2, 12) });
    } catch (err) {
      setError(err.message || "Connection failed. Please try again.");
      setConnecting(null);
    }
  }, [onConnected]);

  return (
    <div className="lp-wallet-modal-backdrop" role="dialog" aria-modal="true" aria-label="Connect wallet">
      <div className="lp-wallet-modal">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 16, background: "none", border: "none",
            color: BRAND.textMuted, cursor: "pointer", fontSize: "1.4rem", lineHeight: 1
          }}
        >×</button>

        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.4rem", marginBottom: 6 }}>
          Connect your wallet
        </h2>
        <p style={{ color: BRAND.textMuted, fontSize: "0.9rem", marginBottom: "1.8rem" }}>
          Choose a wallet to get started. Your keys, your funds.
        </p>

        {error && (
          <div style={{
            background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)",
            borderRadius: 12, padding: "12px 16px", marginBottom: "1.2rem",
            color: BRAND.danger, fontSize: "0.88rem"
          }} role="alert">
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => handleConnect(w)}
              disabled={!!connecting}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                background: connecting === w.id ? "rgba(0,229,192,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${connecting === w.id ? "rgba(0,229,192,0.35)" : BRAND.surfaceBorder}`,
                borderRadius: 14, padding: "14px 16px", cursor: connecting ? "not-allowed" : "pointer",
                opacity: connecting && connecting !== w.id ? 0.5 : 1, transition: "all 0.18s", textAlign: "left",
              }}
              aria-label={`Connect with ${w.name}`}
            >
              <span style={{ fontSize: "1.6rem" }} aria-hidden="true">{w.icon}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 500, color: BRAND.textPrimary, fontSize: "0.95rem" }}>{w.name}</span>
                <span style={{ display: "block", fontSize: "0.78rem", color: BRAND.textMuted }}>{w.desc}</span>
              </span>
              {connecting === w.id ? (
                <span style={{ fontSize: "0.8rem", color: BRAND.primary }}>Connecting…</span>
              ) : (
                <span style={{ color: BRAND.textMuted, fontSize: "0.85rem" }}>→</span>
              )}
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: BRAND.textMuted, marginTop: "1.5rem" }}>
          By connecting you agree to our{" "}
          <a href="#terms" style={{ color: BRAND.primary, textDecoration: "none" }}>Terms of Service</a>{" "}
          and{" "}
          <a href="#privacy" style={{ color: BRAND.primary, textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useCounter(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
}

/* ─────────────────────────────────────────────
   Stat display
───────────────────────────────────────────── */
function StatItem({ value, suffix, label }) {
  const animated = useCounter(value);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: BRAND.primary, lineHeight: 1
      }}>
        {animated.toLocaleString()}{suffix}
      </div>
      <div style={{ color: BRAND.textMuted, fontSize: "0.85rem", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature card
───────────────────────────────────────────── */
function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div
      className={`lp-card lp-fade-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(0,229,192,0.1)", border: "1px solid rgba(0,229,192,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem", marginBottom: "1.2rem"
      }} aria-hidden="true">
        {icon}
      </div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: "1.1rem", marginBottom: "0.6rem", color: BRAND.textPrimary
      }}>
        {title}
      </h3>
      <p style={{ color: BRAND.textMuted, fontSize: "0.9rem", lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main LandingPage component
───────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [walletOpen, setWalletOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef(null);

  /* Inject global styles once */
  useEffect(() => {
    const id = "lp-global-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  /* Show sticky CTA after scrolling past hero */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleConnected = useCallback((info) => {
    setWalletOpen(false);
    // Store wallet info (replace with your state management solution)
    sessionStorage.setItem("walletAddress", info.address);
    sessionStorage.setItem("walletProvider", info.wallet);
    // Redirect to dashboard
    navigate("/");
  }, [navigate]);

  const openWallet = () => setWalletOpen(true);

  /* Ticker items */
  const tickerItems = [
    "🚀 Campaign funded: $240,000 raised for DeFi protocol",
    "✅ Smart contract audit: 100% transparent",
    "🌍 42 countries, zero borders",
    "⚡ $0.002 avg transaction fee",
    "🔒 Non-custodial · Your keys, your funds",
    "💎 $14.2M total raised this quarter",
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.surface, overflowX: "hidden" }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 800,
        padding: "0 max(24px, 4vw)",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(11,15,26,0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BRAND.surfaceBorder}`,
      }}>
        <a href="#" style={{ textDecoration: "none" }} aria-label="Fundchain home">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" stroke={BRAND.primary} strokeWidth="1.5" />
              <path d="M8 14 L14 8 L20 14 L14 20 Z" fill={BRAND.primary} opacity="0.9" />
              <circle cx="14" cy="14" r="3" fill={BRAND.surface} />
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: BRAND.textPrimary }}>
              Fund<span style={{ color: BRAND.primary }}>chain</span>
            </span>
          </div>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#features" style={{ color: BRAND.textMuted, textDecoration: "none", fontSize: "0.9rem", transition: "color 0.15s" }}
            onMouseOver={e => e.target.style.color = BRAND.textPrimary}
            onMouseOut={e => e.target.style.color = BRAND.textMuted}>
            Features
          </a>
          <a href="#how-it-works" style={{ color: BRAND.textMuted, textDecoration: "none", fontSize: "0.9rem", transition: "color 0.15s" }}
            onMouseOver={e => e.target.style.color = BRAND.textPrimary}
            onMouseOut={e => e.target.style.color = BRAND.textMuted}>
            How it works
          </a>
          <button className="lp-btn-primary" onClick={openWallet} style={{ padding: "10px 22px", fontSize: "0.88rem" }}>
            <WalletIcon /> Connect wallet
          </button>
        </div>
      </nav>

      {/* ─── TICKER ─── */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, zIndex: 700,
        background: "rgba(0,229,192,0.07)", borderBottom: `1px solid rgba(0,229,192,0.12)`,
        padding: "7px 0"
      }}>
        <div className="lp-ticker-wrap">
          <div className="lp-ticker-inner" aria-hidden="true">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} style={{ color: BRAND.textMuted, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "calc(64px + 36px + 4vh) max(24px,6vw) 6rem",
          overflow: "hidden",
        }}
        aria-label="Hero section"
      >
        <ParticleCanvas />

        {/* Glow orbs */}
        <div className="lp-glow-orb" style={{ width: 500, height: 500, background: "rgba(0,229,192,0.12)", top: "10%", left: "-10%" }} aria-hidden="true" />
        <div className="lp-glow-orb" style={{ width: 400, height: 400, background: "rgba(123,94,255,0.1)", bottom: "5%", right: "-5%" }} aria-hidden="true" />

        <div className="lp-hero-cols" style={{ display: "flex", alignItems: "center", gap: "4rem", position: "relative", zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: "0 0 58%", maxWidth: 640 }}>
            <div className="lp-fade-up" style={{ marginBottom: "1.4rem" }}>
              <span className="lp-stat-pill">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.primary, display: "inline-block" }} />
                Live on Mainnet · $14.2M raised
              </span>
            </div>

            <h1 className="lp-hero-headline lp-fade-up lp-fade-up-d1">
              Fund the Future<br />with Blockchain
            </h1>

            <p className="lp-fade-up lp-fade-up-d2" style={{
              color: BRAND.textMuted, fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
              maxWidth: 520, marginTop: "1.4rem", marginBottom: "2.4rem"
            }}>
              Decentralized crowdfunding where smart contracts hold the keys — not us.
              Back campaigns worldwide with full transparency, minimal fees, and zero middlemen.
            </p>

            <div className="lp-fade-up lp-fade-up-d3" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              <button className="lp-btn-primary" onClick={openWallet} style={{ fontSize: "1.05rem", padding: "16px 36px" }}>
                <WalletIcon /> Connect wallet to start
              </button>
              <button className="lp-btn-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See how it works ↓
              </button>
            </div>

            <div className="lp-fade-up lp-fade-up-d4" style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", marginTop: "3rem" }}>
              <StatItem value={14200} suffix="K" label="Total USD raised" />
              <div style={{ width: 1, background: BRAND.surfaceBorder }} aria-hidden="true" />
              <StatItem value={2840} suffix="+" label="Campaigns funded" />
              <div style={{ width: 1, background: BRAND.surfaceBorder }} aria-hidden="true" />
              <StatItem value={42} suffix="" label="Countries reached" />
            </div>
          </div>

          {/* Right — visual */}
          <div className="lp-hero-visual" style={{ flex: 1, position: "relative", minHeight: 380 }} aria-hidden="true">
            <HeroVisual />
          </div>
        </div>

        {/* Social proof strip */}
        <div className="lp-fade-up" style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", gap: "1rem",
          marginTop: "4rem",
          padding: "1rem 1.5rem",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${BRAND.surfaceBorder}`,
          borderRadius: 14, width: "fit-content"
        }}>
          <div className="lp-avatar-stack" aria-label="Recent backers">
            {["#4C6EF5", "#7950F2", "#F03E3E", "#2F9E44", "#E67700"].map((c, i) => (
              <div key={i} style={{
                background: c, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.55rem", color: "#fff", fontWeight: 700
              }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>Joined by 2,840+ backers</div>
            <div style={{ color: BRAND.textMuted, fontSize: "0.78rem" }}>from 42 countries this month</div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: BRAND.warning, fontSize: "0.75rem" }}>★</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "6rem max(24px,6vw)" }} aria-label="Platform features">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p className="lp-section-eyebrow" style={{ marginBottom: "0.8rem" }}>Why Fundchain</p>
          <h2 className="lp-section-title">Built for trust.<br />Designed for impact.</h2>
        </div>

        <div
          className="lp-features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            maxWidth: 1100, margin: "0 auto"
          }}
        >
          <FeatureCard delay={0} icon="⛓️" title="Fully decentralized"
            description="Smart contracts hold funds — no bank, no escrow company, no single point of failure. Rules are coded, not promised." />
          <FeatureCard delay={0.08} icon="🔍" title="On-chain transparency"
            description="Every contribution, milestone, and withdrawal is permanently recorded on the blockchain. Verify anything, anytime." />
          <FeatureCard delay={0.16} icon="🌍" title="Borderless by design"
            description="Accept funding from anyone on Earth. No currency conversion friction, no cross-border restrictions." />
          <FeatureCard delay={0.24} icon="⚡" title="Near-zero fees"
            description="Gas-optimized contracts keep fees under $0.01 per transaction — compared to 5–8% on traditional platforms." />
          <FeatureCard delay={0.32} icon="🛡️" title="Non-custodial"
            description="You hold your private keys. Funds flow directly to campaign milestones — we never touch your crypto." />
          <FeatureCard delay={0.40} icon="🗳️" title="Community governance"
            description="Token holders vote on platform upgrades and dispute resolution. Power stays with the community, not a corporation." />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{
        padding: "6rem max(24px,6vw)",
        background: "rgba(255,255,255,0.015)",
        borderTop: `1px solid ${BRAND.surfaceBorder}`,
        borderBottom: `1px solid ${BRAND.surfaceBorder}`,
      }} aria-label="How it works">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p className="lp-section-eyebrow" style={{ marginBottom: "0.8rem" }}>Simple by design</p>
          <h2 className="lp-section-title">From wallet to funded<br />in three steps</h2>
        </div>

        <div className="lp-steps-row" style={{
          display: "flex", gap: "2rem", maxWidth: 960, margin: "0 auto", alignItems: "flex-start"
        }}>
          {[
            { n: "01", title: "Connect your wallet", desc: "Link MetaMask, WalletConnect, or any Web3 wallet. No account signup, no email required.", icon: "🦊" },
            { n: "02", title: "Create or explore", desc: "Launch a campaign with a smart contract milestone schedule — or browse hundreds of live projects to back.", icon: "🗺️" },
            { n: "03", title: "Fund with confidence", desc: "Contribute crypto directly. Smart contracts release funds only when verified milestones are reached.", icon: "✅" },
          ].map((step, i) => (
            <div key={i} style={{ flex: 1, position: "relative", paddingLeft: i < 2 ? "0" : "0" }}>
              {i < 2 && (
                <div aria-hidden="true" style={{
                  display: "none", // Hidden connector for mobile; shown on desktop via CSS
                  position: "absolute", top: 24, right: "-1rem", width: "2rem", height: 1,
                  background: `linear-gradient(to right, ${BRAND.primary}60, transparent)`
                }} />
              )}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                background: BRAND.surfaceCard,
                border: `1px solid ${BRAND.surfaceBorder}`,
                borderRadius: 20, padding: "2rem", height: "100%",
                transition: "border-color 0.2s",
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = "rgba(0,229,192,0.3)"}
                onMouseOut={e => e.currentTarget.style.borderColor = BRAND.surfaceBorder}
              >
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: "3rem", color: "rgba(0,229,192,0.12)", lineHeight: 1, marginBottom: "1rem"
                }} aria-hidden="true">
                  {step.n}
                </div>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }} aria-hidden="true">{step.icon}</div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: "1.1rem", marginBottom: "0.7rem", color: BRAND.textPrimary
                }}>
                  {step.title}
                </h3>
                <p style={{ color: BRAND.textMuted, fontSize: "0.9rem", lineHeight: 1.7 }}>{step.desc}</p>

                {i === 0 && (
                  <button
                    className="lp-btn-primary"
                    onClick={openWallet}
                    style={{ marginTop: "1.5rem", fontSize: "0.88rem", padding: "12px 22px" }}
                  >
                    <WalletIcon /> Start here
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: "6rem max(24px,6vw)" }} aria-label="Testimonials">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p className="lp-section-eyebrow" style={{ marginBottom: "0.8rem" }}>Community voices</p>
          <h2 className="lp-section-title">Trusted by builders<br />and backers alike</h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem", maxWidth: 1000, margin: "0 auto"
        }}>
          {[
            { name: "Lena Park", role: "Climate tech founder", q: "Raised $180K in 12 days. Fundchain's milestone contracts gave backers the confidence to commit. No traditional platform comes close." },
            { name: "Marco Ricci", role: "DeFi protocol backer", q: "I can see every dollar flow on-chain. For the first time, I actually trust where my contribution goes." },
            { name: "Aisha Nkosi", role: "Open-source developer", q: "Connected my wallet, deployed a campaign, received first pledge — all within one afternoon. Incredible UX for a blockchain product." },
          ].map((t, i) => (
            <div key={i} className="lp-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: BRAND.warning, fontSize: "0.8rem" }}>★</span>)}
              </div>
              <p style={{ color: BRAND.textPrimary, fontSize: "0.92rem", lineHeight: 1.7, flex: 1 }}>"{t.q}"</p>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.5rem",
                borderTop: `1px solid ${BRAND.surfaceBorder}`
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `hsl(${i * 120},60%,35%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.85rem", color: "#fff"
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>{t.name}</div>
                  <div style={{ color: BRAND.textMuted, fontSize: "0.78rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: "5rem max(24px,6vw)",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(0,229,192,0.06) 0%, rgba(123,94,255,0.06) 100%)",
        borderTop: `1px solid ${BRAND.surfaceBorder}`,
      }} aria-label="Call to action">
        <h2 className="lp-section-title" style={{ marginBottom: "1rem" }}>
          Ready to fund something<br />that matters?
        </h2>
        <p style={{ color: BRAND.textMuted, maxWidth: 480, margin: "0 auto 2.5rem", fontSize: "1rem" }}>
          Connect your wallet in seconds and join thousands of builders changing the world — no sign-up, no gatekeeping.
        </p>
        <button className="lp-btn-primary" onClick={openWallet} style={{ fontSize: "1.1rem", padding: "18px 44px" }}>
          <WalletIcon /> Connect wallet
        </button>
        <div style={{ marginTop: "1.2rem", color: BRAND.textMuted, fontSize: "0.8rem" }}>
          Non-custodial · Audited · Open source
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "3rem max(24px,6vw)",
        borderTop: `1px solid ${BRAND.surfaceBorder}`,
      }} aria-label="Site footer">
        <div className="lp-footer-cols" style={{ display: "flex", justifyContent: "space-between", gap: "3rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.6rem" }}>
              Fund<span style={{ color: BRAND.primary }}>chain</span>
            </div>
            <p style={{ color: BRAND.textMuted, fontSize: "0.85rem", maxWidth: 240 }}>
              Decentralized crowdfunding for a borderless world.
            </p>
          </div>
          {[
            { heading: "Platform", links: ["Explore campaigns", "Create campaign", "How it works", "Fees"] },
            { heading: "Developers", links: ["Documentation", "Smart contracts", "GitHub", "Audit reports"] },
            { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
          ].map((col) => (
            <div key={col.heading}>
              <div style={{ fontWeight: 500, fontSize: "0.85rem", marginBottom: "0.9rem" }}>{col.heading}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ color: BRAND.textMuted, textDecoration: "none", fontSize: "0.83rem", transition: "color 0.15s" }}
                      onMouseOver={e => e.target.style.color = BRAND.textPrimary}
                      onMouseOut={e => e.target.style.color = BRAND.textMuted}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          paddingTop: "1.5rem", borderTop: `1px solid ${BRAND.surfaceBorder}`
        }}>
          <p style={{ color: BRAND.textMuted, fontSize: "0.78rem" }}>© 2025 Fundchain. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a key={l} id={l.toLowerCase()} href="#" style={{ color: BRAND.textMuted, textDecoration: "none", fontSize: "0.78rem" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ─── STICKY CTA ─── */}
      <div
        className="lp-sticky-cta"
        style={{ opacity: showSticky ? 1 : 0, pointerEvents: showSticky ? "auto" : "none", transform: `translateX(-50%) translateY(${showSticky ? 0 : 16}px)` }}
        role="complementary"
        aria-label="Connect wallet prompt"
      >
        <span style={{ fontSize: "0.88rem", color: BRAND.textMuted }}>Ready to start?</span>
        <button className="lp-btn-primary" onClick={openWallet} style={{ padding: "10px 22px", fontSize: "0.88rem" }}>
          <WalletIcon /> Connect wallet
        </button>
      </div>

      {/* ─── WALLET MODAL ─── */}
      {walletOpen && (
        <WalletModal onClose={() => setWalletOpen(false)} onConnected={handleConnected} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero visual — floating blockchain graphic
───────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div style={{ position: "relative", width: "100%", height: 380 }} aria-hidden="true">
      {/* Central orb */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 140, height: 140,
        background: `radial-gradient(circle, ${BRAND.primary}30 0%, transparent 70%)`,
        border: `1px solid ${BRAND.primary}40`, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `linear-gradient(135deg, ${BRAND.primary}20, ${BRAND.accent}30)`,
          border: `1.5px solid ${BRAND.primary}80`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem"
        }}>⛓️</div>
        {/* Pulse rings */}
        {[1, 1.5, 2].map((scale, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid ${BRAND.primary}30`,
            animation: `lp-pulse-ring ${1.5 + i * 0.6}s ease-out ${i * 0.5}s infinite`
          }} />
        ))}
      </div>

      {/* Orbiting cards */}
      {[
        { top: "5%", left: "5%", icon: "🚀", label: "DeFi Protocol", amount: "$48K", delay: "0s" },
        { top: "8%", right: "8%", icon: "🌿", label: "Green Energy", amount: "$120K", delay: "0.8s" },
        { bottom: "12%", left: "2%", icon: "🎨", label: "Digital Art", amount: "$22K", delay: "1.6s" },
        { bottom: "8%", right: "5%", icon: "🏥", label: "Med Research", amount: "$95K", delay: "2.4s" },
      ].map((card, i) => (
        <div key={i} style={{
          position: "absolute", ...card,
          background: BRAND.surfaceCard,
          border: `1px solid ${BRAND.surfaceBorder}`,
          borderRadius: 14, padding: "12px 16px",
          animation: `lp-float ${4 + i * 0.8}s ease-in-out ${card.delay} infinite`,
          minWidth: 140
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "1.1rem" }}>{card.icon}</span>
            <span style={{ fontSize: "0.78rem", color: BRAND.textMuted }}>{card.label}</span>
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: BRAND.primary, fontSize: "1.1rem" }}>{card.amount}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginTop: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: `linear-gradient(to right, ${BRAND.primary}, ${BRAND.accent})`,
              width: ["72%", "88%", "54%", "91%"][i]
            }} />
          </div>
          <div style={{ fontSize: "0.68rem", color: BRAND.textMuted, marginTop: 3 }}>
            {["72%", "88%", "54%", "91%"][i]} funded
          </div>
        </div>
      ))}

      {/* Spinning ring */}
      <svg style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        animation: "lp-spin-slow 20s linear infinite", opacity: 0.15
      }}
        width="280" height="280" viewBox="0 0 280 280">
        <circle cx="140" cy="140" r="130" fill="none" stroke={BRAND.primary} strokeWidth="0.8"
          strokeDasharray="12 6" />
      </svg>
    </div>
  );
}

/* ─── Wallet icon ─── */
function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
      <path d="M1 6h14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
