# Greenify — Task 2 Demonstration Deck

Static HTML presentation supporting the Task 2 video demonstration for CN6035.

## How to open

Simply open `slides/index.html` in any modern browser (Chrome, Firefox, Safari).
Everything needed (theme, fonts, runtime) is bundled in `slides/assets/`.

## Keyboard controls

| Key           | Action                                                        |
| ------------- | ------------------------------------------------------------- |
| `→` / `Space` | Next slide                                                    |
| `←`           | Previous slide                                                |
| `S`           | Open Presenter Mode (CURRENT · NEXT · SPEAKER SCRIPT · TIMER) |
| `T`           | Cycle theme                                                   |
| `F`           | Full-screen                                                   |
| `N`           | Toggle speaker-notes drawer                                   |

## Structure

10 slides:

1. Cover — title, author, links, embedded Stream recording
2. Agenda — the 6 talking points + timings
3. Problem — carbon-market black-box failures (with Guardian 2023 citation)
4. Architecture — 3-tier diagram (Client / Edge / State)
5. Stack — technology table
6. Smart contracts — 3 contract cards + ERC-1155 rationale
7. Blockchain lifecycle — transaction from click to Mongo upsert
8. Live demo script — 5-step walkthrough ordering for the video
9. Quality & security — coverage, verified contracts, threat model
10. Closing — limitations + Harvard references + Q&A

Each slide has a speaker script in `<aside class="notes">` (~150 words) to
support the voiceover.

## Recording the video

1. Open `index.html` in full-screen Chrome
2. Use OBS / Loom / macOS built-in screen recorder (Cmd+Shift+5)
3. Press `S` to get the presenter-mode popup with the scripts
4. Drive through the deck, stopping at slide 8 to switch windows to the live
   app for the demo portion
5. Upload to MS Stream and paste the link into slide 1

## Updating

Edit `index.html` for content; `style.css` for layout tweaks. The theme
(neo-brutalism) matches the deployed app's design system.
