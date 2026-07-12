import { useState, useCallback, useEffect } from 'react';
import { analyzeResume } from './utils/analyzer';
import { generateTailoredResume, generateKeywordInsertions } from './utils/resumeGenerator';
import { verifyIntegrity } from './utils/integrityChecker';
import { computeDiff } from './utils/diffEngine';
import { generateCoverLetter } from './utils/coverLetterGenerator';

import Header from './components/Header';
import InputPanel from './components/InputPanel';
import AnalysisDashboard from './components/AnalysisDashboard';
import TailoredResume from './components/TailoredResume';
import CoverLetter from './components/CoverLetter';

const STEPS = [
  { id: 1, label: 'Input' },
  { id: 2, label: 'Analysis' },
  { id: 3, label: 'Tailored Resume' },
  { id: 4, label: 'Cover Letter' },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeText, setResumeText] = useState(() => {
    // Force cache bust to wipe out broken newline-stripped text from V1
    const v2Cache = localStorage.getItem('rfe_v2_cache_cleared_final');
    if (!v2Cache) {
      localStorage.setItem('rfe_v2_cache_cleared_final', 'true');
      localStorage.removeItem('rfe_resume');
      return '';
    }
    return localStorage.getItem('rfe_resume') || '';
  });
  const [jdText, setJdText] = useState('');
  
  // Analysis State
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Generation State
  const [tailoredResume, setTailoredResume] = useState('');
  const [insertions, setInsertions] = useState([]);
  const [diffResults, setDiffResults] = useState(null);
  const [isIntegrityPassed, setIsIntegrityPassed] = useState(true);
  const [coverLetterText, setCoverLetterText] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Save resume to localStorage
  useEffect(() => {
    if (resumeText) {
      localStorage.setItem('rfe_resume', resumeText);
    }
  }, [resumeText]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!resumeText.trim() || !jdText.trim()) {
      showToast('Please paste both your resume and the job description', 'error');
      return;
    }

    setIsAnalyzing(true);

    // Small delay for the loading animation
    setTimeout(() => {
      // 1. Analyze
      const results = analyzeResume(resumeText, jdText);
      setAnalysisResults(results);

      // 2. Generate
      const tailored = generateTailoredResume(resumeText, results);
      setTailoredResume(tailored);

      // 3. Verify Integrity
      const integrityCheck = verifyIntegrity(resumeText, tailored);
      setIsIntegrityPassed(integrityCheck.passed);

      // 4. Compute Diff
      const diff = computeDiff(resumeText, tailored, results);
      // If integrity failed, manually inject the lines added into diff for visibility
      if (!integrityCheck.passed) {
        diff.linesAdded = integrityCheck.lineCheck.violations.length;
        diff.summary = integrityCheck.summary;
        integrityCheck.lineCheck.violations.forEach(v => {
          diff.changes.unshift({
            type: 'added',
            lineNumber: v.line,
            content: v.content.length > 80 ? v.content.substring(0, 77) + '...' : v.content,
            reason: v.reason
          });
        });
      }
      setDiffResults(diff);

      // 5. Insertions
      const keywordInsertions = generateKeywordInsertions(results.missing, results.bulletAudits);
      setInsertions(keywordInsertions);

      // 6. Cover Letter
      const letter = generateCoverLetter(resumeText, results, jdText);
      setCoverLetterText(letter);

      setIsAnalyzing(false);
      setCurrentStep(2);
      showToast('Analysis complete!');
    }, 800);
  }, [resumeText, jdText, showToast]);

  const handleGoToTailored = useCallback(() => {
    setCurrentStep(3);
  }, []);

  const handleGoToCoverLetter = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleStepClick = useCallback((step) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && analysisResults) {
      setCurrentStep(2);
    } else if (step === 3 && tailoredResume) {
      setCurrentStep(3);
    } else if (step === 4 && coverLetterText) {
      setCurrentStep(4);
    }
  }, [analysisResults, tailoredResume, coverLetterText]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setJdText('');
    setAnalysisResults(null);
    setTailoredResume('');
    setInsertions([]);
    setDiffResults(null);
    setIsIntegrityPassed(true);
    setCoverLetterText('');
  }, []);

  return (
    <>
      <Header />

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((step, idx) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              onClick={() => handleStepClick(step.id)}
            >
              <span className="step-number">
                {currentStep > step.id ? '✓' : step.id}
              </span>
              <span>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`step-connector ${currentStep > step.id ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      <main className="app-main">
        {currentStep === 1 && (
          <InputPanel
            resumeText={resumeText}
            setResumeText={setResumeText}
            jdText={jdText}
            setJdText={setJdText}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentStep === 2 && analysisResults && (
          <AnalysisDashboard
            results={analysisResults}
            onBack={() => setCurrentStep(1)}
            onViewTailored={handleGoToTailored}
            onReset={handleReset}
          />
        )}

        {currentStep === 3 && (
          <TailoredResume
            tailoredResume={tailoredResume}
            diffResults={diffResults}
            insertions={insertions}
            isIntegrityPassed={isIntegrityPassed}
            onBack={() => setCurrentStep(2)}
            showToast={showToast}
          />
        )}

        {currentStep === 4 && (
          <CoverLetter 
            initialLetter={coverLetterText}
            onBack={() => setCurrentStep(3)}
            showToast={showToast}
          />
        )}

        {currentStep === 3 && (
          <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
            <button className="btn btn-primary" onClick={handleGoToCoverLetter} style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
              ✉️ Generate Cover Letter →
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        Built with 💜 to help you land your dream job · Your data stays in your browser — 100% private
      </footer>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
