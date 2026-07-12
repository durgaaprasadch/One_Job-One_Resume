# 📄 Resume for Each — ATS Resume Tailoring Tool

> Stop sending the same resume to every job. Tailor it for each one and actually get shortlisted.

A client-side React web app that analyzes your resume against any job description, shows keyword gaps, gives an ATS match score, and generates a tailored resume — all in your browser. **No data leaves your machine.**

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173/
```

---

## 🧠 Why This Exists

Most job applications get rejected by ATS (Applicant Tracking Systems) before a human even sees them. The #1 reason? **Keyword mismatch.** If your resume doesn't contain the exact terms from the job description, you're filtered out.

This tool solves that by:
1. Extracting keywords from the JD
2. Comparing them against your resume
3. Showing you exactly what's missing
4. Generating a tailored version with optimized keyword placement

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Resume Upload** | Upload PDF, TXT, or DOCX files — parsed entirely in-browser |
| 📝 **Paste Input** | Or just paste your resume + JD text directly |
| 🔍 **Keyword Extraction** | NLP-based extraction of 1-gram, 2-gram, and 3-gram keywords |
| 📊 **ATS Match Score** | Weighted 0-100% score (technical skills weigh 3x, certs 2.5x) |
| ✅ **ATS Format Checks** | Validates section headers, contact info, dates, metrics, resume length |
| 🏷️ **Keyword Categorization** | Technical / Soft Skills / Certifications / Action Verbs / Other |
| ❌ **Gap Analysis** | Shows exactly which JD keywords are missing from your resume |
| 💡 **Smart Suggestions** | Actionable tips prioritized by impact (critical → high → medium) |
| 📄 **Tailored Resume** | Auto-reorders skills and experience bullets by JD relevance |
| 📥 **Export** | Download as PDF, TXT, or copy to clipboard |
| 💾 **Auto-Save** | Resume text persisted to localStorage |
| 🔒 **100% Private** | Zero network calls — everything runs client-side in your browser |
| ✨ **Sample Data** | One-click demo with pre-filled resume + JD |

---

## 🏗️ Tech Stack

- **React 19** — UI components
- **Vite 8** — Build tool & dev server
- **pdfjs-dist** — Client-side PDF text extraction
- **html2pdf.js** — Browser-based PDF generation for export
- **Vanilla CSS** — Custom dark glassmorphism design system (no Tailwind)

---

## 📁 Project Structure

```
e:\Resume for Each\
├── index.html                    # Entry HTML with SEO meta tags
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── README.md                     # This file
│
├── public/
│   └── vite.svg                  # Favicon
│
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Main app shell (state, routing, toasts)
    ├── index.css                 # Full design system (1200+ lines)
    │
    ├── components/
    │   ├── Header.jsx            # App header with brand + privacy badge
    │   ├── InputPanel.jsx        # File upload + paste textareas
    │   ├── AnalysisDashboard.jsx # Score ring, stats, ATS checks, keywords, suggestions
    │   ├── ScoreRing.jsx         # Animated SVG circular score indicator
    │   └── TailoredResume.jsx    # Resume viewer + PDF/TXT/copy export
    │
    └── utils/
        ├── analyzer.js           # Core analysis engine (keyword extraction, matching, scoring)
        ├── resumeGenerator.js    # Resume section parser + relevance-based reordering
        ├── fileParser.js         # PDF/TXT/DOCX file parsing in browser
        ├── skillDictionaries.js  # 500+ curated skills, certs, action verbs
        ├── stopwords.js          # English stop words + job posting filler words
        └── sampleData.js         # Demo resume + JD for "Try Sample Data"
