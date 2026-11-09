// Content for the Expertise page's two panels. The interactive shell (circle
// button, drawer, menu overlay, full-view toggle) lives in App.tsx and is
// shared with the homepage — this file only supplies what goes inside it.

import { useEffect, useRef, useState } from "react";
import expertiseToolsImg from "./imports/expertise-tools.png";

// Each section pairs a plain-English line (what it means for a business
// owner reading this) with a detail line specific enough that a developer
// reading the same page recognizes real, current work — not marketing filler.
const EXPERTISE_SECTIONS = [
  {
    title: "Websites & Web Applications",
    plain:
      "A custom-built website — not a stretched template — fast to load, easy to update, and built to hold up as the business grows. That's a marketing site just as easily as it's a full web app with logins, dashboards, and real logic running behind the scenes.",
    detail:
      "Built on Next.js 15 (App Router) with TypeScript and Tailwind CSS, deployed on Vercel's edge network — type-safe from the database to the UI, so whole categories of bugs get caught before a site ever goes live. This is the daily foundation; almost everything else here is built on top of it.",
  },
  {
    title: "Online Stores & Payments",
    plain:
      "A full storefront — product pages, cart, checkout, and an admin dashboard simple enough to run day to day without calling a developer every time something needs to change.",
    detail:
      "Built Manficient and Sheficient — two skincare brands, one dark and minimal for men, one warm and gold-toned for women — sharing a single Next.js 15 + Supabase backend, with fully separate admin control over products, customers, and orders for each. Paystack handles payment for the Nigerian market, Cloudinary serves fast-loading product photography, and referrals track through QR codes built into checkout. The kind of app where invisible details matter — like a database security rule quietly stopping signed-out shoppers from seeing any products at all, caught and fixed before it ever reached a customer.",
  },
  {
    title: "Reaching Customers Beyond the Smartphone",
    plain:
      "Not every customer has a smartphone or a data plan, and not every good idea fits inside a normal website. We build for that gap too — tools that reach people through the phone they already have.",
    detail:
      "Built Orbit, a matchmaking platform that runs entirely over USSD — the *123# menus that work on any phone — using Africa's Talking's USSD, SMS, voice, and airtime APIs. It replaces photos with SMS-based social vouching, lets people record voice-note bios, and turns spare airtime into small icebreaker games. Built RangerNet on the same foundation: a community alert system for reporting anti-poaching activity by SMS, no app to install, deployed and running on Railway.",
  },
  {
    title: "Blockchain & Smart-Contract Engineering",
    plain:
      "For businesses working with digital payments or on-chain products, we also build on Stellar — a blockchain designed for fast, low-cost global payments — and its smart-contract platform, Soroban. This is the deepest, most technical part of what we do.",
    detail:
      "Built an AI-assisted reviewer that automatically checks Soroban smart-contract changes for security issues before they merge; a Rust CLI that detects wasteful contract storage patterns and generates the actual fix as a ready-to-apply diff, not just a warning; and an advisory-only risk-scoring SDK that flags suspicious transactions with a plain-English explanation for a human to act on — by hard design, it never blocks a transaction on its own. Also built a Rust library for reliably indexing on-chain events, and Wave Match, a tool that profiles a developer's GitHub history and matches them to well-suited open issues across the ecosystem. Beyond our own tools, we've contributed real smart-contract features — pausability, batch sending, multi-sig emergency access, token-gated tiers — to several other projects, plus backend and dashboard work: analytics endpoints, SEO and event-topic wiring, a TVL widget, wallet polling. All of it moves through the Stellar ecosystem's official Drips Waves grant program and the Stellar Community Fund.",
  },
  {
    title: "Open-Source Tools for Other Developers",
    plain:
      "Some of what we build isn't for a business at all — it's for other developers, the unglamorous stuff that quietly saves people time.",
    detail:
      "A library of React hooks for Stellar, a visual transaction builder, a plain-English translator for cryptic on-chain error codes, a multi-sig coordination UI, a form generator, and a testing library carrying 191 passing tests. Small tools, built to actually get used rather than just shipped.",
  },
];

/**
 * LEFT — the real tools/logo image, dropped in as a single flat picture.
 * Same scroll-sync mechanism as before: this panel has no scrollbar of its
 * own (overflow:hidden), and its position is driven entirely by
 * `scrollProgress` (0–1) from the right-side text column, so both reach
 * their end together regardless of how tall either one is. Swapping the
 * image file is the only thing that changed here — the measuring logic
 * (ResizeObserver on the wrapper) picks up whatever height it renders at
 * automatically, exactly as it did for the placeholder grid before it.
 *
 * Background is set to #F2EEE6 to match this image's actual background
 * pixel-for-pixel (it samples very slightly warmer than the #F5F3EE
 * originally specified) — that match matters here specifically because
 * this is a tall image inside a shorter, scrolling window, so any mismatch
 * would show as a visible seam whenever the image doesn't fully cover the
 * panel (e.g. if it's ever shorter than the viewport). Swap this back to
 * #F5F3EE if you re-export the image to hit that exact hex instead.
 */
