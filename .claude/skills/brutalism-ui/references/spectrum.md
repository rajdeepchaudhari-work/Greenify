# Brutalism UI Spectrum Reference

Detailed breakdowns of each brutalist sub-style with component-level guidance.

## Table of Contents

1. Pure Brutalist
2. Neo-Brutalist
3. Industrial Brutalist
4. Deconstructed Brutalist
5. Component Recipes by Style

---

## 1. Pure Brutalist

The most extreme end. Websites that look like they were built in 1996 but on purpose, by someone who has opinions about Tadao Ando.

**Core traits:**

- Monochrome only (black, white, maybe one red accent)
- System fonts or monospace only (`Courier New`, `monospace`)
- No images or illustrations (text and borders only)
- Visible HTML structure — the `<hr>`, the `<fieldset>`, the `<table>` used for layout (ironically)
- Raw hyperlinks, default form elements, minimal or no CSS resets

**Best for:** Personal websites, developer portfolios, manifestos, blogs that want to scream "I am not a marketing page", documentation, artist statements, zines.

**Typography stack:**

```css
font-family: 'Courier New', Courier, monospace;
/* OR */
font-family: monospace;
```

**Color palette:**

```
Background: #FFFFFF
Text: #000000
Accent: #FF0000 (used sparingly — links or a single highlight)
Border: #000000
```

**Component style:**

- Buttons: `<button>` with default browser styling, or minimal override: black bg, white text, no radius, no shadow
- Cards: Simple `<div>` with `border: 2px solid #000` and `padding: 16px`. No shadow.
- Navigation: Horizontal list of underlined links. No hover effects beyond browser default.
- Forms: Default browser inputs with `border: 2px solid #000` override only.

---

## 2. Neo-Brutalist

The commercial-friendly evolution. Takes brutalist honesty and adds playful energy through color, thick shadows, and chunky proportions. This is what most people mean when they say "brutalist UI" in 2024+.

**Core traits:**

- Thick black borders (3px–5px) on everything
- Hard-offset box shadows (no blur, always black or dark)
- Saturated, flat colors in blocks — never gradients
- Chunky, confident typography with extreme size contrast
- Playful but structured — it feels designed, not abandoned

**Best for:** SaaS landing pages, product UIs, startup sites, creative agencies, e-commerce, any brand that wants to feel fresh and anti-corporate.

**Typography stack:**

```css
--font-display: 'Space Mono', 'JetBrains Mono', monospace;
--font-body: 'IBM Plex Sans', 'DM Sans', sans-serif;
/* Alt display options: 'Syne', 'Archivo Black', 'Anybody' */
```

**Color palettes (pick one per project):**

Warm energy:

```
Background: #FDF2E9 (warm cream)
Cards/Panels: #FFFFFF
Primary accent: #FF5252 (red)
Secondary accent: #FFEB3B (yellow)
Text & borders: #000000
Shadow: #000000
```

Cool confidence:

```
Background: #F0F4FF (ice blue)
Cards/Panels: #FFFFFF
Primary accent: #448AFF (blue)
Secondary accent: #69F0AE (mint green)
Text & borders: #1A1A2E
Shadow: #1A1A2E
```

Vibrant pop:

```
Background: #FFFDF7 (off-white)
Cards/Panels: rotating accent fills
Primary accent: #FF6D00 (orange)
Secondary accent: #E040FB (magenta)
Tertiary: #00E5FF (cyan)
Text & borders: #000000
```

Dark neo-brutal:

```
Background: #1A1A2E
Cards/Panels: #16213E
Primary accent: #FFEB3B (yellow)
Secondary accent: #FF5252 (red)
Text: #FFFFFF
Borders: #FFFFFF or #FFEB3B
Shadow: #FFEB3B or #FF5252
```

**Component style:**

- Buttons: Filled background, 3px black border, 4px hard shadow, uppercase mono text, hover lifts element
- Cards: White or colored fill, 3px border, 4px shadow, content stacked vertically with clear sections
- Navigation: Bordered bar with uppercase links, active state indicated by background fill (not underline alone)
- Tags/Badges: Small bordered rectangles with colored fills, mono text, no radius
- Modals: Thick-bordered box, solid color header bar, hard shadow offset from page center

---

## 3. Industrial Brutalist

The "control room" aesthetic. Think: factory dashboards, monitoring interfaces, shipping container labels, aircraft warning systems.

**Core traits:**

- Gray-dominant palette with safety-yellow or orange accents
- Stencil-like typefaces or heavy condensed sans-serifs
- Grid-heavy layouts resembling instrument panels
- Status indicators, progress bars, data readouts
- Caution-tape patterns, hash-mark borders, section numbers

**Best for:** Admin dashboards, data monitoring tools, developer consoles, analytics platforms, system status pages, IoT interfaces.

**Typography stack:**

```css
--font-display: 'Bebas Neue', 'Anton', 'Oswald', sans-serif;
--font-body: 'IBM Plex Mono', 'Overpass Mono', monospace;
--font-data: 'JetBrains Mono', 'Fira Code', monospace;
```

**Color palette:**

