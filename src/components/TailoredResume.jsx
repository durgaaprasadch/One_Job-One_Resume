import { useState, useCallback, useRef } from 'react';
import DiffView from './DiffView';
import { generatePdfHtml } from '../utils/pdfTemplates';

export default function TailoredResume({
  tailoredResume,
  diffResults,
  insertions,
  onBack,
  showToast,
  isIntegrityPassed,
}) {
  const [viewMode, setViewMode] = useState('diff'); // 'diff' or 'clean'
  const [pdfTemplate, setPdfTemplate] = useState('ats-safe');

  const handleCopy = useCallback(async () => {
    if (!isIntegrityPassed) {
      showToast('Cannot copy: integrity violation detected. Fix original resume first.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(tailoredResume);
      showToast('Resume copied to clipboard!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = tailoredResume;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Resume copied to clipboard!');
    }
  }, [tailoredResume, showToast, isIntegrityPassed]);

  const handleDownloadPDF = useCallback(async () => {
    if (!isIntegrityPassed) {
      showToast('Cannot export: integrity violation detected. Fix original resume first.', 'error');
      return;
    }
    
    showToast('Preparing PDF...');
    try {
      const htmlContent = generatePdfHtml(tailoredResume, pdfTemplate);
      
      // We use native browser printing to generate a TRUE text-based ATS-safe PDF.
      // html2pdf.js generates rasterized images which completely fail ATS parsers.
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
            <title>Resume</title>
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

      // Give fonts a moment to load
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
  }, [tailoredResume, pdfTemplate, showToast, isIntegrityPassed]);

  const handleDownloadTxt = useCallback(() => {
    if (!isIntegrityPassed) {
      showToast('Cannot export: integrity violation detected. Fix original resume first.', 'error');
      return;
    }
    
    let filename = prompt('Enter filename for text file:', 'FirstName_LastName_Resume.txt');
    if (!filename) return;
    if (!filename.toLowerCase().endsWith('.txt')) filename += '.txt';

    const blob = new Blob([tailoredResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Text file downloaded!');
  }, [tailoredResume, showToast, isIntegrityPassed]);

  // Handle DOCX export by generating simple HTML and saving as .doc (Word opens it fine)
  const handleDownloadDocx = useCallback(() => {
    if (!isIntegrityPassed) {
      showToast('Cannot export: integrity violation detected. Fix original resume first.', 'error');
      return;
    }
    
    let filename = prompt('Enter filename for Word doc:', 'FirstName_LastName_Resume.doc');
    if (!filename) return;
    if (!filename.toLowerCase().endsWith('.doc')) filename += '.doc';

    const htmlContent = generatePdfHtml(tailoredResume, 'ats-safe');
    
    // Create a Blob with HTML content and proper Word MIME type
    const blob = new Blob([
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
      '<head><meta charset="utf-8"><title>Export HTML to Word Document</title></head><body>',
      htmlContent,
      '</body></html>'
    ], { type: 'application/msword' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Word document downloaded!');
  }, [tailoredResume, showToast, isIntegrityPassed]);

  return (
    <div className="tailored-section">
      <div className="tailored-header">
        <div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Analysis
          </button>
        </div>
        <div className="tailored-actions">
          <div className="export-options">
            <select 
              className="template-select"
              value={pdfTemplate}
              onChange={(e) => setPdfTemplate(e.target.value)}
              disabled={!isIntegrityPassed}
            >
              <option value="ats-safe">Template: ATS-Safe (Plain)</option>
              <option value="styled">Template: Styled (Human)</option>
            </select>
          </div>
          
          <button className="btn btn-secondary" onClick={handleCopy} disabled={!isIntegrityPassed}>
            📋 Copy
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadTxt} disabled={!isIntegrityPassed}>
            📝 .txt
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadDocx} disabled={!isIntegrityPassed}>
            📝 .doc
          </button>
          <button className="btn btn-success" onClick={handleDownloadPDF} disabled={!isIntegrityPassed}>
            📥 PDF
          </button>
        </div>
      </div>

      {!isIntegrityPassed && (
        <div className="integrity-banner">
          ⚠️ <strong>Integrity Check Failed:</strong> The generated resume contains lines that were not found in your original resume. Export has been disabled to prevent fabricating content. Check the Diff View below to see the added lines.
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'diff' ? 'active' : ''}`}
          onClick={() => setViewMode('diff')}
        >
          🔍 View Changes (Diff)
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'clean' ? 'active' : ''}`}
          onClick={() => setViewMode('clean')}
        >
          📄 View Export Preview
        </button>
      </div>

      {/* Resume Content */}
      <div className="resume-container">
        {viewMode === 'diff' ? (
          <DiffView diffResults={diffResults} />
        ) : (
          <div 
            className="resume-preview-html" 
            style={{ backgroundColor: '#e2e8f0', padding: '24px', borderRadius: '8px', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: generatePdfHtml(tailoredResume, pdfTemplate) }}
          />
        )}
      </div>

      {/* Keyword Insertion Suggestions */}
      {insertions.length > 0 && (
        <div className="insertions-section">
          <div className="section-title" style={{ marginBottom: '16px' }}>
            ⚡ Keywords to Add (from JD)
          </div>
          {insertions.map((ins, idx) => (
            <div key={idx} className="insertion-card">
              <div className="insertion-section-label">
                Add to: {ins.section}
              </div>
              <div className="insertion-text">{ins.text}</div>
              <div className="insertion-keywords">
                {ins.keywords.map((kw, kwIdx) => (
                  <span key={kwIdx} className="keyword-badge missing">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
