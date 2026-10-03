# AutoLearn: Kubernetes (v22 and v23)

Everything is plain HTML with no build step and no server code.

- `index.html`: a page to pick version A or B
- `a-questions-as-you-go.html`: a quick check after each main idea and rabbit hole
- `b-questions-at-the-end.html`: learn everything first, then one final check
- `teach-it-back.html` (v23): explain Kubernetes in your own words by talking, typing or drawing; what you explain lights up on a map

In both versions, a question you get wrong (even if you get it right on a later try) is gone over again: why that pick was off, a simpler explanation with its picture, then a different question on the same idea.

## Run it on your computer
Unzip the folder and double-click `index.html`. It opens in your browser. No internet needed (fonts fall back to system fonts when offline).

## Put it on a website
Any static host works. Upload the whole folder:
- **Netlify Drop:** go to https://app.netlify.com/drop and drag the folder in. You get a public link.
- **GitHub Pages:** put the files in a repository, then turn on Pages in the repository's settings.
- **Vercel or Cloudflare Pages:** create a project from the folder.

Live copy: https://aneesh-123.github.io/autolearn/ (GitHub Pages). Voice uses the browser's speech recognition: it works in Chrome, Edge and Safari on a hosted https link or localhost, but not inside claude.ai, which blocks the microphone. Inside claude.ai, Claude grades Teach it back for free through the page's sample capability. Anywhere else, tap "Connect Claude" at the top and paste an Anthropic API key; it's saved only in that browser and sent only to api.anthropic.com. Without a key it falls back to a simple word match (ideas you mention show as partly explained).