```

---

## 📖 Detailed File Breakdown

### `src/App.jsx` — Main App Shell

The app uses a **3-step flow**:

```
Step 1: INPUT → Step 2: ANALYSIS → Step 3: TAILORED RESUME
```

- Manages all global state (resume text, JD text, analysis results, tailored output)
- Handles the `Analyze` action — calls `analyzeResume()` + `generateTailoredResume()`
- Persists resume text to `localStorage` so you don't re-paste every time
- Renders a toast notification system for user feedback
- Step indicator at the top lets you navigate between completed steps

---

### `src/components/InputPanel.jsx` — Resume & JD Input

**Two ways to provide your resume:**

1. **File Upload** — Click the upload zone to browse, accepts `.pdf`, `.txt`, `.doc`, `.docx`
   - PDF files are parsed using `pdfjs-dist` (runs entirely in browser)
   - DOCX files are parsed by reading the XML inside the ZIP structure
   - TXT files are read as-is
   - Shows file name, size, and "Parsed successfully" confirmation

2. **Paste** — Textarea below the upload zone with an "or paste below" divider

**JD Input** — Right-side textarea where you paste the full job description

**Actions:**
- `✨ Try Sample Data` — loads a pre-built resume + JD for instant demo
- `🔍 Analyze & Match` — triggers the analysis (needs 50+ chars in both fields)
- `🗑️ Clear` — resets both inputs

---

### `src/utils/analyzer.js` — The Analysis Engine (Core Logic)

This is the brain of the app. Here's how it works:

#### 1. Keyword Extraction
```
Raw Text → Normalize → Tokenize → Remove Stop Words → Extract N-grams → Categorize
```

- **Normalize**: lowercase, clean special characters, collapse whitespace
- **Tokenize**: split into individual words
- **Stop Words**: filters out 200+ common English words + job posting filler words like "responsibilities", "qualifications", "preferred", etc.
- **N-grams**: extracts 1-word, 2-word, and 3-word phrases (e.g., "react", "machine learning", "ci cd pipelines")
- **Categorize**: matches each keyword against skill dictionaries

#### 2. Keyword Matching
```
Resume Keywords ←→ JD Keywords
```

Compares using:
- **Exact match**: "react" ↔ "react"
- **Fuzzy match**: "react.js" ↔ "reactjs", "node.js" ↔ "nodejs"
- **Partial match**: "postgresql" ↔ "postgres"

Outputs three sets:
- ✅ **Matched** — keywords found in both resume and JD
- ❌ **Missing** — keywords in JD but NOT in resume
- ⚠️ **Extra** — skills in resume not mentioned in JD

#### 3. ATS Score Calculation
```
Score = (Σ matched_keyword_weights) / (Σ all_jd_keyword_weights) × 100
```

Weights by category:
| Category | Weight |
|----------|--------|
| Technical Skills | 3x |
| Certifications | 2.5x |
| Soft Skills | 1.5x |
| Other Keywords | 1.2x |
| Action Verbs | 1x |

Frequency boost: keywords mentioned multiple times in JD get up to 3x weight.

#### 4. ATS Format Checks

Validates your resume for ATS compatibility:
- ✅ No pipe/column separators (breaks ATS parsing)
- ✅ Standard section headers (Experience, Education, Skills, etc.)
- ✅ Contact info (email + phone detection)
- ✅ Date formatting (consistent date patterns)
- ✅ Quantifiable achievements (numbers, %, $)
- ✅ Resume length (200-900 words = good)

#### 5. Suggestions Generator

Generates prioritized, actionable suggestions:
- 🚨 **Critical** — if score < 40%, major overhaul needed
- 💻 **High** — missing technical skills to add
- 🤝 **Medium** — soft skills to demonstrate
- 📜 **Medium** — certifications mentioned in JD
- ⚡ **Medium** — action verb improvements
- ✂️ **Low** — trim irrelevant skills
- 🤖 **Tip** — ATS formatting best practices
- 🎯 **Positive** — if score ≥ 70%, congratulations + next steps

---

### `src/utils/resumeGenerator.js` — Resume Tailoring Engine

Takes your raw resume + analysis results and produces an optimized version:

1. **Section Parsing** — identifies resume sections by header patterns:
   - Summary, Experience, Education, Skills, Projects, Certifications, Awards, etc.
   - Uses regex patterns to detect headers like "Professional Experience", "Work History", "Technical Skills"

2. **Skill Reordering** — puts JD-matched skills first in your Skills section:
   ```
   Before: JavaScript, Python, Ruby, Docker, React, Angular
   After:  React, Docker, JavaScript, Python, Ruby, Angular  (if JD mentions React + Docker)
   ```

3. **Experience Bullet Reordering** — sorts bullet points by relevance:
   - Bullets containing JD keywords float to the top
   - Bullets with quantifiable metrics (%, $, numbers) get a boost
   - Within each job, the most relevant bullets appear first

4. **Keyword Insertion Suggestions** — tells you exactly what to add:
   - Which technical skills to add to your Skills section
   - Which soft skills to weave into your Experience bullets
   - Which certifications the JD expects

---

### `src/utils/skillDictionaries.js` — Skill Knowledge Base

500+ curated terms organized into categories:

- **Technical Skills** — Programming languages, frameworks, databases, cloud, DevOps, ML/AI, security, mobile, testing, architecture patterns
- **Soft Skills** — Leadership, communication, teamwork, problem-solving, etc.
- **Certifications** — AWS, Azure, GCP, CompTIA, CISSP, PMP, Scrum, Kubernetes, etc.
- **Action Verbs** — 100+ powerful resume verbs (Architected, Spearheaded, Optimized, etc.)

The `categorizeKeyword()` function maps any keyword to its category.

---

### `src/utils/fileParser.js` — File Upload Parser

Handles extracting text from uploaded files:

- **PDF** → Uses `pdfjs-dist` to load PDF, iterates through pages, extracts text content
- **TXT** → Reads as plain text via `file.text()`
- **DOCX** → Reads the XML inside the ZIP structure, extracts `<w:t>` tags
- **DOC** → Falls back to extracting printable ASCII from binary

All parsing happens **in-browser** — no server upload.

---

### `src/utils/stopwords.js` — Stop Words Filter

Two sets:
- **STOP_WORDS** — 200+ common English words (the, is, was, etc.) + job posting filler words (responsibilities, qualifications, preferred, etc.)
- **KEEP_WORDS** — Words that look common but ARE meaningful in a tech context (api, ui, rest, agile, lead, deploy, etc.)

---

### `src/components/AnalysisDashboard.jsx` — Results View

Displays:
1. **Score Ring** — animated SVG circle that counts up from 0 to the score
   - Green (≥70%) / Yellow (40-70%) / Red (<40%)
   - Glow effect matching the color
2. **Stats Grid** — matched count, missing count, extra skills count with progress bars
3. **ATS Checks** — pass/fail checklist with details
4. **Keyword Panels** — side-by-side matched (green badges) vs missing (red badges), grouped by category
5. **Suggestions** — prioritized improvement cards with icons and detailed text

---

### `src/components/ScoreRing.jsx` — Animated Score Circle

- SVG-based circular progress ring
- Smooth **ease-out cubic** animation counting from 0 to score over 1.2 seconds
- Dynamic color: Red → Yellow → Green based on score threshold
- Glow shadow effect

---

### `src/components/TailoredResume.jsx` — Output & Export

Shows the tailored resume and provides:
- **📋 Copy** — copies to clipboard
- **📝 Download .txt** — saves as plain text file
- **📥 Download PDF** — generates ATS-friendly PDF using html2pdf.js (Arial font, clean layout)
- **Keyword Insertion Cards** — shows exactly which keywords to add and where
- **Final ATS Tips** — 5 essential tips before submitting (page length, fonts, quantification, ATS killers, file naming)

---

### `src/index.css` — Design System (1200+ lines)

Custom dark theme with glassmorphism:

| Design Element | Value |
|----------------|-------|
| Background | Deep navy `#06080f` with gradient orbs |
| Cards | Frosted glass `rgba(15, 20, 45, 0.65)` + `backdrop-filter: blur(12px)` |
| Accent | Purple-blue gradient `#667eea → #764ba2` |
| Success | Emerald `#10b981` |
| Danger | Rose `#f43f5e` |
| Warning | Amber `#f59e0b` |
| Fonts | Inter (body), Outfit (headings), JetBrains Mono (code/keywords) |
| Animations | fadeInUp, pulse-dot, connector-fill, spin, float, toastIn |
| Scrollbar | Custom styled thin purple scrollbar |
| Responsive | Full breakpoints for mobile (768px) and tablet (1024px) |

---

## 🔧 Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build locally
```

---

## 📝 How to Use

1. **Upload or paste your resume** — use the upload button for PDF/DOCX/TXT, or paste into the textarea
2. **Paste the job description** — copy the full JD from LinkedIn/Naukri/company site
3. **Click "Analyze & Match"** — get your ATS score, keyword analysis, and suggestions
4. **Review the analysis** — see matched keywords (green), missing keywords (red), and improvement suggestions
5. **View tailored resume** — your resume reordered for relevance
6. **Download** — export as PDF or TXT and submit!

---

## 🔒 Privacy

- **Zero network calls** — no data is sent anywhere
- **No analytics, no tracking** — fully offline capable
- **LocalStorage only** — resume text saved locally for convenience
- **Open source** — inspect every line of code

---

## 🛠️ Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.x | UI framework |
| react-dom | ^19.x | DOM rendering |
| pdfjs-dist | ^4.x | PDF text extraction (browser) |
| html2pdf.js | ^0.10.x | PDF generation for export |
| react-icons | ^5.x | Icon library (available for future use) |

---

Built with 💜 to help you land your dream job.
