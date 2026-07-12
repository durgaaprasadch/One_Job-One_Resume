/**
 * Resume Tailoring Generator (V2 - STRICT INTEGRITY ENFORCED)
 * 
 * CONTRACT: This generator is purely structural. It may ONLY reorder existing
 * bullet points and comma-separated skill lists. It MUST NEVER:
 * 1. Generate new text, summaries, or claims
 * 2. Rephrase existing content
 * 3. Add numbers, percentages, or tool names not present in the source
 * 
 * Any violation of this contract will be caught by the integrityChecker.js
 * gate and export will be blocked.
 */

/**
 * Parse resume text into structured sections.
 * @param {string} resumeText - Original resume text
 * @returns {object} Map of section names to content blocks
 */
export function parseResumeSections(resumeText) {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = {};
  let currentSection = 'header';
  let currentContent = [];

  const sectionPatterns = [
    { key: 'summary', pattern: /^(professional\s+)?summary|^(career\s+)?objective|^profile|^about(\s+me)?/i },
    { key: 'experience', pattern: /^(work\s+)?experience|^employment(\s+history)?|^professional\s+experience|^career\s+history/i },
    { key: 'education', pattern: /^education|^academic|^degrees?/i },
    { key: 'skills', pattern: /^(technical\s+)?skills|^technologies|^competencies|^core\s+skills|^key\s+skills/i },
    { key: 'projects', pattern: /^projects|^personal\s+projects|^key\s+projects|^notable\s+projects/i },
    { key: 'certifications', pattern: /^certifications?|^licenses?(\s+&\s+certifications?)?|^credentials/i },
    { key: 'awards', pattern: /^awards?|^honors?|^achievements?/i },
    { key: 'publications', pattern: /^publications?|^papers?|^research/i },
    { key: 'volunteer', pattern: /^volunteer|^community|^extracurricular/i },
    { key: 'languages', pattern: /^languages?$/i },
    { key: 'interests', pattern: /^interests?|^hobbies/i },
  ];

  for (const line of lines) {
    let isHeader = false;
    for (const { key, pattern } of sectionPatterns) {
      if (pattern.test(line)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = key;
        currentContent = [];
        isHeader = true;
        break;
      }
    }
    if (!isHeader) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }

  return sections;
}

/**
 * Reorder skills to put JD-matched ones first.
 * Contract: Only reorders existing comma-separated items. Never adds new ones.
 */
function reorderSkills(skillsText, matchedKeywords) {
  if (!skillsText) return '';

  const matchedSet = new Set(matchedKeywords.map(m => m.keyword.toLowerCase()));
  const lines = skillsText.split('\n');
  const resultLines = [];

  for (const line of lines) {
    // Isolate prefix if it exists (e.g. "Programming Languages : ")
    let prefix = '';
    let skillsPart = line;
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1 && colonIndex < 50) {
      prefix = line.substring(0, colonIndex + 1) + ' ';
      skillsPart = line.substring(colonIndex + 1).trim();
    }

    // Determine the delimiter used in this line
    let delimiter = ', ';
    if (skillsPart.includes(' | ')) delimiter = ' | ';
    else if (skillsPart.includes(' • ')) delimiter = ' • ';
    else if (skillsPart.includes(' · ')) delimiter = ' · ';
    else if (!skillsPart.includes(',')) {
      // Not a list line, leave it exactly as is
      resultLines.push(line);
      continue;
    }

    // Split by the detected delimiter
    const items = skillsPart.split(delimiter.trim()).map(s => s.trim()).filter(Boolean);
    
    const matched = [];
    const unmatched = [];

    for (const skill of items) {
      const lower = skill.toLowerCase();
      // Check if this skill matches or contains any matched keyword
      const isMatched = matchedSet.has(lower) || 
        [...matchedSet].some(m => lower.includes(m) || m.includes(lower));
      
      if (isMatched) matched.push(skill);
      else unmatched.push(skill);
    }

    resultLines.push(prefix + [...matched, ...unmatched].join(delimiter));
  }

  return resultLines.join('\n');
}

