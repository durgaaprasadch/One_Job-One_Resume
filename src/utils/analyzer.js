import { STOP_WORDS, KEEP_WORDS } from './stopwords';
import { categorizeKeyword } from './skillDictionaries';
import { getSynonymLookup, SYNONYM_GROUPS } from './synonyms';
import { auditResumeBullets } from './bulletAuditor';

/**
 * Core Resume vs Job Description Analyzer
 *
 * Performs keyword extraction, matching (exact + fuzzy + synonym),
 * gap analysis, and ATS scoring.
 *
 * SCORING NOTE: Synonym matches are weighted at 0.6x because real ATS
 * systems (Workday, Taleo, iCIMS) typically do literal string matching.
 * A synonym match means a human would credit it, but a bot might not.
 */

const SYNONYM_WEIGHT = 0.6; // Synonym matches count 60% in score

// ─── Text Processing ──────────────────────────────────────────

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\w\s\-\+\#\.\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/)
    .map(t => t.replace(/[\.\,\;\:\!\?]+$/, '')) // strip trailing punctuation
    .filter(token => token.length > 1 && !/^\d+$/.test(token));
}

function isMeaningfulKeyword(word) {
  const lower = word.toLowerCase();
  if (KEEP_WORDS.has(lower)) return true;
  if (STOP_WORDS.has(lower)) return false;
  if (lower.length <= 1) return false;
  if (/^\d+$/.test(lower)) return false;
  return true;
}

// ─── Keyword Extraction ───────────────────────────────────────

function extractKeywords(text) {
  const tokens = tokenize(text);
  const keywords = new Map();

  // Single tokens
  for (const token of tokens) {
    if (!isMeaningfulKeyword(token)) continue;
    const lower = token.toLowerCase();
    const category = categorizeKeyword(lower);
    if (keywords.has(lower)) {
      keywords.get(lower).count++;
    } else {
      keywords.set(lower, { count: 1, category, original: token });
    }
  }

  // 2-grams and 3-grams (check against skill dictionaries)
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      const ngramHyphen = tokens.slice(i, i + n).join('-');
      const category = categorizeKeyword(ngram);
      const categoryHyphen = categorizeKeyword(ngramHyphen);

      if (category !== 'other' || categoryHyphen !== 'other') {
        const finalCategory = category !== 'other' ? category : categoryHyphen;
        const key = ngram;
        if (keywords.has(key)) {
          keywords.get(key).count++;
        } else {
          keywords.set(key, { count: 1, category: finalCategory, original: ngram });
        }
      }
    }
  }

  // Also check n-grams against synonym lookup — if a JD uses a term
  // that's in a synonym group but NOT in the skill dictionaries, we
  // should still extract it.
  const synLookup = getSynonymLookup();
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      if (!keywords.has(ngram) && synLookup.has(ngram)) {
        keywords.set(ngram, { count: 1, category: 'technical', original: ngram });
      }
    }
  }

  return keywords;
}

// ─── Keyword Comparison (with Synonym Support) ────────────────

