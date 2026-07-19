# Remnant Search Visibility Launch

## What the application now handles

- `/robots.txt` allows public content and excludes account, authentication, payment, and private dashboard routes.
- `/sitemap.xml` includes the main public pages and every active listing, with listing modification dates and stable image URLs.
- The sitemap refreshes every 30 minutes. Public marketplace data refreshes every 5 minutes.
- New, updated, and removed listings notify IndexNow when `INDEXNOW_KEY` is configured.
- Listing pages use readable slugs, self-referencing canonical URLs, unique metadata, and `Product` plus `BreadcrumbList` structured data.
- Public pages are server rendered. Private pages send `X-Robots-Tag: noindex`.
- Public HTML has a 60-second CDN cache; private and authentication pages remain uncached.

## Deployment order

1. Deploy the backend first. The frontend sitemap depends on `GET /listings/sitemap`, and crawler reads use `trackView=false`.
2. Deploy the frontend after the backend is healthy.
3. Open these URLs and confirm HTTP 200:
   - `https://36yevvooae.execute-api.us-east-1.amazonaws.com/listings/sitemap`
   - `https://remnantmarket.co/robots.txt`
   - `https://remnantmarket.co/sitemap.xml`
   - `https://remnantmarket.co/manifest.webmanifest`
4. Open one listing from the sitemap and confirm its title, description, canonical URL, and image preview are correct.

## Required environment values

Generate one IndexNow key and use the same value in the backend Lambda and frontend SST environments:

```powershell
[guid]::NewGuid().ToString("N")
```

Set:

```text
INDEXNOW_KEY=the_generated_value
```

Optional verification values:

```text
GOOGLE_SITE_VERIFICATION=token_only
BING_SITE_VERIFICATION=token_only
```

The DNS verification method in Google Search Console does not require `GOOGLE_SITE_VERIFICATION`.

## Google Search Console

1. Add `remnantmarket.co` as a Domain property.
2. Add the TXT record Google provides to the domain DNS.
3. Wait for DNS propagation, then select **Verify**.
4. Open **Sitemaps** and submit `https://remnantmarket.co/sitemap.xml`.
5. Inspect the homepage, marketplace, `/sell`, `/trade`, `/donate`, and one listing URL.
6. Request indexing for those launch pages. Do not repeatedly request the same URLs.
7. Check **Pages**, **Core Web Vitals**, **Product snippets**, and search performance weekly.

## Bing and AI search

1. Add the site in Bing Webmaster Tools or import it from Google Search Console.
2. Submit the same sitemap.
3. Confirm IndexNow submissions appear after creating or editing a listing.
4. Review Bing's AI Performance report when data becomes available.

## Authority and backlink work

- Use the exact business name, `Remnant Market`, and canonical domain on every social profile.
- Ask Nigerian repair shops, recyclers, donation organisations, circular-economy groups, universities, maker communities, and sustainability publications to link to the most relevant Remnant page.
- Publish original case studies based on real exchanges, such as a single item finding its pair or a damaged product being repaired.
- Seek editorial mentions, partner pages, founder interviews, and useful resource-list placements.
- Avoid buying bulk links, automated directory submissions, link exchanges, and keyword-stuffed guest posts.

Backlinks cannot be created credibly in application code. They must come from relevant third-party sites choosing to reference Remnant.
