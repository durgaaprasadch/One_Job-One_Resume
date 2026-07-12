export const WEAK_VERBS = [
  'worked on', 'helped with', 'responsible for', 'did', 'made', 'got', 'put', 'took',
  'was part of', 'involved in', 'assisted', 'participated', 'handled', 'managed',
  'dealt with', 'looked after', 'supported', 'contributed to', 'tried', 'attempted',
  'fixed', 'changed'
];

export const STRONG_VERBS_SUGGESTIONS = {
  'worked on': ['Engineered', 'Developed', 'Architected'],
  'helped with': ['Collaborated on', 'Facilitated', 'Supported'],
  'responsible for': ['Spearheaded', 'Directed', 'Orchestrated'],
  'did': ['Executed', 'Accomplished', 'Achieved'],
  'made': ['Constructed', 'Formulated', 'Created'],
  'fixed': ['Resolved', 'Debugged', 'Troubleshot'],
  'managed': ['Directed', 'Led', 'Supervised'],
  'handled': ['Administered', 'Coordinated', 'Operated'],
  'changed': ['Transformed', 'Overhauled', 'Redesigned']
};

/**
 * Extracts bullet points from the resume text.
 * Looks for common bullet characters or lines starting with a verb-like structure.
 */
export function extractBullets(resumeText) {
  const lines = resumeText.split('\n');
  const bullets = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if it starts with a bullet character or a dash
    if (/^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+/, ''));
    } 
    // Fallback: Check if it's a relatively short sentence (likely a bullet if it's part of experience)
    else if (trimmed.length > 20 && trimmed.length < 300 && !trimmed.includes('|') && /^[A-Z]/.test(trimmed)) {
      // Heuristic: Does it start with a common past tense verb ending in 'ed'?
      const firstWord = trimmed.split(' ')[0].toLowerCase();
      if (firstWord.endsWith('ed') || firstWord === 'built' || firstWord === 'led' || firstWord === 'wrote') {
        bullets.push(trimmed);
      }
    }
  }
  
  return bullets;
}

/**
 * Audits a single bullet point for metrics and weak verbs.
 */
export function auditBullet(bulletText) {
  const lowerText = bulletText.toLowerCase();
  
  // 1. Check for metrics
  // Matches: percentages (40%), currency ($1M, 500k), large numbers (10,000, 500+), timeframes (3 months)
  const hasMetrics = /\d+[%$]|\$[\d,.]+[kmbl]?|\d+,\d+|\d+\+?(?:x|k|m|b)\b|\b\d+\s+(?:months|years|days|weeks|users|customers|clients|requests|servers|gb|tb|mb)\b/i.test(lowerText);
  
  // 2. Check for weak verbs
  let weakVerbsFound = [];
  let suggestions = [];
  
  for (const weakVerb of WEAK_VERBS) {
    // Look for exact word boundary match
    const regex = new RegExp(`\\b${weakVerb}\\b`, 'i');
    if (regex.test(lowerText)) {
      weakVerbsFound.push(weakVerb);
      if (STRONG_VERBS_SUGGESTIONS[weakVerb]) {
        suggestions.push(...STRONG_VERBS_SUGGESTIONS[weakVerb]);
      } else {
        suggestions.push('Engineered', 'Spearheaded', 'Optimized');
      }
    }
  }
  
  // Deduplicate suggestions
  suggestions = [...new Set(suggestions)].slice(0, 3);
  
  return {
    original: bulletText,
    hasMetrics,
    weakVerbsFound,
    suggestions,
    isWeak: !hasMetrics || weakVerbsFound.length > 0
  };
}

/**
 * Audits the entire resume text and returns actionable advice for bullets.
 */
export function auditResumeBullets(resumeText) {
  const bullets = extractBullets(resumeText);
  const audited = bullets.map(auditBullet);
  
  const weakBullets = audited.filter(b => b.isWeak);
  const metricLessBullets = weakBullets.filter(b => !b.hasMetrics);
  const weakVerbBullets = weakBullets.filter(b => b.weakVerbsFound.length > 0);
  
  return {
    totalBullets: bullets.length,
    weakBulletsCount: weakBullets.length,
    weakBullets: weakBullets.slice(0, 8), // Cap at 8 to avoid overwhelming UI
    metricsWarning: metricLessBullets.length > 0,
    verbsWarning: weakVerbBullets.length > 0
  };
}
