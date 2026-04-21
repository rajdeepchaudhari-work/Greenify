---
name: brutalism-ui
description: >
  Design and build user interfaces in the Brutalist web/app design style. Use this skill whenever the user asks for a brutalist UI, raw/unpolished interface, anti-design aesthetic, neo-brutalist design, or mentions keywords like brutalism, brutalist, raw UI, anti-design, exposed structure, ugly-beautiful, or stripped-back interface. Also trigger when the user wants a UI that intentionally breaks conventional polish with stark layouts, exposed grids, monospaced type, harsh borders, clashing colors, system-default elements, or deliberately unrefined aesthetics. Applies to any UI surface including websites, dashboards, landing pages, apps, components, forms, cards, nav bars, modals, and full-page layouts. If the user says make it brutal or wants something that looks like it was built by an engineer who does not care about looking pretty but cares deeply about honesty and function, this is the skill.
---

# Brutalism UI Design Skill

Create interfaces in the Brutalist design tradition — raw, honest, structurally exposed, and unapologetically bold. Brutalism in UI is not about being ugly; it's about stripping away decorative dishonesty and letting structure, typography, and content speak with full-volume clarity.

## Philosophy

Brutalist UI design descends from Brutalist architecture (béton brut — "raw concrete"). The core principles:

1. **Truth to materials** — HTML is the material. Don't hide it. Borders are borders. Buttons look like buttons. Links are underlined. Forms have visible outlines. The structure is the decoration.
2. **Function dictates form** — Every element earns its space by doing a job. No ornamental gradients, no soft shadows for "depth", no rounded corners to seem "friendly." If it doesn't serve the user's task, cut it.
3. **Rawness over refinement** — Imperfection is honesty. System fonts, default cursors, visible grid lines, harsh color juxtapositions. The beauty comes from the courage to be undecorated.
4. **Confrontational clarity** — Information hits you. No gentle fade-ins. No easing functions to cushion the blow. Content appears, fully formed, demanding attention.

## The Brutalism Spectrum

Brutalist UI is not a single look. Read `references/spectrum.md` for the full breakdown, but here's the quick map:

| Style                       | Vibe                                                                         | When to use                                                           |
| --------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Pure Brutalist**          | Black, white, monospace, borders everywhere, system defaults                 | Developer tools, manifestos, personal sites, portfolios with attitude |
| **Neo-Brutalist**           | Bold primary colors, thick black borders, chunky shadows, playful aggression | SaaS products, landing pages, apps that want to stand out             |
| **Industrial Brutalist**    | Grays, yellows, stencil fonts, caution-tape patterns, exposed grid           | Data dashboards, admin panels, monitoring tools                       |
| **Deconstructed Brutalist** | Overlapping elements, broken grids, mixed type sizes, collage energy         | Creative portfolios, editorial, art/culture sites                     |

Default to **Neo-Brutalist** unless the user specifies otherwise or the context clearly calls for a different sub-style. Neo-Brutalist is the most versatile and commercially viable while still feeling authentically brutal.

## Design Rules

### Typography

Typography is the skeleton of brutalist UI. It must be loud and structural.

- **Display/headings**: Use heavy, impactful fonts. Great choices: `'Space Mono'`, `'IBM Plex Mono'`, `'JetBrains Mono'`, `'Instrument Serif'`, `'Anybody'`, `'Syne'`, `'Archivo Black'`, `'Bebas Neue'`, `'Anton'`. For pure brutalism, use system monospace (`monospace`, `'Courier New'`).
- **Body text**: Monospaced or grotesque sans-serifs. `'IBM Plex Sans'`, `'Space Grotesk'`, `'DM Mono'`, `'Overpass Mono'`. Never use humanist or geometric sans-serifs (no Nunito, Poppins, Quicksand).
- **Size contrast**: Brutalism demands extreme typographic hierarchy. Headings should be AT LEAST 3x the body size. 48px–120px headings with 14px–16px body is standard. Go bigger when possible.
- **Letter-spacing**: Tight for headings (`-0.02em` to `-0.05em`), slightly open for uppercase labels (`0.05em` to `0.15em`).
- **Text-transform**: Use `uppercase` generously for labels, navigation, and section headers. It adds the mechanical, stenciled quality brutalism demands.
- **No font-smoothing tricks**: Let the type render raw. Don't add `-webkit-font-smoothing: antialiased` unless the OS default is genuinely broken.

