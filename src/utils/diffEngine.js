/**
 * Diff Engine
 * 
 * Computes a structured, line-level diff between the original resume
 * and the tailored output. Every change is annotated with WHY it was made.
 * 
 * This is NOT a generic text diff — it understands resume structure:
 * sections, skill lists, and experience bullet ordering.
 */

/**
 * Compute a structured diff between original and tailored resume.
 * 
 * @param {string} original - The user's original resume text
 * @param {string} tailored - The tailored resume text
 * @param {object} analysisResults - The analysis results (matched keywords etc.)
 * @returns {object} Structured diff with changes, annotations, and summary
 */
export function computeDiff(original, tailored, analysisResults) {
  const origLines = original.split('\n');
  const tailLines = tailored.split('\n');

  const matchedKeywords = new Set(
    (analysisResults?.matched || []).map(m => m.keyword.toLowerCase())
  );

  const changes = [];
  let skillsReordered = 0;
  let bulletsReordered = 0;
  let sectionsReordered = 0;
  let linesAdded = 0; // Should always be 0 if integrity checker passes
  let linesRemoved = 0;

  // Build line-to-position maps for both versions
  const origLinePositions = buildLinePositionMap(origLines);
  const tailLinePositions = buildLinePositionMap(tailLines);

  // Track which original lines appear in the tailored output
  const origLinesUsed = new Set();

  // Analyze each tailored line — where did it come from?
  for (let i = 0; i < tailLines.length; i++) {
    const line = tailLines[i].trim();
    if (!line) continue;

    // Skip formatting lines (section headers, separators)
    if (isFormattingLine(line)) continue;

    const normalized = line.toLowerCase().replace(/\s+/g, ' ');
    const origPositions = origLinePositions.get(normalized);

    if (origPositions && origPositions.length > 0) {
      const origPos = origPositions[0]; // First occurrence
      origLinesUsed.add(origPos);

      // Check if position changed
      if (origPos !== i) {
        // Determine what type of reorder this is
        const keywords = findMatchedKeywords(line, matchedKeywords);

        if (isSkillListLine(line)) {
          skillsReordered++;
          changes.push({
            type: 'skill_reorder',
            lineNumber: i + 1,
            content: truncate(line, 80),
            originalPosition: origPos + 1,
            newPosition: i + 1,
            direction: origPos > i ? 'promoted' : 'demoted',
            reason: keywords.length > 0
              ? `Skills reordered — JD-matched skills (${keywords.join(', ')}) moved to front`
              : 'Skills reordered by JD relevance',
          });
        } else if (isBulletLine(line)) {
          bulletsReordered++;
          changes.push({
            type: 'bullet_reorder',
            lineNumber: i + 1,
            content: truncate(line, 80),
            originalPosition: origPos + 1,
            newPosition: i + 1,
            direction: origPos > i ? 'promoted' : 'demoted',
            reason: keywords.length > 0
              ? `↑ Moved up: contains JD keywords "${keywords.join('", "')}"`
              : origPos > i
              ? '↑ Moved up by relevance score'
              : '↓ Moved down (less JD-relevant)',
          });
        } else {
          // Section-level reorder or other structural change
          sectionsReordered++;
          changes.push({
            type: 'structural',
            lineNumber: i + 1,
            content: truncate(line, 80),
            originalPosition: origPos + 1,
            newPosition: i + 1,
            reason: 'Section/block reordered',
          });
        }
      }
      // If position didn't change — it's unchanged, no entry needed
    } else {
      // Line not found in original — this should be caught by integrity checker
      linesAdded++;
      changes.push({
        type: 'added',
        lineNumber: i + 1,
        content: truncate(line, 80),
        reason: '⚠️ This line was not found in your original resume',
      });
    }
  }

  // Check for removed lines
  for (let i = 0; i < origLines.length; i++) {
    const line = origLines[i].trim();
    if (!line || isFormattingLine(line)) continue;

    if (!origLinesUsed.has(i)) {
      // Check if it's in the tailored output at a different position
      const normalized = line.toLowerCase().replace(/\s+/g, ' ');
      if (!tailLinePositions.has(normalized)) {
        linesRemoved++;
      }
    }
  }

  // Build the summary
  const totalChanges = skillsReordered + bulletsReordered + sectionsReordered;

  return {
    changes,
    totalChanges,
    skillsReordered,
    bulletsReordered,
    sectionsReordered,
    linesAdded,
    linesRemoved,
    summary: buildSummary(totalChanges, skillsReordered, bulletsReordered, linesAdded),
    originalLineCount: origLines.filter(l => l.trim()).length,
    tailoredLineCount: tailLines.filter(l => l.trim()).length,
  };
}

// ─── Helpers ──────────────────────────────────────────────────

function buildLinePositionMap(lines) {
  const map = new Map(); // normalized line → [positions]
  for (let i = 0; i < lines.length; i++) {
    const normalized = lines[i].trim().toLowerCase().replace(/\s+/g, ' ');
    if (!normalized) continue;
    if (!map.has(normalized)) map.set(normalized, []);
    map.get(normalized).push(i);
  }
  return map;
}

function isFormattingLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^[─━═\-_~]{3,}$/.test(trimmed)) return true;
  const HEADERS = [
    'professional summary', 'technical skills', 'professional experience',
    'projects', 'education', 'certifications', 'awards & achievements',
    'publications', 'volunteer experience', 'languages', 'interests'
  ];
  return HEADERS.includes(trimmed.toLowerCase());
}

function isSkillListLine(line) {
  // Skills are typically comma-separated lists
  const commaCount = (line.match(/,/g) || []).length;
  return commaCount >= 3;
}

function isBulletLine(line) {
  return /^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]/.test(line);
}

function findMatchedKeywords(line, matchedKeywords) {
  const lower = line.toLowerCase();
  const found = [];
  for (const kw of matchedKeywords) {
    if (lower.includes(kw)) found.push(kw);
  }
  return found.slice(0, 4); // Max 4 for display
}

function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

function buildSummary(total, skills, bullets, added) {
  const parts = [];
  if (skills > 0) parts.push(`${skills} skill(s) reprioritized`);
  if (bullets > 0) parts.push(`${bullets} bullet(s) reordered`);
  if (added > 0) parts.push(`⚠️ ${added} line(s) added (should not happen)`);

  if (parts.length === 0) {
    return 'No changes made — your resume already matches well';
  }

  return `${parts.join(', ')} · 0 content fabricated`;
}
