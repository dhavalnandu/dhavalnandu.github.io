# Dhaval Nandu – SAP Technical Consultant Portfolio

A clean, fast, SEO-friendly personal portfolio website for a Senior SAP Technical Consultant. Built with plain HTML, CSS, and JavaScript — no build step, no dependencies, zero overhead.

**Live URL:** `https://dhavalnandu.github.io`

---

## Features

- **Zero dependencies** – No frameworks, no build tools, no npm packages
- **Blazing fast** – Pure static HTML/CSS/JS, loads in milliseconds
- **Mobile responsive** – Works on all screen sizes
- **SEO optimized** – Meta tags, Open Graph, sitemap.xml, robots.txt
- **Markdown blog** – Write posts in Markdown, rendered client-side
- **Accessible** – Semantic HTML, ARIA labels, keyboard navigation
- **GitHub Pages ready** – Push and deploy, nothing else needed

---

## Project Structure

```
Portfolio/
├── index.html                  # Home page
├── about/
│   └── index.html              # About / Experience page
├── blog/
│   ├── index.html              # Blog index (with search & tag filter)
│   ├── posts.json              # Blog post metadata (add new posts here)
│   ├── rap-vs-classical-abap/
│   │   └── index.html          # Individual blog post page
│   ├── rap-vs-classical-abap.md # Blog post Markdown source
│   ├── cds-table-functions-amdp/
│   │   └── index.html
│   ├── cds-table-functions-amdp.md
│   ├── performance-tuning-s4hana/
│   │   └── index.html
│   └── performance-tuning-s4hana.md
├── projects/
│   └── index.html              # Projects page
├── connect/
│   └── index.html              # Contact / Connect page
├── css/
│   └── styles.css              # All styles (custom properties, responsive)
├── js/
│   └── main.js                 # Blog loader, Markdown parser, utilities
├── assets/
│   └── resume.pdf              # Resume PDF (add your own)
├── includes/
│   ├── header.html             # Header HTML snippet (reference)
│   └── footer.html             # Footer HTML snippet (reference)
├── robots.txt                  # SEO: allow all crawlers
├── sitemap.xml                 # SEO: XML sitemap
└── README.md                   # This file
```

---

## How to Add a New Blog Post

### Step 1: Create the Markdown file

Create a new `.md` file in the `blog/` directory:

```
blog/your-post-slug.md
```

Frontmatter format (required):

```markdown
---
title: "Your Post Title"
date: 2026-04-03
tags: ["SAP", "ABAP", "RAP"]
excerpt: "A brief description of the post (1-2 sentences)."
---

# Your Post Title

Write your content here in Markdown...
```

### Step 2: Create the post page directory

```
blog/your-post-slug/index.html
```

Copy any existing post's `index.html` (e.g., `blog/rap-vs-classical-abap/index.html`) and update:
- `<title>` tag
- `meta description`
- `canonical` URL
- Post title in `<h1>`
- Date in `<time>`
- Tags in the tags div

The page will automatically load and render the Markdown content from `blog/your-post-slug.md` via the `loadBlogPost()` function in `main.js`.

### Step 3: Add to posts.json

Add an entry to `blog/posts.json`:

```json
{
  "slug": "your-post-slug",
  "title": "Your Post Title",
  "date": "2026-04-03",
  "excerpt": "A brief description.",
  "tags": ["SAP", "ABAP", "RAP"]
}
```

### Step 4: Update sitemap.xml

Add a new `<url>` entry to `sitemap.xml` for the new post.

---

## How to Deploy to GitHub Pages

### Option A: Using GitHub UI (Simplest)

1. Create a new GitHub repository named `dhavalnandu.github.io`
2. Push all files to the `main` branch
3. Go to **Settings > Pages**
4. Set **Source** to `Deploy from a branch`
5. Select branch `main` and folder `/ (root)`
6. Click **Save**
7. Your site will be live at `https://dhavalnandu.github.io`

### Option B: Using GitHub CLI

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: portfolio site"

# Create and push to GitHub
gh repo create dhavalnandu/dhavalnandu.github.io --public --source=. --remote=origin --push

# Enable GitHub Pages
gh api repos/dhavalnandu/dhavalnandu.github.io/pages \
  --method POST \
  --field source='{"branch":"main","path":"/"}'
```

### Option C: Deploy to a subdirectory

If using a repository name other than `username.github.io`:

1. Update all URLs in HTML files to include the repo name prefix:
   - Change `/css/styles.css` to `/repo-name/css/styles.css`
   - Change `/blog/` to `/repo-name/blog/`
   - etc.

2. Or set a `<base>` tag in each HTML `<head>`:
   ```html
   <base href="/repo-name/">
   ```

---

## Customization

### Colors

Edit CSS custom properties in `css/styles.css`:

```css
:root {
  --accent: #3b82f6;        /* Primary accent color */
  --accent-hover: #2563eb;  /* Hover state */
  --navy-900: #0f172a;      /* Darkest text */
  --navy-800: #1e293b;      /* Body text */
  /* ... more variables ... */
}
```

### Fonts

The site uses **Inter** (body) and **JetBrains Mono** (code). Change in the Google Fonts link in each HTML file and update the CSS variables.

### Resume PDF

Place your resume at `assets/resume.pdf`. Update the link in `index.html` and `about/index.html`.

### Contact Email

Update the email address in:
- `connect/index.html` (contact card + mailto handler)
- `js/main.js` (`handleContactForm` function)

---

## Blog Markdown Support

The built-in Markdown parser supports:

- Headers (`#`, `##`, `###`)
- Bold (`**text**`), Italic (`*text*`)
- Code blocks (```` ```language ````)
- Inline code (`` `code` ``)
- Unordered lists (`- item`)
- Ordered lists (`1. item`)
- Blockquotes (`> text`)
- Tables (pipe-separated)
- Links (`[text](url)`)
- Horizontal rules (`---`)

---

## Performance

- **No external JavaScript frameworks** – ~8KB total JS
- **Single CSS file** – ~12KB, no unused styles
- **No images required** – SVG icons are inline
- **Google Fonts** – Only 2 font families, preconnected
- **Lighthouse targets**: 95+ on all metrics

---

## License

MIT – Use freely for your own portfolio.
