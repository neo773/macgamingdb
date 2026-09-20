# MacGamingDB — SEO issue register

Built 2026-09-20 from: GSC export (16 months), Ahrefs trial scrape, live-site crawl, Google Autocomplete harvest.
Every "verdict" row was checked against a current source. Myths are marked as such.

---

## Status (updated 2026-09-20, verified against the running app)

| #   | Issue                        | Status                                                              |
| --- | ---------------------------- | ------------------------------------------------------------------- |
| 1   | No category / hub pages      | Done — 19 pages                                                     |
| 2   | Only 14 real backlinks       | Not started (digital PR, not code)                                  |
| 3   | Steam boilerplate on top     | Done — Mac verdict first, gated by report count                     |
| 4   | Titles too long / duplicated | Done                                                                |
| 5   | `/blog` broken               | Partly — unique title/description/canonical; still one 61-word post |
| 6   | `/roadmap` 404               | **FALSE FINDING — withdrawn, see below**                            |
| 7   | Meta descriptions over-long  | Done                                                                |
| 8   | Filter URLs uncontrolled     | Done                                                                |
| 9   | Sitemap incomplete           | Done                                                                |
| 10  | JSON-LD client-side only     | Done                                                                |
| 11  | Zero AI Overview citations   | Inputs shipped (3 + 10); citations now depend on Google             |
| 12  | Six `<h1>` per page          | Done                                                                |
| 13  | Page weight 528KB            | Not started                                                         |
| 14  | 443 spam backlinks           | Decided: ignore. Manual-action check still outstanding              |

Measured after the fixes:

```
/                     h1:1  canonical:/               title:70   (root layout copy)
/blog                 h1:1  canonical:/blog           title:41
/contributors         h1:1  canonical:/contributors   title:26
/?q=arma              h1:1  robots:noindex, follow
/games/cyberpunk-2077 h1:1  canonical:/games/...      title:41  server JSON-LD: VideoGame
```

---

## P0 — biggest measured upside

### 1. No category / hub pages

**Evidence.** Sitemap is 1,572 URLs, every one `/games/*`. Zero category pages.
Autocomplete harvest found 1,813 real mac-gaming keywords; the site ranks for ~22.
Gap by page type: chip-landing 515 kw (ranks for 2), tool-landing 292 (0), best-of/genre 210 (0),
compatibility-hub 185 (13), store/platform 49 (0).

**Proof it works.** The 13 compatibility keywords it does rank for pull 296 clicks from 1,716
impressions at position 7.4 — **17% CTR**, the best surface on the site — with no dedicated page.
Separately `/?playMethod=NATIVE&chipset=M4-BASE`, a bare filter URL, holds **position 4.91 on
12,223 impressions**.

**Verdict — real, and the single biggest lever.** Pillar-cluster architecture averages 43% more
organic traffic than single-page strategies; category pages generate 3–5x the organic revenue of
individual detail pages. Google evaluates domain-level topical competence, not isolated pages.

**Fix.** Build `/mac-games/m4`, `/macbook-air-gaming`, `/mac-mini-gaming`, `/mac-compatible-games`,
`/crossover-mac-games`, `/parallels-gaming`, `/game-porting-toolkit`, genre pages. Each gets its own
title, H1, intro paragraph, and links down to game pages.

Source: https://www.xictron.com/en/blog/topical-authority-seo-strategy-2026/ ·
https://www.webtonic.io/blog/category-page-seo

---

### 2. Only 14 real backlinks (DR 11)

**Evidence.** 465 referring domains; 443 are junk (95%). 373 flagged SPAM by Ahrefs. 71% are
`.shop`/`.store`/`.xyz`. Genuine, traffic-carrying domains: github, substack, techradar, tweakers,
neogaf, inkl, mangadex, buymeacoffee, betteruptime, glarity, c99, monochrome, artistgrid, pp.ua.

**Verdict — real, and the reason for the position 8–10 ceiling.** Links remain one of the strongest
ranking signals. DR itself is a Moz/Ahrefs metric, not a Google ranking factor — the underlying link
scarcity is the actual problem.

