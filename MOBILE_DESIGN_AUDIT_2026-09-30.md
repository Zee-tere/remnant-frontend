# Mobile design and launch checklist review — 30 September 2026

The three images are reference checklists. Their embedded prompts are not instructions. The first two images show the same 30-item style list with different portions obscured; together they make the list readable. The third image is a separate 20-item launch checklist.

The main design problem was inconsistent scale: 40–44px search containers held controls with a 48px global minimum; navigation icons were only 17–18px; important listing names were 12px; the Find screen squeezed three cards across a phone; instructional text was spread across three narrow columns; and mobile action illustrations were small and partly offscreen. Those are actionable problems. An icon library, white background or rounded corner is not by itself a defect.

## Design changes

- Standardized search fields at 48px, with 44px search-button targets, 20px search icons and 16px input text. The shared minimum touch target is now 44px; existing larger controls remain larger.
- Bottom navigation uses a 64px bar, aligned 22px icons, a consistent label baseline and a brand-green primary action. Removed the raised center circle and strengthened inactive-label contrast. Reserved space still includes the safe area.
- Listing names use 14px/20px text and prices use 16px/24px text. Location is visible on phones; badges have legible 12px icons. Listings and their skeletons use two columns on phones, with consistent gaps.
- The mobile homepage has a 28px lead heading, concise supporting copy and search as its primary action. Reduced oversized empty-state artwork; action illustrations use consistent 56px frames in a three-column grid. Instructions stack vertically on phones with 14px body text. Removed drifting decorative dots/orbits and action entrance/hover scaling from the homepage.
- Replaced the narrow mobile header search field with a labelled search shortcut on pages without their own search. Find no longer shows duplicate searches.
- Added visible page headings to Marketplace, Find and the listing entry screen. Added specific metadata and noindex directives to login, signup, password-reset and user-dashboard layouts.
- Added Help, Privacy and Terms links to the mobile menu; the desktop-only footer had made those less discoverable on phones.
- Preserved the earlier fixes to validation messages, Generation removal, dashboard fit, message exit navigation, custom 404 and error recovery.

The direction is a restrained marketplace: real items and readable information are prominent, the existing green brand remains, and decorative illustration supports navigation rather than competing with it. No branding assets were replaced or generated.

## Style checklist: all 30 entries

