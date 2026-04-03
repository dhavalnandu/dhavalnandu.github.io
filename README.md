# Dhaval Nandu – Portfolio Website

Personal portfolio and technical blog for a Senior SAP Technical Consultant. Built with [Astro](https://astro.build), deployed on GitHub Pages.

**Live site:** https://dhavalnandu.github.io

## Tech Stack

- **Astro 4** – Static site generation, zero JS by default
- **Markdown** – Blog posts via Astro Content Collections
- **Custom CSS** – No framework, fast and minimal
- **Shiki** – Syntax-highlighted code blocks in blog posts
- **Sitemap** – Auto-generated for SEO

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.astro   # Site navigation
│   │   └── Footer.astro   # Site footer
│   ├── content/
│   │   ├── blog/          # Markdown blog posts
│   │   └── config.ts      # Content collection schema
│   ├── layouts/
│   │   └── BaseLayout.astro  # HTML shell with SEO meta
│   ├── pages/
│   │   ├── index.astro       # Home
│   │   ├── about/index.astro # About & Experience
│   │   ├── blog/
│   │   │   ├── index.astro       # Blog index with search/filter
│   │   │   └── [...slug].astro   # Individual blog post
│   │   ├── projects/index.astro  # Projects
│   │   └── connect/index.astro   # Contact
│   ├── styles/
│   │   └── global.css       # All styles
│   └── consts.ts            # Site-wide constants
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── Dhaval_Nandu_Resume.pdf  # Add your resume here
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18.20+ or 20.3+
- npm

### Install & Run

```bash
npm install
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Adding Blog Posts

1. Create a new `.md` file in `src/content/blog/`
2. Use this frontmatter template:

```markdown
---
title: "Your Post Title"
date: 2025-01-15
description: "A brief description of the post for the blog index."
tags: ["SAP", "ABAP", "RAP"]
---

## Your Content Here

Write your post in Markdown. Code blocks are auto-highlighted:

\`\`\`abap
DATA lv_text TYPE string VALUE 'Hello'.
\`\`\`
```

### Supported Tags

Use any combination of: `SAP`, `ABAP`, `RAP`, `CDS`, `AMDP`, `Performance`, `S4HANA`, `OData`, `Integration`

### Draft Posts

Add `draft: true` to frontmatter to hide a post from the blog index while keeping the file.

## Customizing Content

### Updating Personal Info

Edit `src/consts.ts`:

```typescript
export const SITE_TITLE = 'Dhaval Nandu';
export const SITE_DESCRIPTION = '...';
export const SITE_URL = 'https://dhavalnandu.github.io';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/dhaval-nandu/';
export const EMAIL = 'dhavalknandu@gmail.com';
```

### Adding Projects

Edit the `projects` array in `src/pages/projects/index.astro`.

### Adding Expertise Cards

Edit the `expertise-grid` section in `src/pages/index.astro` or `src/pages/about/index.astro`.

### Resume PDF

Place your resume as `public/Dhaval_Nandu_Resume.pdf`. The "View Resume" button links to this file.

## Deploying to GitHub Pages

### Option 1: GitHub Actions (Recommended)

1. Push this repo to GitHub as `yourusername/dhavalnandu.github.io`

2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Go to **Settings > Pages** in your repo
4. Set source to **GitHub Actions**
5. Push to `main` – the site deploys automatically

### Option 2: Manual Deploy

```bash
npm run build
npx gh-pages -d dist
```

### Custom Domain

1. Add a `CNAME` file in `public/` with your domain:
   ```
   dhavalnandu.com
   ```

2. Update `site` in `astro.config.mjs`:
   ```js
   site: 'https://dhavalnandu.com',
   ```

3. Configure DNS with your registrar (CNAME or A records).

## SEO

- Sitemap auto-generated at `/sitemap-index.xml`
- `robots.txt` included
- Open Graph and Twitter Card meta tags on every page
- Canonical URLs set per page

## License

MIT
