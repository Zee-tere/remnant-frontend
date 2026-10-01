# Application quality audit — 26 September 2026

The image was used as an audit checklist, not as instructions to execute. Not every item can be confirmed as fully covered. This audit combines source inspection, a production build, and local Chromium checks with synthetic account/listing/conversation data. Changes are local and have not been deployed.

## Image checklist

| Check | Finding | Evidence / remaining work |
| --- | --- | --- |
| Preview domain instead of a custom domain | Configured; live verification pending | `sst.config.ts` configures `remnantmarket.co` with a redirect from `www.remnantmarket.co`. Live requests were inaccessible from the available check tools; this does not establish that the site is down. |
| Generic page titles | Partly covered | Public marketplace, item, intent and information pages have specific metadata. `/login` still renders the general site title; account/dashboard routes need more specific titles. |
| Missing meta descriptions | Baseline covered | Root layout provides a description; public routes override it. Account routes inherit general copy rather than route-specific descriptions. |
| Default favicon | Covered | Custom `src/app/icon.svg`, explicitly configured in the root layout. Local response: 200, `image/svg+xml`. |
| No Open Graph image | Covered locally | `src/app/opengraph-image.tsx` produces a branded PNG. Local response: 200, `image/png`; listing metadata also supports listing images. |
| Missing canonical URLs | Covered for primary public pages | Homepage, marketplace, listing detail, intent and information pages declare canonicals. `/about` renders `https://remnantmarket.co/about`. Account routes do not all declare canonicals; robots disallows several private/auth paths. |
| Broken social previews | Locally verified; external verification pending | Rendered `/about` has both `og:image` and `twitter:image`, pointing to the generated social image. Actual crawler access and cached previews on WhatsApp/Facebook/X remain unverified. |
| No custom 404 | Fixed locally | Added `src/app/not-found.tsx` with marketplace/home links. Browser check confirms the branded heading and HTTP 404 for an unknown URL. |
| Generic loading states | Covered in the main flows | Branded loading marks, page shells, marketplace skeletons and dashboard skeletons exist, with contextual labels and status semantics. |
| Generic error messages | Improved; not universally eliminated | Listing validation now names the specific missing field. Added `src/app/error.tsx` with retry and marketplace navigation. Existing API errors intentionally hide technical server details, and some fallback messages remain general. |
| Broken H1 structure | Partially verified | Home, information pages and the exercised dashboard/listing routes provide page headings. No exhaustive accessibility audit of every conditional state was performed. |
| Missing alt text | Attribute coverage verified | TypeScript AST scan found no `img` or `Image` JSX elements missing an explicit `alt` attribute. This checks attribute presence, not the quality of every description or runtime data value. |
| No sitemap.xml | Implemented; live verification pending | `src/app/sitemap.ts` includes public static routes and public listings, with listing timestamps/images. `robots.ts` advertises the sitemap. Live response completeness was not verified. |
| Console errors | Passed in exercised local flows | No uncaught JavaScript page errors in the dashboard, messages and listing form tests with mocked API data. Real API/realtime failures and all production console output remain unverified. |
| Leftover console logs | No browser debug logs found | Source search found no `console.log`, `console.debug` or `console.info` in frontend `src`. This does not audit third-party runtime output or classify backend operational logs as defects. |
| Exposed source maps | No maps in local browser build | No `.map` files found under `.next/static`. Live CDN artifacts and historical deployments were not inspected. |
| Massive JS bundles | Measured; performance not fully assessed | Build reports 103 kB shared first-load JS; homepage 177 kB, dashboard 185 kB, listing detail 200 kB, sell form 201 kB. Dashboard sections use dynamic imports. These figures do not include every subsequently loaded chunk and are not a Core Web Vitals or low-end-device assessment. |
| Broken mobile layouts | Reported dashboard issues fixed and locally tested | Two-column phone statistics, wrapping names/values/badges/actions, single-column listings below 400 px, and flexible toolbar controls. No elements exceeded the viewport at 320, 360, 390, 430, 768 or 1024 px with long names and large prices. Other screens and real-device keyboard behavior need broader coverage. |
| Inconsistent UI spacing | Partly covered | Shared design tokens/components exist; `design:check` passes. Dashboard spacing was adjusted. This is not proof of visual consistency across every screen. |
| Dead buttons and links | Targeted checks passed; exhaustive coverage pending | Fixed inbox exit navigation and exercised chat → inbox → dashboard. New 404 links point to existing routes. AST scan found no literal empty, `#`, or `javascript:` href placeholders. Authenticated writes, external links and every control were not exhaustively tested. |

## Requested changes

- `UploadItem.tsx`: replaced the blanket basic-field error with precise item name, category, condition and state messages. Description/price errors remain specific. Pair size versus size system, earbud brand versus model, repair issue versus outcome, and recycle material versus handoff preference now distinguish the missing input. Whitespace-only conditional text is treated as missing.
- Removed Generation from the missing-piece form, initial state and new listing payload. Legacy backend matching support remains so existing listings are not rewritten or broken.
- `Listings.tsx`: adjusted narrow layouts and removed unnecessary truncation from names, prices and statistics; category/intention badges wrap and footer actions adapt to available space. Action menus now have accessible names.
- `Messages.tsx`: added a visible mobile Back to dashboard link in the inbox. The existing conversation back button returns to the inbox, providing an exit path without changing the full-screen composer layout.
- Added branded missing-page and route-error recovery screens.

## Validation and evidence

- `npm run verify`: lint, TypeScript and optimized production build passed.
- Final `npm run lint`: design-token policy and ESLint passed, including added recovery screens.
- `git diff --check`: no whitespace errors.
- Local Chromium checks: six viewport widths, selected-item toolbar, large values, long listing names, message navigation, six field-specific errors, valid form transition to review, Generation absent, custom 404, and no uncaught page errors.
- Fixture requests were intercepted. No account, listing or message was created in production.
- Browser harness: `../audit-evidence/mobile-quality-check.cjs` (uses the bundled local Playwright installation and a production server on `127.0.0.1:3100`). Results: `../audit-evidence/mobile-quality-results.json`. Screenshot: `../audit-evidence/dashboard-360.png`.

Remaining work before claiming the entire checklist is clear: deployment verification, route-specific account titles, actual social-crawler checks, wider authenticated interaction/accessibility coverage, and mobile performance measurement under realistic network/device conditions.