function compareKeywords(resumeKeywords, jdKeywords) {
  const matched = new Map();
  const missing = new Map();
  const extra = new Map();
  const synLookup = getSynonymLookup();

  for (const [keyword, data] of jdKeywords) {
    // 1. Exact match
    if (resumeKeywords.has(keyword)) {
      matched.set(keyword, {
        ...data,
        resumeCount: resumeKeywords.get(keyword).count,
        jdCount: data.count,
        matchType: 'exact',
      });
      continue;
    }

    // 2. Fuzzy match (punctuation/formatting variants)
    let fuzzyFound = false;
    for (const [rKeyword] of resumeKeywords) {
      if (
        rKeyword.includes(keyword) || keyword.includes(rKeyword) ||
        rKeyword.replace(/-/g, '') === keyword.replace(/-/g, '') ||
        rKeyword.replace(/\./g, '') === keyword.replace(/\./g, '')
      ) {
        matched.set(keyword, {
          ...data,
          resumeCount: resumeKeywords.get(rKeyword).count,
          jdCount: data.count,
          matchedAs: rKeyword,
          matchType: 'fuzzy',
        });
        fuzzyFound = true;
        break;
      }
    }
    if (fuzzyFound) continue;

    // 3. Synonym match — check if JD keyword belongs to a synonym group
    //    and any synonym from that group exists in the resume
    let synonymFound = false;
    const jdGroupIdx = synLookup.get(keyword.toLowerCase());

    if (jdGroupIdx !== undefined) {
      const group = SYNONYM_GROUPS[jdGroupIdx];
      for (const synonym of group) {
        const synLower = synonym.toLowerCase();
        if (synLower === keyword.toLowerCase()) continue; // Skip self

        // Check if this synonym exists in resume keywords
        if (resumeKeywords.has(synLower)) {
          matched.set(keyword, {
            ...data,
            resumeCount: resumeKeywords.get(synLower).count,
            jdCount: data.count,
            matchedAs: synLower,
            matchType: 'synonym',
            synonymGroup: group,
          });
          synonymFound = true;
          break;
        }

        // Also check fuzzy against synonyms
        for (const [rKeyword] of resumeKeywords) {
          if (
            rKeyword.includes(synLower) || synLower.includes(rKeyword) ||
            rKeyword.replace(/-/g, '') === synLower.replace(/-/g, '')
          ) {
            matched.set(keyword, {
              ...data,
              resumeCount: resumeKeywords.get(rKeyword).count,
              jdCount: data.count,
              matchedAs: rKeyword,
              matchType: 'synonym',
              synonymGroup: group,
            });
            synonymFound = true;
            break;
          }
        }
        if (synonymFound) break;
      }
    }
    if (synonymFound) continue;

    // 4. No match found — it's missing
    missing.set(keyword, data);
  }

  // Find extra skills (in resume but not in JD)
  for (const [keyword, data] of resumeKeywords) {
    if (!jdKeywords.has(keyword) && data.category !== 'other' && data.category !== 'action') {
      let isPartialMatch = false;
      for (const [jKeyword] of jdKeywords) {
        if (jKeyword.includes(keyword) || keyword.includes(jKeyword)) {
          isPartialMatch = true;
          break;
        }
      }
      if (!isPartialMatch) {
        extra.set(keyword, data);
      }
    }
  }

  return { matched, missing, extra };
}

// ─── ATS Score Calculation ────────────────────────────────────

function calculateScore(matched, missing, jdKeywords) {
  if (jdKeywords.size === 0) return 0;

  const categoryWeights = {
    technical: 3,
    certification: 2.5,
    soft: 1.5,
    action: 1,
    other: 1.2,
  };

  let totalWeightedJD = 0;
  let matchedWeightedJD = 0;

  for (const [keyword, data] of jdKeywords) {
    const catWeight = categoryWeights[data.category] || 1;
    const frequencyBoost = Math.min(data.count, 3);
    const keywordWeight = catWeight * frequencyBoost;
    totalWeightedJD += keywordWeight;

    if (matched.has(keyword)) {
      const matchData = matched.get(keyword);
      // Synonym matches are weighted at SYNONYM_WEIGHT (0.6x)
      const matchMultiplier = matchData.matchType === 'synonym' ? SYNONYM_WEIGHT : 1;
      matchedWeightedJD += keywordWeight * matchMultiplier;
    }
  }

  const score = totalWeightedJD > 0
    ? Math.round((matchedWeightedJD / totalWeightedJD) * 100)
    : 0;

  return Math.min(score, 100);
}

// ─── Suggestions Generator ────────────────────────────────────

