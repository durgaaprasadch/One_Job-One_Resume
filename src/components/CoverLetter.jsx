import { useState, useCallback } from 'react';
import { generatePdfHtml } from '../utils/pdfTemplates';

export default function CoverLetter({ 
  initialLetter, 
  onBack, 
  showToast 
}) {
  const [letterContent, setLetterContent] = useState(initialLetter);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(letterContent);
      showToast('Cover letter copied to clipboard!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = letterContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Cover letter copied to clipboard!');
    }
  }, [letterContent, showToast]);

  const handleDownloadPDF = useCallback(async () => {
    showToast('Preparing PDF...');
    try {
      const htmlContent = generatePdfHtml(letterContent, 'styled');
      
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const printDocument = printFrame.contentWindow.document;
      printDocument.open();
      printDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cover Letter</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1cm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printDocument.close();

      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
          showToast('Print dialog opened. Save as PDF.');
        }, 1000);
      }, 800);
      
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('PDF generation failed. Try copying instead.', 'error');
    }
  }, [letterContent, showToast]);

  return (
    <div className="cover-letter-section">
      <div className="tailored-header">
        <div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Resume
          </button>
        </div>
        <div className="tailored-actions">
          <button className="btn btn-secondary" onClick={handleCopy}>
            📋 Copy
          </button>
          <button className="btn btn-success" onClick={handleDownloadPDF}>
            📥 Download PDF
          </button>
        </div>
      </div>

      <div className="integrity-banner" style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }}>
        ℹ️ <strong>Truthful by Design:</strong> This cover letter skeleton is built ONLY using text directly extracted from your original resume. Review and fill in the [bracketed] placeholders before sending.
      </div>

      <div className="resume-container">
        <textarea
          className="cover-letter-editor"
          value={letterContent}
          onChange={(e) => setLetterContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: '600px',
            padding: '24px',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            lineHeight: '1.6',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}
