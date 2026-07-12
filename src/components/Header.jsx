export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo"><img src="/logo.png" alt="Resume For Each Logo" /></div>
        <div>
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem' }}>ONE</span> 
            <span style={{ fontSize: '1.2rem', marginTop: '10px' }}>job resume</span> 
          </div>
          <div className="header-subtitle">Tailor your resume to every job description</div>
        </div>
      </div>
      <div className="header-badge">
        <span className="header-badge-dot"></span>
        <span>ATS Optimized · 100% Private</span>
      </div>
    </header>
  );
}
