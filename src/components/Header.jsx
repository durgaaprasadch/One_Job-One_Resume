import { useState, useEffect } from 'react';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo"><img src="/logo.png" alt="Resume For Each Logo" /></div>
        <div>
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem' }}>ONE</span>
            <span style={{ fontSize: '1.2rem', marginTop: '10px' }}>JOB,</span>
            <span style={{ fontSize: '2.5rem' }}>ONE</span>
            <span style={{ fontSize: '1.2rem', marginTop: '10px' }}>RESUME</span>
          </div>
          <div className="header-subtitle">Tailor your resume to every job description</div>
        </div>
      </div>
      <div className="header-right">
        <button
          className="dark-mode-toggle"
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="header-badge">
          <span className="header-badge-dot"></span>
          <span>ATS Optimized · 100% Private</span>
        </div>
      </div>
    </header>
  );
}
