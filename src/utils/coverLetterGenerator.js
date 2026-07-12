/**
 * Cover Letter Generator
 * 
 * Generates a cover letter skeleton built ONLY from the user's real resume content.
 * It maps JD keywords to actual resume bullet points, so the claims in the cover
 * letter are 100% truthful based on the source resume.
 */

import { parseResumeSections } from './resumeGenerator';

export function generateCoverLetter(resumeText, analysisResults, jdText) {
  const sections = parseResumeSections(resumeText);
  const { matched, missing } = analysisResults;

  // Extract Company Name from JD (heuristics)
  let companyName = '[Company Name]';
  const jdLines = jdText.split('\n');
  if (jdLines[0] && jdLines[0].length < 50) {
    // Sometimes the first line is the company or role
    const potentialCompany = jdLines[0].trim();
    if (!potentialCompany.toLowerCase().includes('developer') && !potentialCompany.toLowerCase().includes('engineer')) {
      companyName = potentialCompany;
    }
  }

  // Find the top matched skills
  const topSkills = matched
    .filter(m => m.category === 'technical')
    .slice(0, 3)
    .map(m => m.keyword);
    
  const skillsStr = topSkills.length > 0 
    ? topSkills.join(', ')
    : '[Key Skill 1], [Key Skill 2]';

  // Find the most relevant experience bullets (that match JD keywords)
  const bullets = [];
  if (sections.experience) {
    const expLines = sections.experience.split('\n');
    for (const line of expLines) {
      if (/^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]/.test(line)) {
        // Count matches in this bullet
        let matchCount = 0;
        for (const m of matched) {
          if (line.toLowerCase().includes(m.keyword.toLowerCase())) {
            matchCount++;
          }
        }
        if (matchCount > 0) {
          bullets.push({ text: line.replace(/^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]\s*/, ''), matchCount });
        }
      }
    }
  }
  
  // Sort by relevance and take top 2
  bullets.sort((a, b) => b.matchCount - a.matchCount);
  const topBullets = bullets.slice(0, 2);

  // Build the letter
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let letter = `[Your Name]\n[Your Email] • [Your Phone]\n\n${date}\n\nHiring Team\n${companyName}\n\nDear Hiring Manager,\n\n`;

  // Paragraph 1: Intent and Summary
  if (sections.summary) {
    letter += `I am writing to express my interest in the open position at ${companyName}. As a professional with a background matching your requirements, I offer the following overview of my experience:\n\n"${sections.summary.trim()}"\n\n`;
  } else {
    letter += `I am writing to express my interest in the open position at ${companyName}. With a strong background in ${skillsStr}, I am confident in my ability to contribute effectively to your team.\n\n`;
  }

  // Paragraph 2: Specific Experience matches
  if (topBullets.length > 0) {
    letter += `Your job description highlights several areas where my past experience aligns directly. Specifically, in my previous roles, I have:\n\n`;
    for (const b of topBullets) {
      letter += `• ${b.text}\n`;
    }
    letter += '\n';
  }

  // Paragraph 3: Wrap up
  letter += `I am particularly drawn to ${companyName} because of the opportunity to leverage my skills to deliver impactful results. I would welcome the chance to discuss how my background, particularly my experience with ${skillsStr}, aligns with your goals.\n\n`;
  
  letter += `Thank you for your time and consideration. I have attached my resume and look forward to the possibility of discussing this opportunity with you.\n\n`;
  
  letter += `Sincerely,\n\n[Your Name]`;

  return letter;
}