function generateSuggestions(matched, missing, extra, score) {
  const suggestions = [];

  const missingByCategory = {};
  for (const [keyword, data] of missing) {
    if (!missingByCategory[data.category]) {
      missingByCategory[data.category] = [];
    }
    missingByCategory[data.category].push(keyword);
  }

  // Synonym match suggestions — MOST IMPORTANT for real ATS
  const synonymMatches = [...matched.entries()]
    .filter(([, data]) => data.matchType === 'synonym');

  if (synonymMatches.length > 0) {
    const terms = synonymMatches.slice(0, 6).map(([kw, data]) =>
      `**${kw}** (you wrote "${data.matchedAs}")`
    );
    suggestions.push({
      type: 'high',
      icon: 'refresh',
      title: 'Add Exact JD Phrasing — ATS May Not Match Synonyms',
      text: `Your resume uses equivalent terms, but real ATS bots often do literal matching. Consider also adding the exact JD wording: ${terms.join(', ')}. This doesn't mean remove your current terms — add the JD version alongside them.`,
    });
  }

  if (score < 40) {
    suggestions.push({
      type: 'critical',
      icon: 'alert-octagon',
      title: 'Major Resume Overhaul Needed',
      text: 'Your resume has very low keyword overlap with this JD. Consider whether this role truly matches your background, or significantly restructure your resume to highlight relevant experience.',
    });
  }

  if (missingByCategory.technical?.length > 0) {
    const skills = missingByCategory.technical.slice(0, 8);
    suggestions.push({
      type: 'high',
      icon: 'code-2',
      title: 'Add Missing Technical Skills',
      text: `The JD mentions these technical skills not in your resume: ${skills.map(s => `**${s}**`).join(', ')}. Only add skills you genuinely have. Weave them into your Skills section and experience bullets where truthful.`,
    });
  }

  if (missingByCategory.soft?.length > 0) {
    suggestions.push({
      type: 'medium',
      icon: 'users',
      title: 'Incorporate Soft Skills',
      text: `The JD values: ${missingByCategory.soft.slice(0, 5).map(s => `**${s}**`).join(', ')}. Demonstrate these through your experience descriptions with specific examples — don't just list them.`,
    });
  }

  if (missingByCategory.certification?.length > 0) {
    suggestions.push({
      type: 'medium',
      icon: 'award',
      title: 'Certifications Mentioned in JD',
      text: `These certifications appear in the JD: ${missingByCategory.certification.map(s => `**${s}**`).join(', ')}. If you have them, add a Certifications section. If not, consider pursuing them.`,
    });
  }

  const matchedActions = [...matched.values()].filter(d => d.category === 'action');
  if (matchedActions.length < 3) {
    suggestions.push({
      type: 'medium',
      icon: 'zap',
      title: 'Use Stronger Action Verbs',
      text: 'Start experience bullet points with powerful verbs like **Architected**, **Spearheaded**, **Optimized**, **Implemented**. Mirror the action language in the JD.',
    });
  }

  if (extra.size > 5) {
    suggestions.push({
      type: 'low',
      icon: 'scissors',
      title: 'Trim Irrelevant Skills',
      text: `Your resume has ${extra.size} skills not mentioned in the JD. Consider de-emphasizing the least relevant ones to keep focus on what this role needs.`,
    });
  }

  suggestions.push({
    type: 'tip',
    icon: 'info',
    title: 'ATS Formatting Best Practices',
    text: 'Use standard section headings (Experience, Education, Skills). Avoid tables, columns, images, or fancy formatting. Single-column layout. Save as PDF unless they ask for .docx.',
  });

  if (score >= 70) {
    suggestions.push({
      type: 'positive',
      icon: 'check-circle-2',
      title: 'Strong Match!',
      text: 'Your resume has great keyword coverage. Focus on quantifying your achievements with real, defensible metrics you can explain in an interview.',
    });
  }

  return suggestions;
}

// ─── ATS Format Checks ───────────────────────────────────────

function atsChecks(resumeText) {
  const checks = [];

  if (/[|│┃┆]/.test(resumeText)) {
    checks.push({ pass: false, label: 'No pipe/column separators', detail: 'Pipe characters can confuse ATS parsers. Use commas or bullets instead.' });
  } else {
    checks.push({ pass: true, label: 'No pipe/column separators' });
  }

  const commonHeaders = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications'];
  const foundHeaders = commonHeaders.filter(h => resumeText.toLowerCase().includes(h));
  if (foundHeaders.length >= 3) {
    checks.push({ pass: true, label: 'Standard section headers found', detail: `Found: ${foundHeaders.join(', ')}` });
  } else {
    checks.push({
      pass: false,
      label: 'Missing standard section headers',
      detail: `Only found: ${foundHeaders.join(', ') || 'none'}. ATS looks for: Experience, Education, Skills, Summary.`,
    });
  }

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
  const hasPhone = /[\d\-\(\)\+\s]{10,}/.test(resumeText);
  if (hasEmail && hasPhone) {
    checks.push({ pass: true, label: 'Contact info detected (email + phone)' });
  } else {
    checks.push({ pass: false, label: 'Missing contact information', detail: `${!hasEmail ? 'No email found. ' : ''}${!hasPhone ? 'No phone number found.' : ''}` });
  }

  const datePatterns = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}\s*[-–]\s*(?:\d{4}|present|current))/gi;
  const dates = resumeText.match(datePatterns);
  if (dates && dates.length >= 2) {
    checks.push({ pass: true, label: 'Date formatting detected', detail: `Found ${dates.length} date references` });
  } else {
    checks.push({ pass: false, label: 'Improve date formatting', detail: 'Use consistent formats like "Jan 2023 - Present" or "2021 - 2023".' });
  }

  const numbers = resumeText.match(/\d+%|\$[\d,]+|\d+\+?\s*(?:users|customers|clients|projects|team|people|members|engineers|developers)/gi);
  if (numbers && numbers.length >= 2) {
    checks.push({ pass: true, label: 'Quantifiable achievements found', detail: `Found ${numbers.length} metrics` });
  } else {
    checks.push({ pass: false, label: 'Add quantifiable achievements', detail: 'Include real, defensible metrics you can explain in an interview. "Built and deployed across 2 services" beats a fake 40%.' });
  }

  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 900) {
    checks.push({ pass: true, label: `Good resume length (~${wordCount} words)` });
  } else if (wordCount < 200) {
    checks.push({ pass: false, label: `Resume too short (~${wordCount} words)`, detail: 'Aim for 300-700 words for a 1-page resume.' });
  } else {
    checks.push({ pass: false, label: `Resume may be too long (~${wordCount} words)`, detail: 'Keep it to 1-2 pages.' });
  }

  return checks;
}

