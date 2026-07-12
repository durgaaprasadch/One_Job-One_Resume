export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo"><img src="/logo.png" alt="Resume For Each Logo" /></div>
        <div>
          <div className="header-title">Resume for Each</div>
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