### Color

Brutalist palettes are either monochrome or confrontational. No middle ground.

**Monochrome approach (Pure Brutalist):**

- Black (`#000000`) and white (`#FFFFFF`) only
- If you must add a color, make it one single accent — pure red (`#FF0000`), electric blue (`#0000FF`), or highlighter yellow (`#FFFF00`)

**Bold palette approach (Neo-Brutalist):**

- Backgrounds: Stark white, cream (`#FDF2E9`), pale yellow (`#FFF9C4`), light lavender (`#E8DEF8`), or muted pink (`#FADADD`)
- Primary elements: Pure black (`#000000`) for text and borders
- Accent blocks: Saturated, flat colors — no gradients. Think: `#FF5252`, `#448AFF`, `#FFEB3B`, `#69F0AE`, `#FF6D00`
- Shadows: Hard-offset box shadows only. `4px 4px 0px #000`, `8px 8px 0px #000`. NEVER use blur. NEVER use `rgba()` shadows.

**Industrial approach:**

- Grays: `#1A1A1A`, `#333`, `#666`, `#999`, `#CCC`, `#F0F0F0`
- Warning accent: Safety yellow `#FFD600` or orange `#FF6D00`
- Text on dark: `#E0E0E0` or raw white

### Borders and Containers

Borders are the most defining visual element of brutalist UI. They replace shadows, gradients, and background subtleties.

- **Width**: Minimum `2px`. Standard `3px`. Bold `4px–6px`. Never `1px` — that's too polite.
- **Style**: `solid` only. Never `dashed`, `dotted`, or `groove`. Those are decorative hedging.
- **Color**: Black (`#000`) or the darkest value in your palette. Borders must be unambiguous.
- **Border-radius**: `0` for pure brutalism. `0` is the default — corners are sharp because reality has edges. For neo-brutalist, you may use a small radius (`4px–8px` max) on interactive elements only.
- **Box-shadow (hard offset)**: This is the signature neo-brutalist effect. Always hard shadows with zero blur:
  ```css
  box-shadow: 4px 4px 0px #000; /* standard */
  box-shadow: 6px 6px 0px #000; /* bold */
  box-shadow: 3px 3px 0px var(--accent); /* colored */
  ```
- **Hover transforms**: On hover, shift the element AND the shadow to create a "press" effect:
  ```css
  .card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000;
  }
  .card:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #000;
  }
  ```

### Layout

- **Grids**: Use visible, structural grids. CSS Grid with `gap` and bordered cells. The grid IS the design, not something hidden beneath it.
- **Whitespace**: Either generous and deliberate, or nonexistent. No medium-safe spacing. Padding is either `40px+` or `8px`. Margins are either `0` or `60px+`.
- **Alignment**: Hard left-align by default. Center-alignment is a rare, intentional choice (for hero text or single CTAs only). Never justify text.
- **Overflow**: Let content overflow when it's dramatic. Oversized headings that break the container, images that bleed past borders — this is a feature, not a bug.
- **Stacking/Overlap**: Elements can overlap. Use negative margins or absolute positioning to create collage-like compositions in deconstructed variants.

### Interactive Elements

- **Buttons**: Thick bordered rectangles. Background color fill (not outline-style). Uppercase text. Hard shadow. Obvious hover state (color invert or shadow shift). Example:
  ```css
  .btn {
    background: #ffeb3b;
    color: #000;
    border: 3px solid #000;
    padding: 12px 24px;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 4px 4px 0px #000;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000;
  }
  .btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #000;
  }
  ```
- **Inputs**: Thick black borders. No rounded corners. Monospace placeholder text. Stark focus state (background color change or double-border, NOT a glow).
  ```css
  input,
  textarea {
    border: 3px solid #000;
    padding: 12px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    background: #fff;
    outline: none;
  }
  input:focus,
  textarea:focus {
    background: #fff9c4;
    box-shadow: 4px 4px 0px #000;
  }
  ```
- **Links**: Underlined. Always. Color them with the accent, or leave them black. On hover, swap background and foreground. Never remove the underline — that's a brutalist article of faith.
- **Cards**: Hard-bordered rectangles with distinct background fills. Stack them, tile them, offset their shadows. Each card should feel like a physical object on a desk.