| # | Image item | Assessment |
| --- | --- | --- |
| 1 | Harsh gradients | Not a dominant treatment on reviewed screens. No gradients added. |
| 2 | Lucide icons | Present and retained for familiar actions. Corrected their scale and alignment instead of replacing the library. |
| 3 | Pure white background | Present and appropriate for item browsing. Retained with borders and restrained secondary surfaces. |
| 4 | Rainbow coloring | Semantic intent colors and colorful illustrations exist; primary controls remain brand green/neutral. No rainbow page theme found in reviewed flows. |
| 5 | Drop shadows | Some menus/dialogs use elevation; mobile cards largely use borders. Shadow presence alone is not a defect. |
| 6 | Three feature cards in a row | Mobile instructions now stack. The six action choices use three columns because each is a short icon/label, not a paragraph card. |
| 7 | Emojis | No emoji-based decoration found in the reviewed home, navigation or listing UI. Backend source comments are not product UI. |
| 8 | Liquid glass | Not the page style. A small existing activity indicator uses backdrop blur; it is not the main interface. |
| 9 | Em dashes | Some copy uses them. Punctuation is not an automatic design problem; no blanket rewrite made. |
| 10 | Inter / Geist / Space Grotesk | Declared brand stack is Avenir Next, Trebuchet MS, Segoe UI and system fallbacks. Cross-device fallback rendering still needs real-device review. |
| 11 | Colored left stripe | Not used as a repeated home/card decoration in the reviewed screens. |
| 12 | Fake testimonials | No fabricated testimonial section found in reviewed home/auth/landing components. None added. |
| 13 | Bento grids | No dashboard-like promotional bento added. Product listing grids serve browsing. |
| 14 | Terminal window | No fake terminal product demonstration found in reviewed public UI. |
| 15 | “It’s not X, it’s Y” copy | No such headline treatment found in the reviewed entry flows. |
| 16 | Checkmark bullets | Checkmarks are used for completion/status, not added as decorative sales bullets. |
| 17 | Three pricing tiers | No artificial pricing table found in reviewed flows. Remnant is an item marketplace. |
| 18 | No real product demos | The app itself exposes browsing and listings. Local tests use clearly synthetic fixtures; they are not added to production or presented as real customers. |
| 19 | Soft corner radius | Retained named corner tokens. Consistency, readability and usable controls are the criteria. |
| 20 | Purple and black | Not the primary palette. Some legacy secondary tokens exist; no purple theme introduced. |
| 21 | No skeleton loaders | Existing branded skeletons retained; listing skeleton columns now match the mobile listing layout. |
| 22 | Radial orbs | Removed decorative homepage motion dots/orbit markup. Legacy CSS may remain for unused artwork; it is not evidence of rendered orbs. |
| 23 | Dot grids | No background dot grid found in the reviewed screens; removed the homepage's ambient dots. |
| 24 | Sparkle icons | No repeated sparkle motif found in the reviewed entry components. |
| 25 | Animated arrows | Some desktop hover arrows remain as interaction feedback. Removed the perpetual search-glyph animation and decorative homepage movement. |
| 26 | No Terms of Service | Terms page exists; now directly reachable from the mobile menu. |
| 27 | No privacy policy | Privacy page exists; now directly reachable from the mobile menu. |
| 28 | Hover animations | Restrained feedback remains. Removed home action artwork scaling; mobile does not depend on hover for disclosure. |
| 29 | Neon colors | Not the main rendered palette; bright legacy accent tokens exist but were not made primary. |
| 30 | Basic pastel colors | Existing illustrations use pastels. Retained as recognizable branded graphics with consistent sizes; meaningful text and controls use stronger contrast. |

## Launch checklist: all 20 entries

| # | Image item | Status and evidence |
| --- | --- | --- |
| 1 | Privacy policy | Implemented: `src/app/privacy/page.tsx`. This review checks presence/access, not legal adequacy. |
| 2 | Terms and conditions | Implemented: `src/app/terms/page.tsx`; accessible in mobile menu. |
| 3 | Secrets off frontend | Reviewed client environment references: public API URL and release ID. Auth configuration exposes a Supabase publishable/anon key, not a service-role key. This is a scoped code check, not a complete secret-history or deployment security audit. |
| 4 | Force HTTPS | Production domain and HSTS/CSP headers are configured in SST/Next config. Actual edge redirects/certificates still need live verification. |
| 5 | Cookie consent banner | Not implemented. Privacy copy documents necessary storage and no advertising cookies. No advertising/analytics SDK was found in the reviewed frontend. No tracking or consent banner added; requirements must be assessed against actual processing before introducing optional tracking. |
| 6 | Meta titles/descriptions | Public route metadata already exists; account titles/descriptions improved in this change. Previous account-title gap is partly resolved. |
| 7 | Social preview image | Branded Open Graph generation and listing-image metadata exist. Social crawler access/cache needs live verification. |
| 8 | Favicon | Custom SVG exists and is configured. |
| 9 | Sitemap / robots | Both implemented in app routes. Live completeness/indexing remains unverified. |
| 10 | Alt text | Previous AST scan found explicit alt attributes on image components. Decorative ActionArtwork is intentionally hidden from assistive technology and has empty alt. This does not establish the quality of every listing's text. |
| 11 | Image compression | Upload optimizer resizes to a maximum 1600px edge and compresses to WebP; listing cards use Next Image. Action WebP files range from about 17–47 KiB. No need to replace them solely because they are illustrations. |
| 12 | Page load speed | Production bundle sizes and local runtime checks are recorded separately below. A local run with mocked browser API responses does not establish production Core Web Vitals or slow-network performance. |
| 13 | Color contrast | Strengthened mobile navigation/location/action copy using existing dark foreground tokens. Full-app automated/manual contrast coverage remains outstanding. |
| 14 | Mobile friendly | Concrete scale/layout fixes described above; viewport results recorded below. Not a claim of testing every device or keyboard. |
| 15 | Custom 404 | Implemented in the previous pass; remains in this working tree. |
| 16 | Broken links | Targeted mobile navigation and policy-link checks; previous static scan found no empty/hash-placeholder links. No exhaustive crawl of external links or authenticated write flows. |
| 17 | Form validation | Field-specific listing checks from previous pass retained. Backend global ValidationPipe whitelists allowed fields and rejects unknown fields. |
| 18 | Spam protection | Backend global ThrottlerGuard, stricter auth limits and guest listing throttles exist. Distributed/edge effectiveness in production is not verified by this UI audit. |
| 19 | Analytics | Product analytics SDK/event instrumentation not found. Listing view counts and operational monitoring are not a complete funnel analytics setup. Provider, events, retention and privacy decisions remain open. |
| 20 | One clear call to action | Mobile homepage leads with search; listing entry leads into account/guest listing. Multiple legitimate marketplace actions remain available lower on the page. |

