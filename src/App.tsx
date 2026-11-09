import { useState, useEffect, useRef } from "react";
import litpageBack from "@/imports/litpage_back.png";
import { ExpertiseLeftPanel, ExpertiseRightPanel } from "./ExpertisePanels";
import { AboutPage } from "./AboutPage";

type Phase = "idle" | "entering" | "resting" | "exiting";
type PageId = "home" | "expertise" | "about";

const CIRCLE_R = 36;
const OUTER_R = CIRCLE_R + 14;

const MENU_LETTERS = [
  { char: "M", angle: -82 },
  { char: "E", angle: -58 },
  { char: "N", angle: -30 },
  { char: "U", angle: 0 },
];

const CLOSE_LETTERS = [
  { char: "C", angle: -82 },
  { char: "L", angle: -61.5 },
  { char: "O", angle: -41 },
  { char: "S", angle: -20.5 },
  { char: "E", angle: 0 },
];

function toRad(deg: number) { return (deg * Math.PI) / 180; }

const DRAWER_EASE = "cubic-bezier(0.77,0,0.18,1)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [fullView, setFullView] = useState(false);
  const [page, setPage] = useState<PageId>("home");
  // Scroll progress (0–1) of the Expertise page's right-side text column.
  // The left-side tools image reads this to move in lockstep, so both
  // panels reach their end together no matter how tall either one is.
  const [expertiseScrollPct, setExpertiseScrollPct] = useState(0);

  // Page-open sequence. `loaded` flips on the first frame and starts the
  // entrance (logo fades in centred, then panels slide in and the logo glides
  // to its corner); `entranceSettled` flips once the circle button has risen,
  // so it can switch over to its normal open/close transitions.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const [entranceSettled, setEntranceSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntranceSettled(true), 2300);
    return () => clearTimeout(t);
  }, []);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    setPhase("entering");
    enterTimer.current = setTimeout(() => setPhase("resting"), 550);
  };

  const handleMouseLeave = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    setPhase("exiting");
    exitTimer.current = setTimeout(() => setPhase("idle"), 520);
  };

  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (enterTimer.current) clearTimeout(enterTimer.current);
  }, []);

  // Navigating from the menu drawer: switch page, close the menu, and drop
  // out of full-view so the new page never opens already "zoomed in".
  const handleNavigate = (target: PageId) => {
    setPage(target);
    setIsOpen(false);
    setFullView(false);
    setExpertiseScrollPct(0);
  };

  const activeLetters = isOpen ? CLOSE_LETTERS : MENU_LETTERS;

  function menuLetterStyle(letter: typeof MENU_LETTERS[0], i: number): React.CSSProperties {
    let angle: number, opacity: number;
    if (phase === "idle")         { angle = letter.angle - 90; opacity = 0; }
    else if (phase === "exiting") { angle = letter.angle + 90; opacity = 0; }
    else                          { angle = letter.angle;      opacity = 1; }

    const x = OUTER_R * Math.cos(toRad(angle));
    const y = OUTER_R * Math.sin(toRad(angle));
    const delay   = phase === "entering" ? i * 0.045 : (activeLetters.length - 1 - i) * 0.03;
    const dur     = phase === "exiting" ? 0.42 : 0.52;

    return {
      position: "absolute",
      left: "50%", top: "50%",
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      fontSize: "10px", fontWeight: 600,
      opacity,
      transition: `transform ${dur}s cubic-bezier(0.4,0,0.2,1) ${delay}s, opacity ${phase === "exiting" ? 0.38 : 0.3}s ease ${delay}s`,
      // Near-white by default since these letters have no background of
      // their own and normally float over the site's dark pages. On the
      // About page's white background that same color would be invisible,
      // so this flips to dark there instead.
      color: page === "about" ? "#0B0B0D" : "#F5F3EE",
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: "0.08em",
      pointerEvents: "none", userSelect: "none", lineHeight: 1,
    };
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", fontFamily: "'Poppins',sans-serif", background: "#0B0B0D" }}>

      {/* PAGE — genuinely slides up as the menu rises (transform, not a clip mask), so the content itself visibly moves rather than a static image being progressively hidden. Skipped under reduced motion: the menu just fades in on top instead. Clicking anywhere on it while the menu is open closes the menu. */}
      <div onClick={() => { if (isOpen) setIsOpen(false); }} style={{ width: "100%", height: "100%", display: "flex", cursor: isOpen ? "pointer" : undefined, ...(reducedMotion ? {} : { transform: `translateY(${isOpen ? "-50vh" : "0"})`, transition: `transform 0.65s ${DRAWER_EASE}`, willChange: "transform" }) }}>

        {page === "about" ? (
          <AboutPage />
        ) : (
          <>
            {/* LEFT — image drawer. Home's photo can still expand to full view;
                Expertise's tools image deliberately can't (see below) — it's a
                long image that scrolls in place, not something you zoom into. */}
            <div
              onClick={() => { if (page === "home" && !fullView && !isOpen) setFullView(true); }}
              style={{
                width: fullView ? "100%" : "50%", height: "100%", position: "relative", overflow: "hidden", flexShrink: 0,
                cursor: page === "home" && !fullView ? "pointer" : undefined, zIndex: fullView ? 17 : 2,
                ...(reducedMotion
                  ? { opacity: loaded ? 1 : 0, transition: `width 0.65s ${DRAWER_EASE}, opacity 0.3s ease` }
                  : { transform: `translateX(${loaded ? "0" : "-100%"})`, transition: `width 0.65s ${DRAWER_EASE}, transform 0.75s ${DRAWER_EASE} 0.7s` }),
              }}
            >
              {page === "expertise" ? (
                <ExpertiseLeftPanel scrollProgress={expertiseScrollPct} />
              ) : (
                <img src={litpageBack} alt="Litpage background" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setFullView(false); }}
                style={{ position: "absolute", bottom: "36px", left: "36px", width: "38px", height: "38px", borderRadius: "50%", background: "#0B0B0D", border: "1.5px solid rgba(245,243,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: fullView ? 1 : 0, pointerEvents: fullView ? "all" : "none", transition: `opacity 0.3s ease ${fullView ? "0.45s" : "0s"}, border-color 0.2s ease` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8102E"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,243,238,0.3)"; }}
                aria-label="Close full view"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="#F5F3EE" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="#F5F3EE" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* RIGHT — black panel (home: brand mark only · expertise: brand mark + copy) */}
            <div style={{
              width: fullView ? "0%" : "50%", height: "100%", background: "#0B0B0D", position: "relative", overflow: "hidden", flexShrink: 0,
              ...(reducedMotion
                ? { opacity: loaded ? 1 : 0, transition: `width 0.65s ${DRAWER_EASE}, opacity 0.3s ease` }
                : { transform: `translateX(${loaded ? "0" : "100%"})`, transition: `width 0.65s ${DRAWER_EASE}, transform 0.75s ${DRAWER_EASE} 0.78s` }),
            }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,16,46,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
              {page === "expertise" && <ExpertiseRightPanel onScrollProgress={setExpertiseScrollPct} />}
            </div>
          </>
        )}
      </div>

      {/* Fade mask for the Expertise copy: the LITPAGE wordmark has no
          background of its own, so without this, scrolled paragraph text
          would visibly collide with its letters as it passes underneath.
          It keeps a solid, matching-color zone around the wordmark and lets
          content fade in cleanly as it scrolls up past it. It sits out here
          with the wordmark, not inside the page, so it stays put when the
          menu slides the page up. */}
      {page === "expertise" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, right: 0, width: "50%", height: "128px",
            background: "linear-gradient(to bottom, #0B0B0D 0%, #0B0B0D 58%, rgba(11,11,13,0) 100%)",
            zIndex: 2, pointerEvents: "none",
          }}
        />
      )}

      {/* LOGO — kept independent of the sliding page so the brand mark stays put and legible instead of sliding away with it. On load it fades in centered, holds, then migrates to this corner as the panels arrive. Shared across every page; "PAGE" flips to dark on About, which sits on white instead of the site's usual black. */}
      <div
        onClick={() => { if (isOpen) setIsOpen(false); }}
        style={{
          position: "absolute", top: "32px", right: "40px", fontSize: "15px", letterSpacing: "0.22em", fontWeight: 700, userSelect: "none", whiteSpace: "nowrap", zIndex: 3,
          cursor: isOpen ? "pointer" : "default",
          opacity: fullView ? 0 : (loaded ? 1 : 0),
          transform: reducedMotion || loaded ? "translate(0, 0)" : "translate(calc(-50vw + 40px + 50%), calc(50vh - 32px - 50%))",
          transition: reducedMotion
            ? "opacity 0.3s ease"
            : `opacity ${loaded ? "0.5s" : "0.45s"} ${DRAWER_EASE}, transform 0.75s ${DRAWER_EASE} 0.7s`,
        }}>
        <span style={{ color: "#C8102E" }}>LIT</span>
        <span style={{ color: page === "about" ? "#0B0B0D" : "#F5F3EE" }}>PAGE</span>
      </div>

      {/* BOTTOM STRIP */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "130px", background: isOpen ? "#171719" : "transparent", transition: `background 0.65s ${DRAWER_EASE}`, pointerEvents: "none", zIndex: 16, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "48px", opacity: fullView ? 0 : 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", opacity: isOpen ? 1 : 0, transform: reducedMotion ? "none" : `translateY(${isOpen ? "0" : "8px"})`, transition: reducedMotion ? "opacity 0.2s ease" : `opacity 0.65s ${DRAWER_EASE}, transform 0.65s ${DRAWER_EASE}`, pointerEvents: isOpen ? "auto" : "none" }}>
          <span style={{ color: "#8A8985", fontSize: "9px", letterSpacing: "0.3em", fontWeight: 500, textTransform: "uppercase" }}>Follow Us</span>
          <div style={{ display: "flex", gap: "16px" }}>
            {["IG", "TW", "LI"].map((s) => (
              <a key={s} href="#" style={{ color: "#F5F3EE", fontSize: "10px", letterSpacing: "0.12em", fontWeight: 600, textDecoration: "none", opacity: 0.7, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
              >{s}</a>
            ))}
          </div>
        </div>
      </div>

      {/* MENU OVERLAY */}
      <MenuOverlay isOpen={isOpen} reducedMotion={reducedMotion} currentPage={page} onNavigate={handleNavigate} />

      {/* CIRCLE BUTTON */}
      <div
        style={{
          position: "absolute", bottom: "52px", left: "50%",
          transform: reducedMotion
            ? "translate(-50%, 0)"
            : `translate(-50%, ${!loaded ? "140px" : isOpen ? "-10px" : "0"})`,
          zIndex: 20, opacity: fullView ? 0 : (loaded ? 1 : 0), pointerEvents: fullView || !loaded ? "none" : "all",
          transition: reducedMotion
            ? "opacity 0.3s ease"
            : !entranceSettled
              ? `transform 0.6s ${DRAWER_EASE} 1.65s, opacity 0.3s ease 1.65s`
              : `opacity 0.3s ease, transform 0.65s ${DRAWER_EASE}`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ position: "relative", width: CIRCLE_R * 2, height: CIRCLE_R * 2 }}>
          {/* Glass filter */}
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <filter id="circle-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.06 0.06" numOctaves="1" seed="2" result="turbulence" />
                <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
                <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="40" xChannelSelector="R" yChannelSelector="B" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
                <feComposite in="finalBlur" in2="finalBlur" operator="over" />
              </filter>
            </defs>
          </svg>

          <RotatingRing r={CIRCLE_R} hovered={phase !== "idle"} reducedMotion={reducedMotion} />

          {/* Liquid glass circle — click toggles menu */}
          <div
            className="menu-btn-circle"
            onClick={() => setIsOpen((v) => !v)}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", cursor: "pointer", transition: "transform 100ms ease-out" }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backdropFilter: 'url("#circle-glass") blur(2px)' }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: isOpen ? "rgba(23,23,25,0.9)" : "rgba(200,16,46,0.82)",
              boxShadow: [
                "inset 3px 3px 0.5px -3px rgba(255,255,255,0.35)",
                "inset -3px -3px 0.5px -3px rgba(0,0,0,0.7)",
                "inset 1px 1px 1.5px -0.5px rgba(255,255,255,0.45)",
                "inset -1px -1px 1px -0.5px rgba(0,0,0,0.5)",
                "inset 0 0 8px 4px rgba(0,0,0,0.15)",
                phase !== "idle" ? "0 0 24px rgba(200,16,46,0.5)" : "0 8px 24px rgba(0,0,0,0.35)",
              ].join(","),
              transition: "background 280ms ease, box-shadow 0.3s ease",
            }} />
            <div style={{ position: "absolute", top: "6%", left: "12%", width: "76%", height: "38%", borderRadius: "50%", background: "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))", pointerEvents: "none" }} />
          </div>

          {/* MENU arc letters */}
          {activeLetters.map((letter, i) => (
            <div key={letter.char} style={menuLetterStyle(letter, i)}>{letter.char}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuOverlay({
  isOpen,
  reducedMotion,
  currentPage,
  onNavigate,
}: {
  isOpen: boolean;
  reducedMotion: boolean;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  // Home / Expertise / About are wired up; the rest are placeholders (no
  // `page` id) and just close the drawer when clicked.
  const links: { label: string; page?: PageId }[] = [
    { label: "Home", page: "home" },
    { label: "Work" },
    { label: "Expertise", page: "expertise" },
    { label: "About", page: "about" },
    { label: "Contact" },
    { label: "Join Us" },
    { label: "Knowledge" },
  ];
  const BLOCK_WIDTH = (100 / 3.5).toFixed(4); // exactly 3.5 blocks visible in the row at once

  const navRef = useRef<HTMLElement>(null);
  const targetFractionRef = useRef(0);

  // Cursor-driven auto-scroll: cursor at the far left of the screen -> Home, far right -> Knowledge.
  // Smoothed with a frame-rate-independent exponential ease (per apple-design: a continuously
  // updating target eased every frame, not a CSS transition, since the input itself is continuous.
  useEffect(() => {
    const nav = navRef.current;
    if (!isOpen || !nav) return;

    nav.scrollLeft = 0;
    targetFractionRef.current = 0;

    if (reducedMotion) return; // a moving-with-your-mouse row is exactly the kind of motion to skip here

    // Touch screens have no cursor to follow — easing back to the start every
    // frame would fight the person's own swipe, so they keep native scrolling.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      targetFractionRef.current = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
    }
    nav.addEventListener("mousemove", handleMouseMove);

    let lastTime = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const maxScroll = nav.scrollWidth - nav.clientWidth;
      const target = targetFractionRef.current * maxScroll;
      const smoothing = 1 - Math.pow(0.0001, dt);
      nav.scrollLeft += (target - nav.scrollLeft) * smoothing;
      raf = requestAnimationFrame(tick);
    });

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [isOpen, reducedMotion]);

  const panelStyle: React.CSSProperties = reducedMotion
    ? { position: "absolute", left: 0, right: 0, bottom: 0, height: "50vh", background: "#0B0B0D", zIndex: 15, pointerEvents: isOpen ? "all" : "none", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease" }
    : { position: "absolute", left: 0, right: 0, bottom: 0, height: "50vh", background: "#0B0B0D", zIndex: 15, pointerEvents: isOpen ? "all" : "none", transform: `translateY(${isOpen ? "0%" : "100%"})`, transition: `transform 0.65s ${DRAWER_EASE}`, willChange: "transform" };

  return (
    <div style={panelStyle}>
      <nav ref={navRef} className="no-scrollbar" style={{ height: "25vh", display: "flex", flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {links.map((link) => {
          const active = link.page === currentPage;
          return (
            <a
              key={link.label}
              href="#"
              style={{ flex: `0 0 ${BLOCK_WIDTH}%`, maxWidth: `${BLOCK_WIDTH}%`, boxSizing: "border-box", paddingTop: "10px", paddingRight: "20px", display: "flex", flexDirection: "column", textDecoration: "none", cursor: "pointer" }}
              onClick={(e) => { e.preventDefault(); if (link.page) onNavigate(link.page); }}
              onMouseEnter={(e) => {
                const label = e.currentTarget.querySelector("span");
                if (label) (label as HTMLElement).style.color = "#C8102E";
                const dot = e.currentTarget.querySelector(".nav-dot") as HTMLElement | null;
                if (dot) { dot.style.width = "6px"; dot.style.marginRight = "8px"; }
              }}
              onMouseLeave={(e) => {
                const label = e.currentTarget.querySelector("span");
                if (label) (label as HTMLElement).style.color = active ? "#C8102E" : "#F5F3EE";
                const dot = e.currentTarget.querySelector(".nav-dot") as HTMLElement | null;
                if (dot) { dot.style.width = "0px"; dot.style.marginRight = "0px"; }
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", color: active ? "#C8102E" : "#F5F3EE", fontSize: "16px", fontWeight: 600, letterSpacing: "0.02em", marginBottom: "10px", transition: "color 0.45s ease" }}>
                <span className="nav-dot" style={{ display: "inline-block", width: "0px", height: "6px", borderRadius: "50%", background: "#C8102E", marginRight: "0px", flexShrink: 0, transition: "width 0.45s ease, margin-right 0.45s ease" }} />
                {link.label}
              </span>
              <div style={{ flex: 1, background: "#171719", borderRadius: "6px" }} />
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function RotatingRing({ r, hovered, reducedMotion }: { r: number; hovered: boolean; reducedMotion: boolean }) {
  const size = r * 2, cx = r, cy = r, strokeR = r - 2, circ = 2 * Math.PI * strokeR;
  return (
    <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "opacity 0.4s ease", opacity: hovered ? 1 : 0.35 }}>
      {!reducedMotion && (
        <style>{`@keyframes spin-ring{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.ring-group{transform-origin:${cx}px ${cy}px;animation:spin-ring 3s linear infinite}`}</style>
      )}
      <g className="ring-group">
        <circle cx={cx} cy={cy} r={strokeR} fill="none" stroke="#C8102E" strokeWidth="0.8" strokeDasharray={`${circ * 0.12} ${circ * 0.88}`} strokeLinecap="round" opacity="0.7" />
        <circle cx={cx} cy={cy} r={strokeR} fill="none" stroke="#8A8985" strokeWidth="0.5" strokeDasharray={`${circ * 0.05} ${circ * 0.95}`} strokeDashoffset={`-${circ * 0.3}`} strokeLinecap="round" opacity="0.4" />
      </g>
    </svg>
  );
}
