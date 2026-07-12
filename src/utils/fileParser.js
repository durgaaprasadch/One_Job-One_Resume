/**
 * File parser utility — extracts text from uploaded resume files
 * Supports: .txt, .pdf, .doc/.docx (text extraction)
 */

// Parse a PDF file and extract text
async function parsePDF(file) {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = '';
    let lastY = null;

    for (const item of textContent.items) {
      if (lastY !== null && lastY !== item.transform[5]) {
        pageText += '\n';
      }
      
      pageText += item.str;
      
      if (item.hasEOL) {
        pageText += '\n';
        lastY = null;
      } else {
        lastY = item.transform[5];
      }
    }
    
    // Clean up multiple spaces but preserve single newlines
    // Also apply kerning fix for split uppercase words often caused by PDF letter-spacing (e.g., 'S KILLS' -> 'SKILLS')
    const cleanedPageText = pageText
      .split('\n')
      .map(line => {
        let cleaned = line.replace(/\s{2,}/g, ' ').trim();
        // Fix single rogue spaces splitting uppercase headers caused by kerning
        cleaned = cleaned
          .replace(/\bS KILLS\b/g, 'SKILLS')
          .replace(/\bE XPERIENCE\b/g, 'EXPERIENCE')
          .replace(/\bP ROJECTS\b/g, 'PROJECTS')
          .replace(/\bC ERTIFICATES\b/g, 'CERTIFICATES')
          .replace(/\bE DUCATION\b/g, 'EDUCATION')
          .replace(/\bA CHIEVEMENT S\b/g, 'ACHIEVEMENTS')
          .replace(/\bA CHIEVEMENTS\b/g, 'ACHIEVEMENTS');
        return cleaned;
      })
      .filter(line => line.length > 0)
      .join('\n');
      
    fullText += cleanedPageText + '\n\n';
  }

  return fullText.trim();
}

// Parse a plain text file
async function parseTXT(file) {
  return await file.text();
}

// Parse a DOCX file (basic extraction — reads the XML inside the zip)
async function parseDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const text = await blob.text();

    if (file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim();
      return readable || 'Could not parse .doc file. Please paste your resume text or save as .txt/.pdf.';
    }

    // Extract paragraphs <w:p>
    const paragraphs = text.match(/<w:p(?: [^>]+)?>.*?<\/w:p>/g);
    if (paragraphs) {
      const extracted = paragraphs.map(p => {
        // Extract text runs <w:t> within the paragraph
        const texts = p.match(/<w:t(?: [^>]+)?>([^<]*)<\/w:t>/g);
        if (!texts) return '';
        return texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
      }).join('\n');
      
      return extracted
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    }

    return 'Could not parse .docx file. Please paste your resume text or save as .txt/.pdf.';
  } catch {
    return 'Could not parse this file. Please paste your resume text or save as .txt/.pdf.';
  }
}

// Main file parser — detects type and extracts text
export async function parseResumeFile(file) {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return await parsePDF(file);
  }

  if (name.endsWith('.txt') || type === 'text/plain') {
    return await parseTXT(file);
  }

  if (name.endsWith('.docx') || name.endsWith('.doc') ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword') {
    return await parseDOCX(file);
  }

  // Fallback — try reading as text
  try {
    return await file.text();
  } catch {
    throw new Error('Unsupported file format. Please use .pdf, .txt, or .docx');
  }
}

// Get human-readable file size
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