export function ExpertiseLeftPanel({ scrollProgress }: { scrollProgress: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxShift, setMaxShift] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => {
      setMaxShift(Math.max(0, content.scrollHeight - container.clientHeight));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  const translateY = -scrollProgress * maxShift;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#F2EEE6",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <img
          src={expertiseToolsImg}
          alt="Tools and technologies: Next.js, TypeScript, Tailwind CSS, Supabase, Stellar/Soroban, Rust, Paystack, Cloudinary, Vercel, GitHub, PostgreSQL, Figma"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </div>
  );
}

/**
 * RIGHT — the whole panel is a single scrolling column: eyebrow, heading,
 * every section, and the closing note all move together as one page. There
 * is no pinned/fixed zone and no divider lines between sections — sections
 * are separated by whitespace and typography alone, so it reads as one
 * continuous page rather than a stack of separate blocks.
 */
export function ExpertiseRightPanel({ onScrollProgress }: { onScrollProgress: (pct: number) => void }) {
  // Reports scroll position as a 0–1 fraction, not raw pixels — that's what
  // lets the left image match it directly regardless of either column's
  // actual height.
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    onScrollProgress(max > 0 ? el.scrollTop / max : 0);
  };

  return (
    <div
      className="no-scrollbar"
      onScroll={handleScroll}
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        scrollbarWidth: "none",
        boxSizing: "border-box",
        zIndex: 1, // sits below the fixed wordmark + fade mask in App.tsx
      }}
    >
      <div style={{ padding: "108px 48px 88px", maxWidth: "560px" }}>
        {/* Header — scrolls away with everything else, no longer pinned. */}
        <div style={{ marginBottom: "48px" }}>
          <span
            style={{
              color: "#C8102E",
              fontSize: "12px",
              letterSpacing: "0.32em",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            What We Do
          </span>
          <h1
            style={{
              color: "#F5F3EE",
              fontSize: "38px",
              fontWeight: 800,
              margin: "12px 0 0",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Expertise
          </h1>
          <p
            style={{
              color: "#F5F3EE",
              opacity: 0.92,
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: 1.75,
              margin: "20px 0 0",
            }}
          >
            At Litpage, we build the digital side of a business end to end — the
            website itself, the store behind it, and the tools that keep it running
            quietly in the background. We've done this from both ends: simple,
            hand-built sites for local businesses when that's what the job needed, and
            full production platforms with real infrastructure when it wasn't. Below is
            the complete picture — plain enough to skim, detailed enough to hold up if
            you hand it to your most technical friend.
          </p>
        </div>

        {EXPERTISE_SECTIONS.map((s) => (
          <div key={s.title} style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ width: "3px", height: "18px", borderRadius: "2px", background: "#C8102E", flexShrink: 0, display: "inline-block" }} />
              <h2 style={{ color: "#F5F3EE", fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
                {s.title}
              </h2>
            </div>
            <p style={{ color: "#F5F3EE", opacity: 0.92, fontWeight: 500, fontSize: "15px", lineHeight: 1.75, margin: "0 0 14px" }}>
              {s.plain}
            </p>
            <p style={{ color: "#9B9A96", fontWeight: 400, fontSize: "13.5px", lineHeight: 1.75, margin: 0 }}>
              {s.detail}
            </p>
          </div>
        ))}

        {/* Closing note — same visual treatment as the sections above, so it
            flows as part of the same page rather than sitting apart from it. */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ width: "3px", height: "18px", borderRadius: "2px", background: "#C8102E", flexShrink: 0, display: "inline-block" }} />
            <h2 style={{ color: "#F5F3EE", fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
              One Team, the Whole Stack
            </h2>
          </div>
          <p style={{ color: "#F5F3EE", opacity: 0.92, fontWeight: 500, fontSize: "15px", lineHeight: 1.75, margin: "0 0 14px" }}>
            All of it — design, frontend, backend, payments, even blockchain-level
            engineering when a project calls for it — is handled end to end, without
            being passed between departments. Fewer handoffs, faster changes, and a
            single point of contact who actually understands the whole system, not
            just one piece of it.
          </p>
          <p style={{ color: "#9B9A96", fontWeight: 400, fontSize: "13.5px", lineHeight: 1.75, margin: 0 }}>
            Not sure which of this applies to you? That's normal — tell us what the
            business actually needs and we'll figure out the right shape for it
            together.
          </p>
        </div>
      </div>
    </div>
  );
}
