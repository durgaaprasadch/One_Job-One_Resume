import ScoreRing from './ScoreRing';
import { 
  RefreshCw, 
  AlertOctagon, 
  Code2, 
  Users, 
  Award, 
  Zap, 
  Scissors, 
  Info, 
  CheckCircle2,
  CheckSquare,
  XSquare,
  AlertTriangle,
  Trophy
} from 'lucide-react';

const IconMap = {
  'refresh': RefreshCw,
  'alert-octagon': AlertOctagon,
  'code-2': Code2,
  'users': Users,
  'award': Award,
  'zap': Zap,
  'scissors': Scissors,
  'info': Info,
  'check-circle-2': CheckCircle2
};

const CATEGORY_LABELS = {
  technical: '💻 Technical Skills',
  soft: '🤝 Soft Skills',
  certification: '📜 Certifications',
  action: '⚡ Action Verbs',
  other: '📌 Other Keywords',
};

const CATEGORY_ORDER = ['technical', 'certification', 'soft', 'action', 'other'];

export default function AnalysisDashboard({ results, onBack, onViewTailored, onReset }) {
  const {
    score,
    matchedCount,
    missingCount,
    extraCount,
    totalJdKeywords,
    matched,
    missing,
    matchedByCategory,
    missingByCategory,
    suggestions,
    atsChecks,
    parsingConfidence,
  } = results;

  const atsPassCount = atsChecks.filter(c => c.pass).length;

  return (
    <div className="dashboard">
      {/* Parsing Warnings */}
      {parsingConfidence?.warnings?.length > 0 && (
        <div className="parsing-warning" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--warning)', margin: '0 0 8px 0', fontSize: '1rem' }}>[ PARSING WARN ] Confidence: {parsingConfidence.confidence.toUpperCase()}</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
            {parsingConfidence.warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Back / Actions */}
      <div className="back-bar">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Input
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onReset}>
            [ NEW ] Analysis
          </button>
          <button className="btn btn-success" onClick={onViewTailored}>
            [ VIEW ] Tailored Resume →
          </button>
        </div>
      </div>

      {/* Score + Stats */}
      <div className="dashboard-top">
        <div className="score-card">
          <div className="score-label">Match Score</div>
          <ScoreRing score={score} />
          <div className="score-sublabel">
            {score >= 70
              ? 'Killer match. You\'re hitting all the right notes.'
              : score >= 40
              ? 'Solid start. Let\'s patch the gaps the ATS wants.'
              : 'Rough match. We need to do some serious tailoring.'}
          </div>
        </div>

        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value matched">{matchedCount}</div>
              <div className="stat-label">Keywords Matched</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill matched"
                  style={{ width: `${totalJdKeywords > 0 ? (matchedCount / totalJdKeywords) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value missing">{missingCount}</div>
              <div className="stat-label">Keywords Missing</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill missing"
                  style={{ width: `${totalJdKeywords > 0 ? (missingCount / totalJdKeywords) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value extra">{extraCount}</div>
              <div className="stat-label">Extra Skills</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill extra"
                  style={{ width: `${Math.min(100, extraCount * 5)}%` }}
                />
              </div>
            </div>
          </div>

          {/* ATS Checks */}
          <div className="ats-section" style={{ marginTop: '16px' }}>
            <div className="section-title">
              [ FORMAT CHECKS ]
              <span className="keyword-badge info" style={{ marginLeft: '8px' }}>
                {atsPassCount}/{atsChecks.length} passed
              </span>
            </div>
            <div className="ats-checklist">
              {atsChecks.map((check, idx) => (
                <div key={idx} className="ats-check">
                  <span className="ats-check-icon">
                    {check.pass ? <CheckSquare size={20} /> : <XSquare size={20} />}
                  </span>
                  <div>
                    <div className="ats-check-label">{check.label}</div>
                    {check.detail && (
                      <div className="ats-check-detail">{check.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Matched vs Missing */}
      <div className="keywords-grid">
        <div className="keywords-panel matched">
          <div className="section-title">
            [ MATCHED KEYWORDS ] ({matchedCount})
          </div>
          {CATEGORY_ORDER.map(cat => {
            const items = matchedByCategory[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat} className="keyword-category">
                <div className="keyword-category-label">{CATEGORY_LABELS[cat]}</div>
                <div className="keywords-list">
                  {items.map((item, idx) => (
                    <span 
                      key={idx} 
                      className={`keyword-badge matched ${item.matchType === 'synonym' ? 'synonym-badge' : ''}`}
                      title={item.matchType === 'synonym' ? `Matched via synonym: ${item.matchedAs}` : ''}
                    >
                      {item.keyword}
                      {item.matchType === 'synonym' && <span style={{fontSize: '0.65rem', opacity: 0.8, marginLeft: '4px'}}>(syn)</span>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {matchedCount === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              [ ERR ] Zero matches found.
            </div>
          )}
        </div>

        <div className="keywords-panel missing">
          <div className="section-title">
            [ MISSING KEYWORDS ] ({missingCount})
          </div>
          {CATEGORY_ORDER.map(cat => {
            const items = missingByCategory[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat} className="keyword-category">
                <div className="keyword-category-label">{CATEGORY_LABELS[cat]}</div>
                <div className="keywords-list">
                  {items.map((item, idx) => (
                    <span key={idx} className="keyword-badge missing">
                      {item.keyword}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {missingCount === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              [ OK ] Zero missing keywords.
            </div>
          )}
        </div>
      </div>

      {/* ATS Bullet Audit */}
      {results.bulletAudits && results.bulletAudits.totalBullets > 0 && (
        <div className="audit-section" style={{ marginBottom: '32px' }}>
          <div className="section-title">
            [ BULLET AUDIT ]
            <span className={`keyword-badge ${results.bulletAudits.weakBulletsCount === 0 ? 'matched' : 'missing'}`} style={{ marginLeft: '8px' }}>
              {results.bulletAudits.weakBulletsCount} Weak Bullets Found
            </span>
          </div>
          
          {results.bulletAudits.weakBulletsCount === 0 ? (
            <div className="suggestion-card positive">
              <div className="suggestion-icon"><Trophy size={24} /></div>
              <div className="suggestion-content">
                <div className="suggestion-title">Excellent Bullet Points!</div>
                <div className="suggestion-text">Every bullet point hits hard with an action verb and quantifiable metric. Recruiters love this.</div>
              </div>
            </div>
          ) : (
            <div className="audit-grid">
              {results.bulletAudits.weakBullets.map((bullet, idx) => (
                <div key={idx} className="audit-card">
                  <div className="audit-bullet-text">"{bullet.original.length > 120 ? bullet.original.substring(0, 117) + '...' : bullet.original}"</div>
                  
                  <div className="audit-flags">
                    {!bullet.hasMetrics && (
                      <div className="audit-flag missing-metric">
                        <span><XSquare size={16} /></span> Missing Measurable Metric (%, $, time)
                      </div>
                    )}
                    {bullet.weakVerbsFound.length > 0 && (
                      <div className="audit-flag weak-verb">
                        <span><AlertTriangle size={16} /></span> Weak Verb: <strong>{bullet.weakVerbsFound[0]}</strong>
                        <div className="audit-suggestions">
                          Try: {bullet.suggestions.map(s => <span key={s} className="audit-suggestion-badge">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      <div className="suggestions-section">
        <div className="section-title">[ SUGGESTIONS ]</div>
        {suggestions.map((sug, idx) => {
          const IconComponent = IconMap[sug.icon] || Info;
          return (
            <div key={idx} className={`suggestion-card ${sug.type}`}>
              <div className="suggestion-icon"><IconComponent size={24} /></div>
              <div className="suggestion-content">
                <div className="suggestion-title">{sug.title}</div>
                <div
                  className="suggestion-text"
                  dangerouslySetInnerHTML={{
                    __html: sug.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button className="btn btn-success" onClick={onViewTailored}>
          [ VIEW ] Tailored Resume →
        </button>
      </div>
    </div>
  );
}
