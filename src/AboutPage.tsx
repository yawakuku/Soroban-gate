import { useState } from "react";

// Placeholder copy — fill in / edit later, same as the Expertise page.
const ABOUT_TEXT = "We build websites & digital tools that are simple to use & built to last.";

// The one place on the site written in first person — everywhere else is
// company voice ("we"), but this is Churchill's own story, sitting inside
// the Manifesto rather than on the main page.
const FOUNDER_STORY = [
  "I didn't start out trying to build an agency. I taught myself to code in my second year of university — I was studying mechanical engineering, and this was just something I did for fun on the side. I built small things for years without ever thinking of it as a real skill.",
  "That changed in 2025, when I needed it to actually work. I built a website on spec for a business I found on Google Maps, just to see if I could — I never managed to sell it, but a mentor of mine looked at it and told me it was solid, real work. That was enough to keep going.",
  "My first paying client wanted a full e-commerce site for a skincare brand — payments, an admin panel, the whole thing — before he'd even made the product yet. It was the hardest thing I'd built up to that point, and it worked. That's when I stopped thinking I could do this and started knowing it.",
  "Since then, I've noticed how many local businesses in Nigeria — some that have been running for years — have nothing online beyond an Instagram page. Not because the technology is hard to get. Because nobody's closed that gap for them properly. That's what Litpage is actually for — not just building sites for people who already know they need one, but reaching the ones who don't realize yet what they're missing.",
  "I'm not doing this mainly for the money. I want to look back in a few years and know Litpage is the reason a real business went from invisible to thriving.",
];

const MANIFESTO_POINTS = [
  "We build what you actually need — not what we'd choose for you.",
  "The businesses we care most about are the ones that don't know yet what they're missing.",
  "Technology should reach people where they are — even a feature phone with no data plan.",
  "We use every modern tool available, including AI — but nothing ships until a real person has checked it.",
  "One person who understands the whole system beats a team that only understands their own piece of it.",
  "You own what we build for you. The code, the data, all of it.",
];

const DRAWER_EASE = "cubic-bezier(0.77,0,0.18,1)";

/**
 * ABOUT — deliberately not the left-image/right-text split the other two
 * pages use. This is one plain white page, content aligned to the left,
 * with a "Manifesto" link that pulls a black drawer in from the left edge
 * to cover 75% of the screen. The remaining 25% strip on the right stays
 * visible underneath a blurred scrim — tap it (or the Close button in the
 * drawer) to dismiss.
 *
 * `manifestoOpen` lives here rather than in App.tsx on purpose: nothing
 * outside this page needs to know about it, and keeping it local means it
 * automatically resets to closed every time this component unmounts (i.e.
 * whenever the person navigates away), with no extra reset code needed.
 */
export function AboutPage() {
  const [manifestoOpen, setManifestoOpen] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", background: "#FFFFFF", position: "relative", overflow: "hidden" }}>
      {/* Main content — one large serif statement, left-aligned, positioned
          toward the upper part of the page (not vertically centered) so it
          has room to breathe above the manifesto link, matching the
          reference. No eyebrow label above it — the statement itself is the
          opening line, same as the reference. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "72%",
          maxWidth: "880px",
          minWidth: "320px",
          boxSizing: "border-box",
          padding: "0 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: "14vh",
        }}
      >
        <p
          style={{
            color: "#0B0B0D",
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "54px",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            margin: "0 0 36px",
          }}
        >
          {ABOUT_TEXT}
        </p>
        <button
          onClick={() => setManifestoOpen(true)}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#0B0B0D",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1.5px solid transparent",
            paddingBottom: "3px",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8102E"; (e.currentTarget as HTMLButtonElement).style.color = "#C8102E"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#0B0B0D"; }}
        >
          Read Manifesto
        </button>
      </div>

      {/* Scrim — dims and blurs whatever it sits over once the manifesto is
          open. It spans the full page; the opaque drawer covers 75% of it,
          so the effect only shows in the remaining 25% on the right — which
          is exactly the zone that closes the drawer when tapped. */}
      <div
        onClick={() => setManifestoOpen(false)}
        aria-hidden={!manifestoOpen}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,11,13,0.06)",
          backdropFilter: manifestoOpen ? "blur(4px)" : "none",
          WebkitBackdropFilter: manifestoOpen ? "blur(4px)" : "none",
          opacity: manifestoOpen ? 1 : 0,
          transition: `opacity 0.5s ${manifestoOpen ? "0.15s" : "0s"}`,
          pointerEvents: manifestoOpen ? "auto" : "none",
          cursor: manifestoOpen ? "pointer" : "default",
        }}
      />

      {/* Manifesto drawer — slides in from the left edge to cover 75% of the
          page. Signature black, same easing as every other drawer on the
          site, so it reads as the same piece of motion language. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: manifestoOpen ? "75%" : "0%",
          background: "#0B0B0D",
          overflow: "hidden",
          transition: `width 0.65s ${DRAWER_EASE}`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "96px 64px 40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Everything below — heading included — scrolls together as one
              unit, same principle as the Expertise page: no pinned header
              sitting apart from a separately-scrolling body. Only the Close
              button, as an action rather than content, stays outside it. */}
          <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none" }}>
            <span
              style={{
                display: "block",
                color: "#C8102E",
                fontSize: "11px",
                letterSpacing: "0.3em",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              What We Believe
            </span>
            <h2
              style={{
                color: "#F5F3EE",
                fontSize: "34px",
                fontWeight: 800,
                margin: "0 0 36px",
                letterSpacing: "-0.01em",
              }}
            >
              Manifesto
            </h2>

            {/* Founder's note — first person, clearly signed, then back to
                company voice for the belief list below. */}
            <div style={{ marginBottom: "40px" }}>
              <span
                style={{
                  display: "block",
                  color: "#C8102E",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                A Note From the Founder
              </span>
              {FOUNDER_STORY.map((para, i) => (
                <p
                  key={i}
                  style={{
                    color: "#F5F3EE",
                    opacity: 0.92,
                    fontSize: "17px",
                    lineHeight: 1.7,
                    maxWidth: "600px",
                    margin: i === FOUNDER_STORY.length - 1 ? 0 : "0 0 16px",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "32px", borderTop: "1px solid rgba(245,243,238,0.12)" }}>
              {MANIFESTO_POINTS.map((point, i) => (
                <p
                  key={i}
                  style={{
                    color: "#F5F3EE",
                    opacity: 0.92,
                    fontSize: "18.5px",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: "580px",
                  }}
                >
                  {point}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={() => setManifestoOpen(false)}
            style={{
              marginTop: "24px",
              flexShrink: 0,
              alignSelf: "flex-start",
              background: "none",
              border: "1.5px solid rgba(245,243,238,0.3)",
              borderRadius: "999px",
              padding: "10px 22px",
              color: "#F5F3EE",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8102E"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,243,238,0.3)"; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