```
Background: #1A1A1A or #F0F0F0
Panel background: #2A2A2A or #FFFFFF
Primary accent: #FFD600 (safety yellow)
Warning: #FF6D00
Error: #FF1744
Success: #00E676
Text (dark mode): #E0E0E0
Text (light mode): #1A1A1A
Border: #666666 or #333333
Grid lines: #444444
```

**Component style:**

- Buttons: Dark background, yellow or white text, 2px border, uppercase condensed font, no shadow (shadows feel too playful for this variant)
- Cards/Panels: Bordered sections with header bars containing section numbers ("SEC.01", "PANEL 03")
- Data readouts: Monospaced numbers in bordered boxes with label above in condensed uppercase
- Navigation: Vertical sidebar with section numbers and abbreviated labels
- Tables: Visible grid lines on every cell, alternating gray rows, header in yellow/dark

---

## 4. Deconstructed Brutalist

The art-school variant. Rules exist to be broken. Grids exist to be shattered. Type exists to be layered, rotated, and scaled beyond reason.

**Core traits:**

- Overlapping elements, broken grids, collage composition
- Mixed type sizes — 12px next to 200px on the same screen
- Rotated text, diagonal elements, off-axis layouts
- High contrast but unpredictable — colors don't follow a "system"
- Visible layering (z-index as a design tool, not just a fix)

**Best for:** Creative portfolios, art galleries, experimental editorial, fashion sites, music projects, cultural institutions, event pages.

**Typography stack:**

```css
/* Mix aggressively — 3+ fonts is encouraged */
--font-display: 'Instrument Serif', serif;
--font-accent: 'Syne', 'Anybody', sans-serif;
--font-body: 'Space Mono', monospace;
/* Add Google Fonts like 'Playfair Display', 'Cormorant Garamond' for editorial contrast */
```

**Color approach:**
No fixed palette. Each section or element can have its own color logic. Clash intentionally.

```
Use high-saturation colors adjacent to each other
Black and white as structural anchors
Unexpected combinations: magenta + lime, navy + coral, brown + electric blue
```

**Component style:**

- Cards: Overlapping, rotated (`transform: rotate(-3deg)`), mixed sizes, some with borders, some without
- Navigation: Scattered across the page, or in an unexpected location (bottom-left, vertical along the right edge)
- Typography: Headings that overflow their containers, text that overlaps images, rotated labels
- Images: Mixed with text at unusual scales, masked with geometric shapes, positioned to break the grid
- Sections: No clear separation — content bleeds between sections intentionally

---

## 5. Component Recipes by Style

### Navbar

**Neo-Brutalist navbar:**

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 3px solid #000;
  background: var(--bg);
  font-family: var(--font-display);
}
.nav-link {
  text-decoration: none;
  color: #000;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 8px 16px;
  border: 2px solid transparent;
  transition: all 0.1s;
}
.nav-link:hover {
  border: 2px solid #000;
  background: var(--accent-2);
}
.nav-link.active {
  background: #000;
  color: #fff;
}
```

### Hero Section

**Neo-Brutalist hero:**

```css
.hero {
  padding: 80px 40px;
  border-bottom: 3px solid #000;
  background: var(--accent-2);
}
.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 120px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.hero p {
  font-family: var(--font-body);
  font-size: 18px;
  max-width: 600px;
  line-height: 1.6;
}
```

### Card Grid

**Neo-Brutalist card grid:**

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 40px;
}
.card {
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 24px;
  transition:
    transform 0.1s,
    box-shadow 0.1s;
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #000;
}
.card-tag {
  display: inline-block;
  background: var(--accent-1);
  color: #000;
  border: 2px solid #000;
  padding: 4px 10px;
  font-family: var(--font-display);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}
.card h3 {
  font-family: var(--font-display);
  font-size: 24px;
  margin-bottom: 8px;
}
.card p {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
}
```

### Form

**Neo-Brutalist form:**

```css
.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-family: var(--font-display);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  font-weight: 700;
}
.form-input {
  width: 100%;
  border: 3px solid #000;
  padding: 12px 16px;
  font-family: var(--font-display);
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  background: #fff9c4;
  box-shadow: 4px 4px 0px #000;
}
.form-input::placeholder {
  color: #999;
  font-style: italic;
}
```

### Dashboard Panel (Industrial)

```css
.panel {
  background: #2a2a2a;
  border: 2px solid #444;
  margin-bottom: 16px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #333;
  border-bottom: 2px solid #444;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #ffd600;
}
.panel-section-number {
  font-family: 'IBM Plex Mono', monospace;
  color: #999;
  font-size: 11px;
}
.panel-body {
  padding: 16px;
  color: #e0e0e0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}
.data-value {
  font-size: 36px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #ffd600;
  line-height: 1;
}
```

### Table (Industrial)

```css
.brutal-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}
.brutal-table th {
  background: #ffd600;
  color: #000;
  padding: 10px 16px;
  text-align: left;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
  border: 2px solid #000;
}
.brutal-table td {
  padding: 10px 16px;
  border: 1px solid #444;
  color: #e0e0e0;
}
.brutal-table tr:nth-child(even) {
  background: #2a2a2a;
}
.brutal-table tr:nth-child(odd) {
  background: #1a1a1a;
}
```
