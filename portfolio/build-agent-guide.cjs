const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = path.join(root, 'lessons', 'tsunami-investigation.md');
const output = path.join(root, 'lessons', 'tsunami-agent-guide.html');
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const markdown = fs.readFileSync(source, 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI lesson guide — Before the wave arrives</title>
  <meta name="description" content="Browser-readable AI guide for the Fieldwork tsunami investigation.">
  <link rel="alternate" type="text/markdown" href="tsunami-investigation.md" title="Raw Markdown lesson guide">
  <style>
    body{margin:0;background:#f5f8fa;color:#14263b;font:17px/1.6 system-ui,sans-serif}
    main{max-width:860px;margin:auto;padding:24px 20px 70px}
    nav{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:25px}
    a{color:#075a73}a:focus-visible{outline:3px solid #d78b16;outline-offset:3px}
    .intro{background:#e6f0f2;padding:16px 20px;border-radius:8px;margin-bottom:22px}
    pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
  </style>
</head>
<body>
<main>
  <nav aria-label="Guide navigation"><a href="../tsunami.html?case=alaska1964&amp;step=reach">← Activity</a><a href="../llms.txt">Fieldwork AI index</a><a href="tsunami-investigation.md">Raw Markdown</a></nav>
  <p class="intro">This is the browser-readable version of the same public Markdown guide. It describes the lesson and how an AI assistant can help; the learner's saved answers are not included.</p>
  <article aria-label="AI lesson guide"><pre>${escapeHtml(markdown)}</pre></article>
</main>
</body>
</html>
`;

if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== html) {
    console.error('The browser-readable AI guide is out of date. Run node portfolio/build-agent-guide.cjs.');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(output, html);
}