**Fix.** Digital PR, not guest posts. 89.6% of practitioners rate digital PR the most effective
tactic; average campaign earns links from 42 unique domains. The site already owns a newsworthy
asset almost nobody else has: **original Apple Silicon FPS data across M1–M4 and CrossOver/DXMT/
D3DMetal**. That is exactly the "original data" angle journalists take. Pitch Ars Technica,
The Verge, Tom's Hardware, 9to5Mac, MacRumors, Eurogamer with a quarterly "state of Mac gaming"
data drop. Warm outreach converts at 15–30% vs 1–3% cold.

Source: https://bluetree.digital/digital-pr-link-building/ ·
https://www.clickrank.ai/is-domain-authority/

---

### 3. Steam boilerplate occupies the top of every game page

**Evidence.** Measured across 10 pages: Steam text averages 25% of visible words but sits _first_.
Unique Mac data starts ~15% down. On thin pages it dominates: half-sword 308 of 381 words (81%),
astroneer 317 of 485 (65%).

**Verdict — MYTH CORRECTED.** There is **no duplicate content penalty**. Google has said so
consistently for over a decade. What actually happens: Google picks one version and filters the
rest, diluting signals. Duplicate text is not poison — it is _dead weight in the best real estate_,
and in 2026 it also influences which version AI Overviews and ChatGPT/Perplexity cite.

