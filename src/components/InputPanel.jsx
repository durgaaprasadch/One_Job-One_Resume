import { useRef, useState } from 'react';
import { SAMPLE_RESUME, SAMPLE_JD } from '../utils/sampleData';
import { parseResumeFile, formatFileSize } from '../utils/fileParser';

export default function InputPanel({
  resumeText,
  setResumeText,
  jdText,
  setJdText,
  onAnalyze,
  isAnalyzing,
}) {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setJdText(SAMPLE_JD);
    setUploadedFile(null);
    setParseError('');
  };

  const handleClearAll = () => {
    setResumeText('');
    setJdText('');
    setUploadedFile(null);
    setParseError('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsingFile(true);
    setParseError('');

    try {
      const text = await parseResumeFile(file);
      if (text && text.length > 20) {
        setResumeText(text);
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      } else {
        setParseError('Could not extract enough text from this file. Try pasting your resume instead.');
      }
    } catch (err) {
      setParseError(err.message || 'Failed to parse file. Try a different format.');
    }

    setIsParsingFile(false);
    // Reset file input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText('');
    setParseError('');
  };

  const canAnalyze = resumeText.trim().length > 50 && jdText.trim().length > 50;

  return (
    <div className="input-panel">
      <div className="input-grid">
        {/* Resume Input */}
        <div className="input-card">
          <div className="input-card-header">
            <div className="input-card-title">
              <span className="icon">📝</span>
              Your Master Resume
            </div>
            <span className="char-count">{resumeText.length} chars</span>
          </div>

          {/* File Upload Zone */}
          <div className="file-upload-zone">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="resume-file-input"
            />

            {uploadedFile ? (
              <div className="file-uploaded">
                <div className="file-info">
                  <span className="file-icon">📎</span>
                  <div>
                    <div className="file-name">{uploadedFile.name}</div>
                    <div className="file-size">{formatFileSize(uploadedFile.size)} · Parsed successfully</div>
                  </div>
                </div>
                <button className="btn btn-icon" onClick={handleRemoveFile} title="Remove file">
                  ✕
                </button>
              </div>
            ) : (
              <button
                className={`btn-upload ${isParsingFile ? 'loading' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingFile}
              >
                {isParsingFile ? (
                  <>
                    <span className="upload-spinner"></span>
                    Parsing file...
                  </>
                ) : (
                  <>
                    <span className="upload-icon">📤</span>
                    <span className="upload-text">Upload Resume</span>
                    <span className="upload-formats">PDF, TXT, DOCX</span>
                  </>
                )}
              </button>
            )}

            {parseError && (
              <div className="file-error">⚠️ {parseError}</div>
            )}
          </div>

          <div className="input-divider">
            <span className="input-divider-text">or paste below</span>
          </div>

          <textarea
            className="input-textarea"
            placeholder="Paste your complete resume here...&#10;&#10;Include all your skills, experience, projects, education — everything you've got. Don't hold back.&#10;&#10;This is your master resume that we'll tailor for the specific job."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (uploadedFile) setUploadedFile(null);
            }}
            spellCheck={false}
          />
        </div>

        {/* JD Input */}
        <div className="input-card">
          <div className="input-card-header">
            <div className="input-card-title">
              <span className="icon">💼</span>
              Job Description
            </div>
            <span className="char-count">{jdText.length} chars</span>
          </div>
          <textarea
            className="input-textarea input-textarea-full"
            placeholder="Paste the job description here...&#10;&#10;Copy the full JD from LinkedIn, Naukri, or the company website. Include responsibilities, requirements, qualifications — everything.&#10;&#10;The more complete, the better the analysis."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="input-actions">
        <button
          className="btn btn-secondary"
          onClick={handleLoadSample}
        >
          ✨ Try Sample Data
        </button>

        <button
          className={`btn btn-primary ${isAnalyzing ? 'btn-loading' : ''}`}
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
        >
          <span className="btn-text">
            🔍 Analyze & Match
          </span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleClearAll}
          disabled={!resumeText && !jdText}
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