### Animation and Motion

Brutalism is skeptical of decorative animation. Motion should be mechanical, not organic.

- **Allowed**: `transform: translate()` for press effects, `transition` with `0.1s` duration, `cubic-bezier(0,0,1,1)` (linear) or instant (`0s`). Marquee/ticker effects for text.
- **Forbidden**: `ease-in-out`, `ease`, spring physics, parallax scrolling, fade-ins, scale-ups, blur transitions. These are the UI equivalent of putting a throw pillow on a concrete bench.
- **Exception**: For neo-brutalist, subtle `0.15s` transitions on hover states are acceptable. Keep it snappy — the element should feel like it's being clicked, not caressed.

### Backgrounds and Textures

- **Flat colors**: The default. A single solid background per section.
- **Patterns**: CSS-only repeating patterns — grids, dots, diagonal lines, checkerboards. Never use image-based textures or noise overlays.

  ```css
  /* Dot pattern */
  background: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 20px 20px;

  /* Diagonal lines */
  background: repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px);
  ```

- **Gradient**: Only as a bold, visible two-color split — never subtle blends. `background: linear-gradient(90deg, #FF5252 50%, #FFEB3B 50%);`

## Implementation Workflow

When building a brutalist UI:

1. **Clarify the sub-style** — Ask or infer: Pure, Neo, Industrial, or Deconstructed? Default to Neo-Brutalist.
2. **Set the CSS foundation** — Define CSS variables for the palette, borders, shadows, and typography up front. See the variables template below.
3. **Build mobile-first** — Brutalism works beautifully on mobile because it's structurally simple. Start narrow, then add grid complexity for wider screens.
4. **Typography first, then layout, then color** — Get the type hierarchy locked before anything else. If the type doesn't hit hard, nothing else will save it.
5. **Test the "squint test"** — Squint at the result. Can you still see the structure? Good. Brutalist UI should be legible at 20% zoom.

### CSS Variables Template (Neo-Brutalist)

```css
:root {
  --bg: #fffdf7;
  --fg: #000000;
  --accent-1: #ff5252;
  --accent-2: #ffeb3b;
  --accent-3: #448aff;
  --border-width: 3px;
  --border-color: #000000;
  --shadow-offset: 4px;
  --shadow: var(--shadow-offset) var(--shadow-offset) 0px var(--border-color);
  --shadow-hover: 6px 6px 0px var(--border-color);
  --shadow-active: 2px 2px 0px var(--border-color);
  --font-display: 'Space Mono', monospace;
  --font-body: 'IBM Plex Sans', sans-serif;
  --radius: 0px; /* or 4px for soft neo-brutalist */
}
```

### Common Anti-Patterns (Things to AVOID)

These kill the brutalist aesthetic instantly:

- `border-radius: 12px` or higher — too friendly
- `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` — blurred shadows are the antithesis of brutalism
- Gradient backgrounds with more than 2 stops
- `opacity` transitions or `fade` keyframes
- Glassmorphism (`backdrop-filter: blur()`) — the exact opposite energy
- Neumorphism (soft extruded shadows) — brutalism's sworn enemy
- Rounded pill-shaped buttons
- Card borders lighter than `2px`
- Font weights lighter than `400` for body text
- Centered paragraph text
- Decorative SVG illustrations with soft curves and pastel fills

## Framework Notes

**React/JSX**: Use inline styles or CSS modules. Tailwind is acceptable if you use it for structural utilities only — avoid Tailwind's default rounded/shadow/opacity classes. Override them with custom config. Use CSS variables passed through `style` props for theming.

**HTML/CSS**: The most natural medium for brutalism. Raw HTML with a single `<style>` block is perfectly on-brand. Use Google Fonts CDN for typography.

**Accessibility**: Brutalism's high contrast and visible borders are GOOD for accessibility. Maintain it. Ensure focus states are thick and visible (not just color-based). Use semantic HTML. The raw aesthetic naturally aligns with accessible defaults — don't break that.

## Quick Reference

When in doubt, ask: "Would a 1970s concrete architect approve?" If the answer is "too soft," add more border. If the answer is "too decorative," remove the gradient. If the answer is "too safe," make the heading bigger.

For the full spectrum breakdown and visual examples of each sub-style, read `references/spectrum.md`.
