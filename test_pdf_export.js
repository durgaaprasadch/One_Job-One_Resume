

import puppeteer from 'puppeteer';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractTextFromPdfBuffer(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = '';
    let lastY = null;

    for (const item of textContent.items) {
      if (lastY !== null && Math.abs(lastY - item.transform[5]) > 2) {
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
    
    const cleanedPageText = pageText
      .split('\n')
      .map(line => line.replace(/\s{2,}/g, ' ').trim())
      .filter(line => line.length > 0)
      .join('\n');
      
    fullText += cleanedPageText + '\n';
  }
  return fullText;
}

(async () => {
  console.log("Starting visual regression test...");
  
  // We use Vite's dev server to get the JS execution context
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Input test resume
  const testResume = `John Doe
Software Engineer
john@email.com | github.com/john

PROFESSIONAL EXPERIENCE
- Built a robust API
- Reduced latency by 40%
- Implemented CI/CD pipelines

TECHNICAL SKILLS
- JavaScript, React, Node`;

  console.log("Generating HTML using application logic...");
  
  // Directly call the application's JS function in the browser
  await page.evaluate(async (resumeText) => {
    // We dynamically import the module in the browser context since Vite serves it
    const module = await import('/src/utils/pdfTemplates.js');
    const html = module.generatePdfHtml(resumeText, 'ats-safe');
    
    document.body.innerHTML = html;
  }, testResume);

  // 1. DOM Structure Verification
  console.log("Verifying DOM block-level formatting...");
  const domStats = await page.evaluate(() => {
    return {
      ulCount: document.querySelectorAll('ul').length,
      liCount: document.querySelectorAll('li').length,
      h2Count: document.querySelectorAll('h2').length
    };
  });
  
  if (domStats.ulCount >= 2 && domStats.liCount >= 4 && domStats.h2Count >= 2) {
    console.log(`✅ DOM Structure Passed: Found ${domStats.h2Count} headers, ${domStats.ulCount} lists, ${domStats.liCount} bullets.`);
  } else {
    console.error(`❌ DOM Structure Failed:`, domStats);
    await browser.close();
    process.exit(1);
  }

  // 2. Headless PDF generation & re-extraction (Native printing simulation)
  console.log("Generating Native PDF via Puppeteer...");
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    printBackground: true
  });

  console.log("Parsing generated PDF with pdfjs-dist...");
  const pdfText = await extractTextFromPdfBuffer(pdfBuffer);
  
  const lines = pdfText.split('\n');
  const bullets = lines.filter(l => l.includes('Built a robust API') || l.includes('Reduced latency by') || l.includes('Implemented CI/CD') || l.includes('JavaScript, React, Node'));
  
  let passed = true;
  if (bullets.length < 4) {
    console.error(`❌ Visual Regression Failed: Expected 4 bullets on separate lines, found ${bullets.length}`);
    console.log(pdfText);
    passed = false;
  } else {
    console.log("✅ Visual Regression Passed: Bullet points are on separate lines in extracted PDF text.");
  }

  await browser.close();
  
  if (!passed) {
    process.exit(1);
  } else {
    console.log("All visual regression tests passed successfully.");
  }
})();
