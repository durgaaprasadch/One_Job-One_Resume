/**
 * PDF Templates for Resume Export
 * 
 * Provides ATS-Safe (Plain) and Styled (Human-Readable) HTML structures
 * that html2pdf.js uses to generate the final PDF.
 */

// Helper to wrap resume content in standard HTML structure
function wrapContent(content, templateStyles, styleType) {
  const fontImport = styleType === 'styled' 
    ? `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` 
    : '';

  const fontFamily = styleType === 'styled' 
    ? `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` 
    : `Arial, Helvetica, sans-serif`;

  return `
    <style>
      ${fontImport}
      .pdf-container {
        font-family: ${fontFamily};
        font-size: 10px;
        line-height: 1.35;
        color: #111;
        ${templateStyles}
      }
      .pdf-container ul {
        margin: 4px 0 12px 0;
        padding-left: 20px;
      }
      .pdf-container li {
        margin-bottom: 4px;
        color: ${styleType === 'styled' ? '#334155' : '#111'};
      }
      .styled-header-line {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
      }
    </style>
    <div class="pdf-container">
      ${content}
    </div>
  `;
}

// Convert raw text into structured HTML for better ATS parsing
function formatResumeToHtml(resumeText, styleType) {
  const lines = resumeText.split('\n');
  let html = '';
  let inList = false;
  let isFirstLine = true;
  let inHeaderBlock = true;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    if (!trimmed) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (inHeaderBlock && !isFirstLine) {
        html += `</div>`; // Close contact info block
        inHeaderBlock = false;
      } else {
        html += '<div style="height: 8px;"></div>';
      }
      continue;
    }

    // Check if it's the ATS Optimization Hack Block
    if (trimmed === '[ATS_OPTIMIZATION_BLOCK]') {
      html += `<div style="color: #ffffff; font-size: 1px; opacity: 0.01; height: 1px; overflow: hidden; user-select: none;">${lines.slice(i+1).join(' ')}</div>`;
      break; // Stop parsing normal lines, everything remaining goes into the hidden div
    }

    // Check if it's a generated section header (we used 50 dashes in generator)
    if (/^[─━═\-_~]{10,}$/.test(trimmed)) {
      continue; // Skip the line of dashes
    }

    // Header Block Logic (Name and Contact Info)
    // We also check length < 100 to ensure we don't format the entire resume as a name if newlines were somehow stripped.
    if (isFirstLine && trimmed.length < 100) {
      if (styleType === 'styled') {
        html += `<div style="font-size: 26px; font-weight: 700; text-align: center; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">${trimmed}</div>`;
        html += `<div class="styled-header-line" style="font-size: 10px; color: #475569; margin-bottom: 16px; line-height: 1.4;">`;
      } else {
        html += `<div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 6px;">${trimmed}</div>`;
        html += `<div style="text-align: center; margin-bottom: 12px;">`;
      }
      isFirstLine = false;
      continue;
    } else if (isFirstLine) {
      isFirstLine = false;
      inHeaderBlock = false; // Disable header block if first line is a massive blob
    }

    if (inHeaderBlock) {
      // Contact info line
      if (styleType === 'styled') {
        if (!html.endsWith('">')) {
          html += `<span style="color: #cbd5e1;">|</span>`;
        }
        // Make emails/links bold for style
        const styledText = trimmed.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+|(https?:\/\/)?(www\.)?linkedin\.com\/[^\s]+|(https?:\/\/)?(www\.)?github\.com\/[^\s]+)/gi, '<strong>$1</strong>');
        html += `<span>${styledText}</span>`;
      } else {
        html += `<span>${trimmed} </span>`;
      }
      continue;
    }

    // Check if it's a section header (all caps, no bullets)
    const isHeader = trimmed === trimmed.toUpperCase() && !/^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]/.test(trimmed) && trimmed.length > 3 && trimmed.length < 50;

    if (isHeader) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      if (styleType === 'styled') {
        html += `<h2 style="font-size: 12px; font-weight: 600; margin: 12px 0 6px 0; border-bottom: 2px solid #3b82f6; color: #1e3a8a; padding-bottom: 2px; letter-spacing: 0.5px;">${trimmed}</h2>`;
      } else {
        html += `<h2 style="font-size: 12px; margin: 12px 0 4px 0; font-weight: bold;">${trimmed}</h2><hr style="border: 0; border-bottom: 1px solid #ccc; margin-bottom: 6px;" />`;
      }
      continue;
    }

    // Check if it's a bullet point
    if (/^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]/.test(trimmed)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      const bulletText = trimmed.replace(/^\s*[-•·▪▸►●○◆◇■□★☆➤➢→]\s*/, '');
      html += `<li>${bulletText}</li>`;
      continue;
    }

    // Normal text line
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    
    // Check if it looks like a job title / company line (often contains dates)
    const hasDate = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\s*\d{4}|\d{4}\s*[-–]\s*(?:\d{4}|present)/i.test(trimmed);
    
    if (hasDate) {
      if (styleType === 'styled') {
        // Simple elegant styling for dates/titles
        html += `<div style="font-weight: 600; color: #0f172a; margin-top: 12px; margin-bottom: 4px; font-size: 11.5px;">${trimmed}</div>`;
      } else {
        html += `<div style="font-weight: bold; margin-top: 8px;">${trimmed}</div>`;
      }
    } else {
      if (styleType === 'styled') {
        html += `<div style="margin-bottom: 4px; color: #334155;">${trimmed}</div>`;
      } else {
        html += `<div style="margin-bottom: 4px;">${trimmed}</div>`;
      }
    }
  }

  if (inList) {
    html += '</ul>';
  }
  if (inHeaderBlock) {
    html += '</div>';
  }

  return html;
}

export function generatePdfHtml(resumeText, templateType) {
  const structuredHtml = formatResumeToHtml(resumeText, templateType);

  if (templateType === 'styled') {
    return wrapContent(structuredHtml, 'padding: 20px; max-width: 800px; margin: 0 auto; background-color: #ffffff;', templateType);
  }

  // ATS Safe - Plain
  return wrapContent(structuredHtml, 'padding: 20px; max-width: 800px; margin: 0 auto;', templateType);
}