// ─── Section Parsing Confidence ───────────────────────────────

function checkParsingConfidence(resumeText) {
  const commonHeaders = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications'];
  const found = commonHeaders.filter(h => {
    const regex = new RegExp(`^\\s*(?:professional\\s+|technical\\s+|work\\s+)?${h}`, 'mi');
    return regex.test(resumeText);
  });

  const warnings = [];
  const critical = ['experience', 'skills', 'education'];
  for (const section of critical) {
    if (!found.includes(section)) {
      warnings.push({
        section: section.charAt(0).toUpperCase() + section.slice(1),
        message: `Couldn't confidently detect your ${section.charAt(0).toUpperCase() + section.slice(1)} section. Check that the heading is on its own line.`,
      });
    }
  }

  return {
    sectionsDetected: found,
    warnings,
    confidence: found.length >= 3 ? 'high' : found.length >= 2 ? 'medium' : 'low',
  };
}

// ─── Main Analysis Function ───────────────────────────────────

export function analyzeResume(resumeText, jdText) {
  if (!resumeText.trim() || !jdText.trim()) {
    return null;
  }

  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jdText);

  const { matched, missing, extra } = compareKeywords(resumeKeywords, jdKeywords);
  const score = calculateScore(matched, missing, jdKeywords);
  const suggestions = generateSuggestions(matched, missing, extra, score);
  const atsResults = atsChecks(resumeText);
  const parsingConfidence = checkParsingConfidence(resumeText);
  
  // NEW: Audit bullet points for weak verbs and missing metrics
  const bulletAudits = auditResumeBullets(resumeText);

  // Categorize results
  const matchedByCategory = {};
  const missingByCategory = {};

  for (const [kw, data] of matched) {
    const cat = data.category;
    if (!matchedByCategory[cat]) matchedByCategory[cat] = [];
    matchedByCategory[cat].push({ keyword: kw, ...data });
  }

  for (const [kw, data] of missing) {
    const cat = data.category;
    if (!missingByCategory[cat]) missingByCategory[cat] = [];
    missingByCategory[cat].push({ keyword: kw, ...data });
  }

  // Count match types
  const exactMatches = [...matched.values()].filter(m => m.matchType === 'exact').length;
  const fuzzyMatches = [...matched.values()].filter(m => m.matchType === 'fuzzy').length;
  const synonymMatches = [...matched.values()].filter(m => m.matchType === 'synonym').length;

  return {
    score,
    totalJdKeywords: jdKeywords.size,
    totalResumeKeywords: resumeKeywords.size,
    matchedCount: matched.size,
    missingCount: missing.size,
    extraCount: extra.size,
    exactMatches,
    fuzzyMatches,
    synonymMatches,
    matched: [...matched.entries()].map(([kw, data]) => ({ keyword: kw, ...data })),
    missing: [...missing.entries()].map(([kw, data]) => ({ keyword: kw, ...data })),
    extra: [...extra.entries()].map(([kw, data]) => ({ keyword: kw, ...data })),
    matchedByCategory,
    missingByCategory,
    suggestions,
    atsChecks: atsResults,
    parsingConfidence,
    bulletAudits,
  };
}
