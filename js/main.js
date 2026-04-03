// ========================================
// Minimal Markdown Parser
// ========================================
function parseMarkdown(md) {
  let html = md;

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_, header, sep, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Unordered lists
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      const content = line.replace(/^[-*] /, '');
      return `<li>${content}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(line => {
      const content = line.replace(/^\d+\. /, '');
      return `<li>${content}</li>`;
    }).join('');
    return `<ol>${items}</ol>`;
  });

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs - wrap remaining text blocks
  html = html.replace(/^(?!<[a-z/])((?!<).+)$/gm, '<p>$1</p>');

  // Clean up extra paragraph wrapping around block elements
  html = html.replace(/<p><(h[1-6]|ul|ol|pre|blockquote|table|hr)/g, '<$1');
  html = html.replace(/<\/(h[1-6]|ul|ol|pre|blockquote|table)><\/p>/g, '</$1>');
  html = html.replace(/<p><hr><\/p>/g, '<hr>');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ========================================
// Blog Data (loaded from JSON)
// ========================================
let blogPosts = [];
let activeTag = null;

async function loadBlogPosts() {
  try {
    const resp = await fetch('/blog/posts.json');
    blogPosts = await resp.json();
    renderBlogIndex();
  } catch (e) {
    console.error('Failed to load blog posts:', e);
  }
}

function getAllTags() {
  const tags = new Set();
  blogPosts.forEach(p => p.tags.forEach(t => tags.add(t)));
  return Array.from(tags).sort();
}

function renderBlogIndex() {
  const container = document.getElementById('blog-list');
  const filterContainer = document.getElementById('filter-tags');
  if (!container) return;

  // Render filter tags
  if (filterContainer) {
    const allTags = getAllTags();
    filterContainer.innerHTML = `
      <button class="filter-tag ${!activeTag ? 'filter-tag--active' : ''}" data-tag="">All</button>
      ${allTags.map(t => `<button class="filter-tag ${activeTag === t ? 'filter-tag--active' : ''}" data-tag="${t}">${t}</button>`).join('')}
    `;

    filterContainer.querySelectorAll('.filter-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.tag || null;
        renderBlogIndex();
      });
    });
  }

  // Filter posts
  let filtered = blogPosts;
  if (activeTag) {
    filtered = blogPosts.filter(p => p.tags.includes(activeTag));
  }

  // Search filter
  const searchInput = document.getElementById('blog-search');
  if (searchInput && searchInput.value) {
    const q = searchInput.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No posts found.</p>';
    return;
  }

  container.innerHTML = filtered.map(post => `
    <article class="card">
      <div class="blog-post__meta">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
      </div>
      <h3 style="margin-bottom: 0.5rem;">
        <a href="/blog/${post.slug}/">${post.title}</a>
      </h3>
      <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 0.75rem;">${post.excerpt}</p>
      <div class="tags">
        ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Search handler
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderBlogIndex();
    });
  }
});

// ========================================
// Blog Post Renderer (for individual posts)
// ========================================
async function loadBlogPost() {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const contentEl = document.getElementById('post-content');
  const titleEl = document.getElementById('post-title');
  const metaEl = document.getElementById('post-meta');

  if (!contentEl) return;

  try {
    const resp = await fetch(`/blog/posts.json`);
    const posts = await resp.json();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      contentEl.innerHTML = '<p>Post not found.</p>';
      return;
    }

    // Update page title
    document.title = `${post.title} | Dhaval Nandu`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    // Render post content
    const mdResp = await fetch(`/blog/${post.slug}.md`);
    const mdText = await mdResp.text();

    // Strip frontmatter
    const content = mdText.replace(/^---[\s\S]*?---\n?/, '');

    if (titleEl) titleEl.textContent = post.title;
    if (metaEl) {
      metaEl.innerHTML = `
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <div class="tags">
          ${post.tags.map(t => `<span class="tag tag--accent">${t}</span>`).join('')}
        </div>
      `;
    }

    contentEl.innerHTML = parseMarkdown(content);
  } catch (e) {
    console.error('Failed to load post:', e);
    contentEl.innerHTML = '<p>Failed to load post.</p>';
  }
}

// ========================================
// Contact Form Handler
// ========================================
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="name"]').value;
  const email = form.querySelector('[name="email"]').value;
  const message = form.querySelector('[name="message"]').value;

  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:dhavalknandu@gmail.com?subject=${subject}&body=${body}`;
}
