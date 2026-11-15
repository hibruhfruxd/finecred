"use client";

import { useId } from "react";

interface ScoreGaugeProps {
  score: number | null;
  maxScore?: number;
  band: string;
  size?: number;
}

export function ScoreGauge({ score, maxScore = 100, band, size = 240 }: ScoreGaugeProps) {
  const gradientId = useId().replace(/:/g, "");
  const stroke = 14;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score === null ? 0 : Math.min(1, Math.max(0, score / maxScore));
  const offset = circumference * (1 - progress);
  const tone =
    score === null
      ? "unavailable"
      : score >= 85
        ? "strong"
        : score >= 70
          ? "good"
          : score >= 55
            ? "fair"
            : score >= 40
              ? "developing"
              : "limited";

  return (
    <div className={`score-gauge score-gauge-${tone}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Illustrative score ${score ?? "unavailable"} out of ${maxScore}. ${band}.`}>
        <defs>
          <linearGradient id={`gauge-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gauge-start)" />
            <stop offset="100%" stopColor="var(--gauge-end)" />
          </linearGradient>
        </defs>
        <circle
          className="score-gauge-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="score-gauge-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gauge-${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-gauge-center">
        <span className="score-gauge-value">{score === null ? "—" : score}</span>
        <span className="score-gauge-max">{score === null ? "Not available" : `of ${maxScore}`}</span>
        <span className="score-gauge-band">{band}</span>
      </div>
    </div>
  );
}
