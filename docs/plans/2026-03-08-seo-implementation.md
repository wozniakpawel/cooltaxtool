# SEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive SEO to CoolTaxTool — meta tags, Open Graph, Twitter Cards, structured data, sitemap, and OG image.

**Architecture:** All changes are static HTML and files in `public/`. No runtime JS, no new dependencies, no build config changes.

**Tech Stack:** HTML meta tags, JSON-LD, SVG, XML sitemap

---

### Task 1: Update title and meta description

**Files:**
- Modify: `index.html:17-23`

**Step 1: Update the title and meta description**

Replace lines 17-23 of `index.html`:

```html
    <meta
      name="description"
      content="Visualise your UK tax breakdown — income tax, National Insurance, pension relief, salary sacrifice and more. See exactly where your money goes with interactive charts."
    />
    <link rel="apple-touch-icon" href="/logo128.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>UK Tax Calculator &amp; Visualiser — Salary, Pension, NI | CoolTaxTool</title>
```

**Step 2: Run tests**

Run: `npx vitest run`
Expected: Tests pass. Note: The App.test.tsx test checks for `'UK Tax Calculator & Visualiser'` in the rendered header component, NOT the page title, so it should still pass.

**Step 3: Verify in browser**

Run: `npm run dev`
Check: Browser tab shows the new title.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(seo): update page title and meta description

Closes #57 (partial)"
```

---

### Task 2: Add canonical URL, Open Graph, and Twitter Card tags

**Files:**
- Modify: `index.html` (in `<head>`, after manifest link, before `</head>`)

**Step 1: Add the new meta tags after the `<title>` tag**

Insert after the `<title>` line:

```html
    <!-- Canonical -->
    <link rel="canonical" href="https://cooltaxtool.com/" />
    <!-- Open Graph -->
    <meta property="og:title" content="UK Tax Calculator &amp; Visualiser — Salary, Pension, NI | CoolTaxTool" />
    <meta property="og:description" content="Visualise your UK tax breakdown — income tax, National Insurance, pension relief, salary sacrifice and more. See exactly where your money goes with interactive charts." />
    <meta property="og:image" content="https://cooltaxtool.com/og-image.svg" />
    <meta property="og:url" content="https://cooltaxtool.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CoolTaxTool" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="UK Tax Calculator &amp; Visualiser — Salary, Pension, NI | CoolTaxTool" />
    <meta name="twitter:description" content="Visualise your UK tax breakdown — income tax, National Insurance, pension relief, salary sacrifice and more. See exactly where your money goes with interactive charts." />
    <meta name="twitter:image" content="https://cooltaxtool.com/og-image.svg" />
```

**Step 2: Run tests**

Run: `npx vitest run`
Expected: All 43 tests pass (meta tags don't affect component tests).

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(seo): add Open Graph and Twitter Card meta tags"
```

---

### Task 3: Add JSON-LD structured data

**Files:**
- Modify: `index.html` (in `<head>`, after Twitter Card tags, before `</head>`)

**Step 1: Add JSON-LD script block**

Insert after the Twitter Card tags:

```html
    <!-- Structured Data -->
    <script type="application/ld+json">
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
    </script>
```

**Step 2: Validate**

Run: `npx vitest run`
Expected: All 43 tests pass.

Optional: Copy the JSON-LD and paste into https://validator.schema.org/ to verify.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(seo): add WebApplication JSON-LD structured data"
```

---

### Task 4: Create sitemap and update robots.txt

**Files:**
- Create: `public/sitemap.xml`
- Modify: `public/robots.txt`

**Step 1: Create `public/sitemap.xml`**

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

**Step 2: Replace `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://cooltaxtool.com/sitemap.xml
```

**Step 3: Verify sitemap is served**

Run: `npm run dev`
Navigate to: `http://localhost:3000/sitemap.xml`
Expected: XML sitemap renders in browser.

Navigate to: `http://localhost:3000/robots.txt`
Expected: Shows updated robots.txt with Sitemap line.

**Step 4: Commit**

```bash
git add public/sitemap.xml public/robots.txt
git commit -m "feat(seo): add sitemap.xml and update robots.txt"
```

---

### Task 5: Create OG image

**Files:**
- Create: `public/og-image.svg`

**Step 1: Create `public/og-image.svg`**

Create a 1200x630 SVG with:
- Dark background (#333)
- "CoolTaxTool" brand name in white, large font
- "UK Tax Calculator & Visualiser" tagline below
- Simplified bar chart visual (coloured bars representing tax breakdown)
- "cooltaxtool.com" at bottom in smaller text
- Clean, professional look

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#333"/>

  <!-- Brand -->
  <text x="600" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="#fff" text-anchor="middle">CoolTaxTool</text>
  <text x="600" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#ccc" text-anchor="middle">UK Tax Calculator &amp; Visualiser</text>

  <!-- Simplified chart bars -->
  <rect x="250" y="320" width="100" height="200" rx="8" fill="#4CAF50"/>
  <rect x="390" y="360" width="100" height="160" rx="8" fill="#2196F3"/>
  <rect x="530" y="400" width="100" height="120" rx="8" fill="#FF9800"/>
  <rect x="670" y="430" width="100" height="90" rx="8" fill="#f44336"/>
  <rect x="810" y="460" width="100" height="60" rx="8" fill="#9C27B0"/>

  <!-- Bar labels -->
  <text x="300" y="310" font-family="system-ui, sans-serif" font-size="14" fill="#ccc" text-anchor="middle">Take Home</text>
  <text x="440" y="350" font-family="system-ui, sans-serif" font-size="14" fill="#ccc" text-anchor="middle">Income Tax</text>
  <text x="580" y="390" font-family="system-ui, sans-serif" font-size="14" fill="#ccc" text-anchor="middle">NI</text>
  <text x="720" y="420" font-family="system-ui, sans-serif" font-size="14" fill="#ccc" text-anchor="middle">Pension</text>
  <text x="860" y="450" font-family="system-ui, sans-serif" font-size="14" fill="#ccc" text-anchor="middle">Student Loan</text>

  <!-- URL -->
  <text x="600" y="600" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#888" text-anchor="middle">cooltaxtool.com</text>
</svg>
```

**Step 2: Verify image renders**

Run: `npm run dev`
Navigate to: `http://localhost:3000/og-image.svg`
Expected: Branded image displays correctly.

**Step 3: Commit**

```bash
git add public/og-image.svg
git commit -m "feat(seo): add branded OG image for social sharing"
```

---

### Task 6: Final verification

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All 43 tests pass.

**Step 2: Build and verify**

Run: `npm run build`
Expected: Clean build, no errors. Check `build/` output includes sitemap.xml, robots.txt, og-image.svg.

**Step 3: Verify all meta tags in built HTML**

Run: `cat build/index.html`
Verify: title, meta description, canonical, OG tags, Twitter tags, JSON-LD all present.

**Step 4: Test with Google Rich Results Test**

After deploy, paste `https://cooltaxtool.com/` into https://search.google.com/test/rich-results to verify structured data.

**Step 5: Test with social sharing debuggers**

After deploy:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