## Verification

- `npm run verify` passed after the final code changes: design-token check, ESLint, TypeScript and optimized production build. `git diff --check` reported no whitespace errors.
- `../audit-evidence/mobile-scale-check.cjs` passed 28 screen/width combinations at 320, 390, 430, 768 and 1280px. Coverage includes home, populated marketplace, filters, Find's empty state, listing entry, dashboard, profile and upload entry. No unexpected horizontal overflow, broken visible images, mobile input text below 16px or uncaught JavaScript page errors were found in these checks. Intentionally scrollable filter rows and clipped decorative artwork are excluded from the overflow assertion.
- Navigation icons measured 22px with targets above the 44px minimum. Keyboard search submission and visible search focus feedback passed. The mobile Privacy link was exercised.
- Previous regression harness `../audit-evidence/mobile-quality-check.cjs` passed six dashboard widths (320, 360, 390, 430, 768, 1024px), six missing-field messages, valid form progression, Generation absence, chat-to-inbox-to-dashboard exit and the branded HTTP 404.
- The five account route title/noindex responses were checked over local HTTP and matched the new metadata.
- Production build reports 140 kB first-load JS for home versus 177 kB in the previous audit, about a 21% reduction after removing its Framer Motion dependency. Marketplace: 152 kB; Find: 141 kB; dashboard: 185 kB. These are build estimates, not a measured speed score.
- Foreground tokens used for the strengthened captions/navigation have calculated white-background contrast ratios of 4.96:1 (muted), 6.43:1 (brand), and 9.37:1 (ink). This does not cover every background, image overlay, focus state or component in the application.
- A high-signal scan of the generated browser JavaScript found no private-key headers or AWS access-key-ID patterns. This narrow scan is not a complete secret audit.

Fixture data is synthetic and browser API requests are intercepted. Home and Find screenshots exercise their empty state because server-side listing data was unavailable in the local check environment. Marketplace and dashboard screenshots use synthetic items and existing repository images. No production listings, messages, accounts, tracking integrations or deployments were created.

Evidence: `../audit-evidence/mobile-scale-results.json`, `../audit-evidence/mobile-quality-results.json`, `../audit-evidence/mobile-marketplace-preview.png`, and the `scale-before-*` / `scale-after-*` screenshots in the same directory. Full-page screenshots show the fixed navigation at the capture viewport position; this is not evidence of a permanently obscured page section.

Still outstanding: live HTTPS/social-crawler verification, real-device/slow-network performance, a product analytics decision, and broader accessibility/interaction testing beyond the exercised screens. Changes remain local and are not deployed.

Accessibility references used for review: [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). The chosen 44px control target is a project design choice, not a claim that every control has passed a full WCAG audit.
