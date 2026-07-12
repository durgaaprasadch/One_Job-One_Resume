import React from 'react';

export default function DiffView({ diffResults }) {
  if (!diffResults) return null;

  const {
    changes,
    totalChanges,
    skillsReordered,
    bulletsReordered,
    linesAdded,
    summary
  } = diffResults;

  if (totalChanges === 0 && linesAdded === 0) {
    return (
      <div className="diff-view empty">
        <div className="diff-summary success">
          ✅ {summary}
        </div>
      </div>
    );
  }

  return (
    <div className="diff-view">
      <div className={`diff-summary ${linesAdded > 0 ? 'danger' : 'success'}`}>
        <div className="diff-summary-title">
          {linesAdded > 0 ? '⚠️ Integrity Violation Detected' : '✅ Integrity Verified'}
        </div>
        <div className="diff-summary-text">{summary}</div>
      </div>

      <div className="diff-changes-list">
        {changes.map((change, idx) => (
          <div key={idx} className={`diff-change-card ${change.type}`}>
            <div className="diff-change-header">
              <span className={`diff-badge ${change.direction || change.type}`}>
                {change.type === 'skill_reorder' ? 'Skill Reordered' :
                 change.type === 'bullet_reorder' ? 'Bullet Reordered' :
                 change.type === 'added' ? 'Content Added' : 'Structural'}
              </span>
              <span className="diff-line-number">Line {change.lineNumber}</span>
            </div>
            
            <div className="diff-change-content">
              {change.content}
            </div>
            
            <div className="diff-change-reason">
              {change.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
