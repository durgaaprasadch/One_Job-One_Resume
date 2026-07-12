# 🎯 ONE JOB, ONE RESUME

> **Stop sending the same resume to every job. Tailor it. Hack the ATS. Get the interview.**

A brutalist, privacy-first, client-side React web app that analyzes your resume against any job description, exposes keyword gaps, gives an ATS match score, and generates a tailored resume — all inside your browser. 

**Zero data leaves your machine.**

![Brutalist UI](public/logo.png)

---

## ⚡ QUICK START

```bash
npm install
npm run dev
# Opens at http://localhost:5173/
```

To deploy to GitHub Pages:
```bash
npm run deploy
```

---

## 💀 WHY THIS EXISTS

Most job applications are shredded by an ATS (Applicant Tracking System) before a human ever sees them. The #1 reason? **Keyword mismatch.** If your resume doesn't contain the exact terms from the job description, you're dead on arrival.

This tool hacks that process by:
1. Extracting keywords from the JD
2. Comparing them against your resume
3. Showing you exactly what's missing
4. Generating a tailored version with optimized keyword placement

---

## 🔥 BRUTALIST FEATURES

| Feature | Description |
|---------|-------------|
| 📤 **Resume Upload** | Upload PDF, TXT, or DOCX files — parsed entirely in-browser |
| 📝 **Paste Input** | Or just paste your resume + JD text directly |
| 🔍 **Keyword Extraction** | NLP-based extraction of 1-gram, 2-gram, and 3-gram keywords |
| 📊 **ATS Match Score** | Weighted 0-100% score (technical skills weigh 3x, certs 2.5x) |
| ✅ **ATS Format Checks** | Validates section headers, contact info, dates, metrics, resume length |
| 🏷️ **Keyword Categorization** | Technical / Soft Skills / Certifications / Action Verbs / Other |
| ❌ **Gap Analysis** | Shows exactly which JD keywords are missing from your resume |
| 💡 **Smart Suggestions** | Actionable tips prioritized by impact (Critical → High → Medium) |
| 📄 **Tailored Resume** | Auto-reorders skills and experience bullets by JD relevance |
| 📥 **Export** | Download as an ATS-safe PDF or TXT |
| 💾 **Auto-Save** | Resume text persisted to localStorage |
| 🔒 **100% Private** | Zero network calls — everything runs client-side in your browser |

---

## 🏗️ TECH STACK & AESTHETIC

- **React 19** — UI components
- **Vite 8** — Build tool & dev server
- **pdfjs-dist** — Client-side PDF text extraction
- **Lucide React** — Stark, raw SVG icons
- **Vanilla CSS (Brutalist Theme)** — Heavy borders, harsh shadows, high contrast. 
  - *Typography:* Archivo Black (Headers), Space Mono (Body)
  - *Colors:* Stark Orange, Neon Chartreuse, Pure White, Solid Black.

---

## 📁 PROJECT STRUCTURE

```
├── index.html                    # Entry HTML with SEO meta tags
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration (Base path routing)
├── README.md                     # This file
│
├── public/
│   └── logo.png                  # Brutalist Target Logo
│
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Main app shell (state, routing)
    ├── index.css                 # Brutalist Design System
    │
    ├── components/
    │   ├── Header.jsx            # App header with brand + privacy badge
    │   ├── InputPanel.jsx        # File upload + paste textareas
    │   ├── AnalysisDashboard.jsx # Score ring, ATS checks, keywords, suggestions
    │   ├── ScoreRing.jsx         # Animated SVG circular score indicator
    │   └── TailoredResume.jsx    # Resume viewer + PDF/TXT/copy export
    │
    └── utils/
        ├── analyzer.js           # Core analysis engine (extraction, matching, scoring)
        ├── resumeGenerator.js    # Resume section parser + relevance reordering
        ├── fileParser.js         # PDF/TXT/DOCX file parsing in browser
        ├── bulletAuditor.js      # Audits bullet points for action verbs and metrics
        ├── skillDictionaries.js  # 500+ curated skills, certs, action verbs
        ├── stopwords.js          # English stop words + job posting filler words
        └── sampleData.js         # Demo resume + JD
```

---

## 🛠️ HOW TO FIX GITHUB PAGES 404 ERROR

If your GitHub Pages link is returning a **404 error**, it means GitHub Pages isn't pointing to the correct deployment branch. 

Here is how to fix it in 3 clicks:
1. Go to your repository on GitHub and click the **Settings** tab (the gear icon ⚙️).
2. On the left sidebar, scroll down and click **Pages**.
3. Under **Build and deployment** -> **Source**, ensure it says "Deploy from a branch".
4. Under **Branch**, click the dropdown (it might say `None` or `main`) and change it to **`gh-pages`**.
5. Keep the folder as `/ (root)` and click **Save**.

Wait about 1-2 minutes for the GitHub Actions indicator (a small yellow circle or green checkmark on your repo's homepage) to finish, and your site will be live!

---

## 🔒 PRIVACY GUARANTEE

- **Zero network calls** — no data is sent anywhere.
- **No analytics, no tracking** — fully offline capable.
- **LocalStorage only** — resume text saved locally for convenience.
- **Open source** — inspect every line of code.

---

**Built to beat the bots. 👊**
