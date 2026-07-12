import { useState, useEffect } from 'react';

export default function ScoreRing({ score, size = 160, strokeWidth = 10 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Color based on score
  let color;
  if (score >= 70) color = 'var(--success)';
  else if (score >= 40) color = 'var(--warning)';
  else color = 'var(--danger)';

  let glowColor;
  if (score >= 70) glowColor = 'rgba(16, 185, 129, 0.3)';
  else if (score >= 40) glowColor = 'rgba(245, 158, 11, 0.3)';
  else glowColor = 'rgba(244, 63, 94, 0.3)';

  return (
    <div className="score-ring-wrapper">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 20px ${glowColor})` }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-ring-value" style={{ color }}>
          {animatedScore}
        </span>
        <span className="score-ring-percent">ATS Score</span>
      </div>
    </div>
  );
}