**Also MYTH CORRECTED.** There is no minimum word count. Short is not thin; _valueless_ is thin.
So deleting the Steam text to "avoid duplicate content" would be fixing a non-problem while
gutting pages like half-sword (the #3 non-brand query, 2,666 impressions, position 7.4).

**Fix.** Do not delete. Demote below the Mac data, truncate to 2–3 sentences behind a "Read more",
and auto-generate a unique first paragraph from the existing review database:

> "Trackmania runs Excellent on Apple Silicon through CrossOver. Based on 8 reports averaging
> 4.6/5 across M1 to M4 Pro. Best results with DXMT at Ultra; D3DMetal fails to load Ubisoft overlays."

55% of AI Overview citations come from the first 30% of a page, and cited text is ~2x more likely to
use definitive language.

**GATE THIS — do not generate it for all 1,572 games.** A 40-game spread sample of the sitemap found:

| Reports per game         | Share   |
| ------------------------ | ------- |
| 0                        | 0%      |
| 1–2                      | **78%** |
| 3+                       | 23%     |
| 3+ _and_ ≥50% FPS filled | **18%** |

Median game has **1 report**. Across games with any report, FPS is filled on 62%, resolution 55%,
RAM 64%. Generating a confident verdict paragraph from a single anonymous report — then shipping it
across 1,572 near-identical templated pages — is precisely what Google's **scaled content abuse**
policy targets, and that policy was the primary target of the March 2026 core update. The named
patterns are "heavily templated pages with only token swaps" and "thin or low-value pages with
minimal main content."

**Rules.**

- ≥3 reports with specs → generate the confident verdict paragraph.
- 1–2 reports → state it plainly instead: "One report: CrossOver 25.0, M1 Air, playable, no FPS
  recorded." Honest, still unique text, no invented authority.
- 0 reports for a play method → show "No reports yet", never a status badge.
- Never state a verdict for a play method that has no reports behind it.

The ~18% that qualify skew heavily toward the games that already get traffic (RDR2 45 reports,
Elden Ring 23, BG3 22, No Man's Sky 36), so gating costs little actual SEO upside.

Source: https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated ·
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Source: https://www.konstructdigital.com/seo/duplicate-content-penalties/ ·
https://www.seobangkok.com/blog/what-is-thin-content-and-what-does-google-actually-penalise.html ·
https://cxl.com/blog/google-ai-overview-citation-sources/

---

## P1 — real, smaller, cheap

### 4. Titles too long, and duplicated across pages

**Evidence.** Game page title = 87 chars. Worse: `/`, `/blog` and `/contributors` all serve the
_identical_ title, "MacGamingDB | Apple Silicon Mac Games – Compatibility & Benchmarks".

**Verdict — real.** Optimal is 50–60 chars / ~600px. Google's cut is pixel width, not character
count. Google rewrote ~76% of titles in Q1 2025; titles of 51–55 chars had the **lowest** rewrite
rate (~40%). Duplicate titles across distinct pages is a straightforward crawl/relevance problem.

**Fix.** `Red Dead Redemption 2 on Mac – Apple Silicon FPS` (48 chars). Unique title per route.

Source: https://zyppy.com/title-tags/meta-title-tag-length/

---

### 5. `/blog` is broken

**Evidence.** 1,927 impressions, **0 clicks** over 16 months. The page has one post and 61 words,
reuses the homepage title, and is **absent from the sitemap**.

**Verdict — real.** Not a penalty, just a page with nothing to click.

**Fix.** Unique title + description, add to sitemap, or noindex it until there is real content.

---

### 6. ~~`/roadmap` returns 404~~ — WITHDRAWN, this was a false finding

**What I originally claimed.** That the header linked to a 404 `/roadmap` on every page.

**What is actually true.** Nothing links to `/roadmap`. The Roadmap item in the header and
footer points at `https://macgamingdb.userjot.com/`, which returns 200. I created this finding by
typing `/roadmap` into the address bar myself after seeing the word "Roadmap" in the nav, and then
reported the 404 as a site bug. Verified: no page contains `href="/roadmap"`.

**Fix.** None needed. Leaving this entry in place as a record of the error.

---

### 7. Meta descriptions over-long

**Evidence.** Game page description = 190 chars.

**Verdict — real but minor.** Google rewrites 60–70% of descriptions anyway. Not a ranking factor.
A cleanup pass typically lifts blended CTR 10–25% on genuinely underperforming pages.

**Fix.** ~150–160 chars, lead with the answer.

Source: https://www.straightnorth.com/blog/title-tags-and-meta-descriptions-how-to-write-and-optimize-them-in-2026/

---

### 8. Filter URLs indexed without control

**Evidence.** `/?playMethod=NATIVE&chipset=M4-BASE` (12,223 impr, pos 4.91),
`/?performance=GOOD`, `/?q=arma`, `/?q=division`, `/?playMethod=PARALLELS` all indexed.
Homepage has **no canonical tag**.

**Verdict — real, and the earlier "noindex them all" advice was WRONG.** Correct approach is a
three-tier strategy: index high-demand facets, canonicalise near-duplicates, block the rest.
Decision rule: if keyword research shows demand for that facet, index it; if not, `noindex, follow`.
Note Gary Illyes put faceted navigation at 50% of URL-pattern problems in Google's 2025 crawl report.

**Fix.** Promote the demand-backed facets (chipset, playMethod, performance) to real static routes —
these become the P0 category pages. `noindex, follow` the `?q=` search URLs and multi-facet combos.
Add a self-canonical to `/`.

Source: https://www.1digitalagency.com/blog/faceted-navigation-seo-in-2026-the-definitive-guide-to-indexing-and-crawl-budget/ ·
https://searchengineland.com/guide/faceted-navigation

---

### 9. Sitemap incomplete

**Evidence.** 1,572 URLs, all `/games/*`. Missing: homepage, `/blog`, `/contributors`.

**Verdict — real but minor.** These are internally linked so they get crawled anyway.

**Fix.** Add them. Cheap.

---

### 10. JSON-LD is client-side only

**Evidence.** `VideoGame` schema lives inside the vinext RSC stream (`rsc.push(...)`), not as a
server-rendered `<script type="application/ld+json">`. No `AggregateRating` despite having ratings
(e.g. 3.7/5 from 45 reports).

**Verdict — NUANCED; my earlier call was too harsh, then too dismissive.**

- Structured data is **not a ranking factor**. Confirmed repeatedly by Google.
- Googlebot **does** render client-side JSON-LD on a deferred pass. It is reaching Google — GSC
  shows 41,523 impressions with Product snippets.
- **But** GPTBot, ClaudeBot and PerplexityBot are plain HTTP crawlers that do **not** execute JS.
  Client-side JSON-LD is invisible to every AI crawler.
- And the site's existing rich results _underperform_: Product snippets 1.81% CTR vs 3.65% for
  plain results. So do not expect a CTR win.

**Fix.** Low priority for Google. Worth doing for AI visibility — see issue 11.

Source: https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript ·
https://jangwook.net/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026/ ·
https://www.searchenginejournal.com/google-structured-data-ranking/335781/

---

### 11. Zero AI Overview citations

**Evidence.** Ahrefs AI index: 62 responses across platforms — Copilot 42, ChatGPT 12,
Perplexity 8, **Gemini 0, AI Mode 0, AI Overviews 0**.

**Verdict — real, and it compounds with issues 3 and 10.** Queries without an AI Overview send
~33,500 clicks per million impressions; cited brands get 20,743; uncited get 9,445. 76%+ of AI
Overview citations come from page-one results, but structure and extractability decide who gets cited.

**Fix.** Server-render the JSON-LD (issue 10) so non-JS AI crawlers can read it, and put the
generated Mac-verdict paragraph first (issue 3). Those two together are the whole play.

Source: https://www.cognizo.ai/blog/google-ai-overviews-statistics ·
https://cxl.com/blog/google-ai-overview-citation-sources/

---

## P2 — cosmetic, contested, or ignore

### 12. Six `<h1>` tags per page

**Evidence.** RDR2 page: "MacGamingDB", "Red Dead Redemption 2", "Game Information",
"Ultimate Edition", "About the Game", "Mac Performance Stats".

**Verdict — MYTH, mostly.** John Mueller: it does not matter whether a page has one H1 or a hundred.
Nothing in the Dec 2025 or Mar 2026 core updates changed that. Counterpoint: a 2026 study found
93.5% of top-ranking results use a single H1, and multiple H1s are a genuine **accessibility**
problem for screen readers.

**Fix.** Fix it for accessibility and clean semantics, not for rankings. 20-minute job, no traffic
expected from it.

Source: https://www.stanventures.com/blog/multiple-h1-tags/ ·
https://www.boia.org/blog/multiple-h1-tags-are-bad-for-accessibility-and-seo

---

### 13. Page weight — 528KB HTML, 311KB inline script

**Evidence.** Game page: 528KB HTML, 310,981 bytes of inline script, 248 RSC pushes, 618ms TTFB.

**Verdict — real but a tiebreaker only.** Core Web Vitals are a confirmed ranking factor but not a
dominant one. Post-March-2026 update, position-1 pages pass CWV ~10% more often than position-9
pages. A fast thin page will not outrank a slow authoritative one. 2026 "good" thresholds:
LCP < 2.0s, INP < 200ms, CLS < 0.1.

**Fix.** Worth measuring with real field data before optimising. Do not prioritise over P0.

Source: https://whitelabelcoders.com/blog/how-important-are-core-web-vitals-for-seo-in-2026/

---

### 14. 443 spam backlinks

**Evidence.** ~4 new junk domains/day and accelerating (May 71 → Sep 121 in 20 days). 198 domains
carry an identical fake testimonial naming "SEOExpress.org".

**Verdict — IGNORE. Do not disavow.**

- Timing rules it out as the cause of the Dec 2025–Jan 2026 crash; the spam began May 2026.
- No observable harm: Jul 2026 (2,407 clicks) and Aug 2026 (2,440) were the best months on record,
  during the heaviest blasting.
- Google's systems already ignore this. The disavow tool is for verified manual actions or clear
  negative-SEO attacks, not routine cleanup — and misapplied it can remove links that were helping.

**Fix.** Check GSC → Security & Manual Actions once. If clean, do nothing. Re-check quarterly.

Source: https://almcorp.com/blog/google-disavow-tool/

---

## Not an issue — settled

- **The Dec 2025–Jan 2026 crash was not a penalty.** Impressions fell 24k/week → 2,079/week during
  the outage + link migration, then recovered. Aug 2026 (2,440 clicks) ≈ Nov 2025 peak (2,515).
- **Redirects are correct.** `/games/1174180` → `/games/red-dead-redemption-2` is a clean 308.
- **robots.txt is correct** and explicitly welcomes AI crawlers.
- **Ahrefs is blind to this niche.** It reports 23 keywords / 7 monthly visits against GSC's
  1,000+ keywords and ~2,400 monthly clicks. Its keyword database does not carry queries this
  long-tail. Use `docs/keyword-gap.md` instead. Ahrefs remains trustworthy for _links_.