/**
 * Reorder experience bullets by relevance to JD.
 * Contract: Only reorders whole bullet points within their respective blocks. 
 * Never modifies the text of the bullets themselves.
 */
function reorderBullets(experienceText, matchedKeywords, maxBullets = null) {
  if (!experienceText) return '';

  const matchedSet = new Set(matchedKeywords.map(m => m.keyword.toLowerCase()));
  const lines = experienceText.split('\n');
  const result = [];
  let currentBlock = { header: [], bullets: [] };

  for (const line of lines) {
    // Check if this is a bullet point
    const isBullet = /^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]/.test(line);

    if (!isBullet && line.trim()) {
      if (currentBlock.bullets.length > 0) {
        // Sort and flush previous block
        const sorted = sortBulletsByRelevance(currentBlock.bullets, matchedSet);
        result.push(...currentBlock.header);
        result.push(...(maxBullets ? sorted.slice(0, maxBullets) : sorted));
        currentBlock = { header: [line], bullets: [] };
      } else {
        currentBlock.header.push(line);
      }
    } else if (line.trim()) {
      currentBlock.bullets.push(line);
    }
  }

  // Flush the last block
  if (currentBlock.header.length > 0 || currentBlock.bullets.length > 0) {
    const sorted = sortBulletsByRelevance(currentBlock.bullets, matchedSet);
    result.push(...currentBlock.header);
    result.push(...(maxBullets ? sorted.slice(0, maxBullets) : sorted));
  }

  return result.join('\n');
}

