# SEO Design — Issue #57

## Goal

Improve CoolTaxTool's search engine visibility and social sharing appearance. Target keywords: niche calculator terms (salary sacrifice, pension tax relief), brand (CoolTaxTool), then generic (UK tax calculator).

## Approach

Static HTML only — all changes in `index.html` and `public/` static files. No new dependencies, no build changes, no runtime JS changes.

## Changes

### 1. index.html

**Title:**
```
UK Tax Calculator & Visualiser — Salary, Pension, NI | CoolTaxTool
```

**Meta description:**
```
Visualise your UK tax breakdown — income tax, National Insurance, pension relief, salary sacrifice and more. See exactly where your money goes with interactive charts.
```

**Canonical URL:**
```html
<link rel="canonical" href="https://cooltaxtool.com/" />
```

**Open Graph tags:**
- `og:title` — same as page title
- `og:description` — same as meta description
- `og:image` — `https://cooltaxtool.com/og-image.svg`
- `og:url` — `https://cooltaxtool.com/`
- `og:type` — `website`
- `og:site_name` — `CoolTaxTool`

**Twitter Card tags:**
- `twitter:card` — `summary_large_image`
- `twitter:title` — same as page title
- `twitter:description` — same as meta description
- `twitter:image` — `https://cooltaxtool.com/og-image.svg`

**JSON-LD structured data (WebApplication schema):**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CoolTaxTool",
  "description": "UK Tax Calculator & Visualiser — income tax, National Insurance, pension relief, salary sacrifice and more.",
  "url": "https://cooltaxtool.com/",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  }
}
```

### 2. public/sitemap.xml (new)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cooltaxtool.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 3. public/robots.txt (updated)

```
User-agent: *
Allow: /

Sitemap: https://cooltaxtool.com/sitemap.xml
```

### 4. public/og-image.svg (new)

Branded 1200x630px SVG image:
- Dark background matching app aesthetic
- "CoolTaxTool" brand name + tagline
- Simplified chart/breakdown visual
- `cooltaxtool.com` URL at bottom

## Rejected Alternatives

- **react-helmet / vite-plugin-html**: Adds dependency, client-side rendering means crawlers may miss tags. Over-engineered for single-page app.
- **SSR / prerendering**: Massive overkill for a single-page app with no routing.