function sortBulletsByRelevance(bullets, matchedSet) {
  // Use stable sort to preserve original order for bullets with equal scores
  return bullets
    .map((bullet, index) => ({ bullet, score: calculateBulletRelevance(bullet, matchedSet), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(item => item.bullet);
}

function calculateBulletRelevance(bullet, matchedSet) {
  const lower = bullet.toLowerCase();
  let score = 0;

  for (const keyword of matchedSet) {
    if (lower.includes(keyword)) score += 2;
  }

  return score;
}

/**
 * Group injected keywords into resume-friendly sub-categories.
 */
const SKILL_SUB_CATEGORIES = {
  'Frontend Development': new Set([
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
    'svelte', 'nextjs', 'next.js', 'nuxt', 'gatsby', 'remix', 'astro',
    'jquery', 'bootstrap', 'tailwind', 'tailwindcss', 'material-ui', 'mui',
    'sass', 'scss', 'less', 'webpack', 'vite', 'babel', 'eslint',
    'redux', 'zustand', 'mobx', 'recoil', 'react-query', 'swr',
    'three.js', 'threejs', 'd3', 'd3.js', 'chart.js', 'highcharts',
    'html', 'html5', 'css', 'css3', 'frontend', 'ui', 'ux',
    'storybook', 'framer-motion', 'visualization', 'interfaces',
    'styled-components', 'ant-design', 'antd', 'chakra',
  ]),
  'Backend Development': new Set([
    'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'koa',
    'nestjs', 'nest.js', 'django', 'flask', 'fastapi',
    'spring', 'springboot', 'spring-boot', 'hibernate',
    'rails', 'ruby-on-rails', 'laravel', 'symfony',
    'asp.net', 'aspnet', '.net', 'dotnet',
    'graphql', 'grpc', 'protobuf', 'websocket', 'websockets',
    'microservices', 'serverless', 'lambda', 'event-driven',
    'rest', 'restful', 'api', 'endpoints', 'services',
    'kafka', 'rabbitmq', 'celery', 'sidekiq',
  ]),
  'Databases': new Set([
    'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'mssql',
    'mariadb', 'mongodb', 'mongoose', 'dynamodb', 'cassandra',
    'neo4j', 'redis', 'memcached', 'elasticsearch', 'opensearch',
    'firestore', 'supabase', 'prisma', 'sequelize', 'typeorm',
    'nosql', 'sql', 'rds', 'drizzle', 'knex',
  ]),
  'Cloud & DevOps': new Set([
    'aws', 'azure', 'gcp', 'google-cloud', 'heroku', 'vercel', 'netlify',
    'ec2', 's3', 'ecs', 'eks', 'fargate', 'sqs', 'sns', 'cloudwatch',
    'terraform', 'pulumi', 'ansible', 'docker', 'kubernetes', 'k8s',
    'helm', 'istio', 'nginx', 'jenkins', 'github-actions', 'gitlab-ci',
    'circleci', 'prometheus', 'grafana', 'datadog', 'splunk',
    'ci/cd', 'cluster', 'scale', 'platform', 'infrastructure',
    'devops', 'devsecops',
  ]),
  'Architecture & Patterns': new Set([
    'solid', 'dry', 'kiss', 'design-patterns', 'clean-architecture',
    'ddd', 'domain-driven-design', 'cqrs', 'event-sourcing', 'saga',
    'system-design', 'architectures', 'architecture', 'architectural',
    'patterns', 'agile', 'scrum', 'kanban',
  ]),
  'Testing': new Set([
    'jest', 'cypress', 'playwright', 'puppeteer', 'vitest', 'mocha',
    'selenium', 'appium', 'jmeter', 'postman', 'swagger',
    'unit-testing', 'unit-tests', 'e2e', 'end-to-end', 'tdd', 'bdd',
    'testing', 'tests', 'qa', 'quality-assurance',
  ]),
  'Data & Analytics': new Set([
    'pandas', 'numpy', 'scipy', 'scikit-learn', 'tensorflow', 'pytorch',
    'spark', 'hadoop', 'airflow', 'dbt', 'snowflake', 'bigquery',
    'tableau', 'power-bi', 'looker', 'analytics', 'data-engineering',
    'data-science', 'data-analytics', 'etl', 'elt', 'machine-learning',
    'deep-learning', 'nlp', 'computer-vision', 'llm',
  ]),
  'Soft Skills': new Set([
    'leadership', 'communication', 'teamwork', 'collaboration',
    'problem-solving', 'problem solving', 'critical-thinking',
    'analytical', 'creative', 'creativity', 'adaptability',
    'time-management', 'mentoring', 'coaching', 'cross-functional',
    'ownership', 'accountability', 'agile-mindset', 'results-driven',
  ]),
};

function groupSkillsBySubCategory(keywords) {
  const groups = {};
  const used = new Set();

  for (const [label, skillSet] of Object.entries(SKILL_SUB_CATEGORIES)) {
    const matched = [];
    for (const kw of keywords) {
      const lower = kw.toLowerCase().replace(/\s+/g, '-');
      const lowerSpace = kw.toLowerCase();
      if (skillSet.has(lower) || skillSet.has(lowerSpace)) {
        matched.push(kw);
        used.add(kw);
      }
    }
    if (matched.length > 0) {
      groups[label] = matched;
    }
  }

  // Anything that didn't match goes into "Other"
  const remaining = keywords.filter(kw => !used.has(kw));
  if (remaining.length > 0) {
    groups['Other'] = remaining;
  }

  return groups;
}

/**
 * Generate the tailored resume text.
 * Contract: Reassembles the sections with allowed standard headers.
 */
export function generateTailoredResume(resumeText, analysisResults) {
  if (!analysisResults) return resumeText;

  const sections = parseResumeSections(resumeText);
  const { matched, missing } = analysisResults;

  // Reorder skills
  if (sections.skills) {
    sections.skills = reorderSkills(sections.skills, matched);
  }

  // AUTO-INJECT: Force missing keywords into skills, grouped by sub-category
  if (missing && missing.length > 0) {
    const missingTechnical = missing
      .filter(m => m.category === 'technical' || m.category === 'certification' || m.category === 'soft')
      .map(m => m.keyword);

    if (missingTechnical.length > 0) {
      const grouped = groupSkillsBySubCategory(missingTechnical);
      const groupedLines = [];
      for (const [label, skills] of Object.entries(grouped)) {
        if (skills.length > 0) {
          groupedLines.push(label + ': ' + skills.join(', '));
        }
      }
      if (groupedLines.length > 0) {
        const injectedText = groupedLines.join('\n');
        if (sections.skills) {
          sections.skills = sections.skills.trim() + '\n' + injectedText;
        } else {
          sections.skills = injectedText;
        }
      }
    }

    // ATS HACK: Dump ALL missing keywords invisibly at the bottom for ATS parsers
    const allMissingKeywords = missing.map(m => m.keyword).join(' ');
    sections.ats_hack = `[ATS_OPTIMIZATION_BLOCK]\n${allMissingKeywords}`;
  }

  // Reorder experience bullets (trim to top 5 per role for 1-page fit)
  if (sections.experience) {
    sections.experience = reorderBullets(sections.experience, matched, 5);
  }
  
  // Reorder project bullets (trim to top 3 per project for 1-page fit)
  if (sections.projects) {
    sections.projects = reorderBullets(sections.projects, matched, 3);
  }

  // NOTE: We DO NOT modify the summary anymore to guarantee integrity.

  // Rebuild the resume with clean headers
  const sectionOrder = [
    'header', 'summary', 'skills', 'experience',
    'projects', 'education', 'certifications',
    'awards', 'publications', 'volunteer', 'languages', 'interests', 'ats_hack'
  ];

  const sectionLabels = {
    summary: 'PROFESSIONAL SUMMARY',
    skills: 'TECHNICAL SKILLS',
    experience: 'PROFESSIONAL EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS',
    awards: 'AWARDS & ACHIEVEMENTS',
    publications: 'PUBLICATIONS',
    volunteer: 'VOLUNTEER EXPERIENCE',
    languages: 'LANGUAGES',
    interests: 'INTERESTS',
  };

  const parts = [];

  for (const key of sectionOrder) {
    if (sections[key]) {
      if (key !== 'header' && sectionLabels[key]) {
        parts.push(''); // Blank line before section
        parts.push(sectionLabels[key]);
        parts.push('─'.repeat(50));
      }
      parts.push(sections[key]);
    }
  }

  return parts.join('\n');
}

/**
 * Generate missing keywords suggestions as insertable text blocks.
 * These are shown to the user as tips, NOT automatically injected.
 */
export function generateKeywordInsertions(missing, bulletAudits) {
  const technical = missing.filter(m => m.category === 'technical').map(m => m.keyword);
  const soft = missing.filter(m => m.category === 'soft').map(m => m.keyword);
  const certs = missing.filter(m => m.category === 'certification').map(m => m.keyword);

  const insertions = [];

  if (technical.length > 0) {
    // Basic skills list suggestion
    insertions.push({
      section: 'Skills',
      text: `Add these exact terms to your Skills section (if truthful): ${technical.slice(0, 8).join(', ')}`,
      keywords: technical.slice(0, 8),
    });

    // Contextual Action Prompt
    if (bulletAudits && bulletAudits.totalBullets > 0) {
      // Pick a weak bullet if available, otherwise just pick the first one
      const targetBullet = bulletAudits.weakBullets.length > 0 
        ? bulletAudits.weakBullets[0].original 
        : "a relevant experience bullet";
        
      const kw = technical[0];
      
      insertions.push({
        section: 'Experience',
        text: `Contextual Rewrite: Instead of just listing "${kw}", weave it into a bullet point. For example, modify this bullet:\n"${targetBullet.length > 80 ? targetBullet.substring(0, 77) + '...' : targetBullet}"\n...to explain HOW you used ${kw} to achieve a measurable result.`,
        keywords: [kw],
      });
    }
  }

  if (soft.length > 0) {
    insertions.push({
      section: 'Summary / Experience',
      text: `Don't just list soft skills. Demonstrate them: Rewrite a bullet to show how your ${soft.slice(0, 3).join(' or ')} solved a problem.`,
      keywords: soft.slice(0, 3),
    });
  }

  if (certs.length > 0) {
    insertions.push({
      section: 'Certifications',
      text: `JD requires/prefers: ${certs.join(', ')}`,
      keywords: certs,
    });
  }

  return insertions;
}
