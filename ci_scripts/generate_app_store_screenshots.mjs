import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const appDir = path.join(repoRoot, 'my-study-app');
const appRequire = createRequire(path.join(appDir, 'package.json'));
const sharp = appRequire('sharp');
const questions = appRequire(path.join(appDir, 'app', 'ham_radio_questions.json'));
const lessonsFile = appRequire(path.join(appDir, 'app', 'lessons.json'));
const lessons = lessonsFile.lessons;

const outputRoot = path.join(repoRoot, 'app-store-assets', 'ios');

const devices = [
  {
    key: 'iphone-6.5',
    width: 1284,
    height: 2778,
    frame: { x: 159, y: 944, width: 966, height: 1608, radius: 72 },
    titleSize: 82,
    subSize: 34,
  },
  {
    key: 'ipad-13',
    width: 2048,
    height: 2732,
    frame: { x: 362, y: 900, width: 1324, height: 1510, radius: 64 },
    titleSize: 92,
    subSize: 38,
  },
];

const palette = {
  ink: '#f8fafc',
  muted: '#cbd5e1',
  dim: '#94a3b8',
  app: '#020617',
  panel: '#0f172a',
  panel2: '#111827',
  border: '#1e293b',
  sky: '#38bdf8',
  blue: '#2563eb',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#fb7185',
  violet: '#8b5cf6',
  orange: '#f97316',
};

const screenSpecs = [
  {
    file: '01-main-menu.png',
    title: 'Technician exam prep that meets you where you study',
    subtitle: '409 official 2026-2030 questions, lessons, practice exams, bookmarks, and smart review in one focused app.',
    render: renderMainMenu,
  },
  {
    file: '02-learn-topics.png',
    title: 'Learn every FCC topic before you test',
    subtitle: 'Ten bite-sized lessons cover safety, rules, operating procedures, propagation, electronics, antennas, and more.',
    render: renderLearnTopics,
  },
  {
    file: '03-study-explanation.png',
    title: 'Practice with instant explanations',
    subtitle: 'Study mode shows the right answer and the why behind it, so you build radio knowledge instead of memorizing letters.',
    render: renderStudyExplanation,
  },
  {
    file: '04-analytics.png',
    title: 'See weak areas before exam day',
    subtitle: 'Track accuracy by subelement and focus on topics below the 74 percent passing threshold.',
    render: renderAnalytics,
  },
  {
    file: '05-review-premium.png',
    title: 'Keep missed questions from sneaking back',
    subtitle: 'Spaced review, bookmarks, achievements, and unlimited practice help turn shaky topics into mastered ones.',
    render: renderReviewPremium,
  },
];

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function textBlock({ x, y, width, text, size, lineHeight = 1.18, color = palette.ink, weight = 700, maxLines = 4, anchor = 'start' }) {
  const approxChars = Math.max(10, Math.floor(width / (size * 0.52)));
  const lines = wrapText(text, approxChars).slice(0, maxLines);
  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${esc(line)}</tspan>`)
    .join('');

  return `<text text-anchor="${anchor}" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${tspans}</text>`;
}

function rect({ x, y, width, height, radius = 24, fill = palette.panel, stroke = palette.border, strokeWidth = 2, opacity = 1 }) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

function pill(x, y, label, fill, color = palette.ink, size = 20) {
  const width = Math.max(120, label.length * size * 0.56 + 42);
  return `${rect({ x, y, width, height: size * 2.15, radius: size, fill, stroke: fill, strokeWidth: 0 })}<text x="${x + width / 2}" y="${y + size * 1.38}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${color}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(label)}</text>`;
}

function progressBar(x, y, width, value, fill = palette.emerald) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="18" rx="9" fill="#1e293b"/>
    <rect x="${x}" y="${y}" width="${Math.round(width * value)}" height="18" rx="9" fill="${fill}"/>
  `;
}

function button(x, y, width, height, label, fill, sublabel = '') {
  const main = `<text x="${x + width / 2}" y="${y + height * 0.42}" text-anchor="middle" font-size="${height * 0.23}" font-weight="850" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(label)}</text>`;
  const sub = sublabel
    ? `<text x="${x + width / 2}" y="${y + height * 0.68}" text-anchor="middle" font-size="${height * 0.13}" font-weight="500" fill="#dbeafe" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(sublabel)}</text>`
    : '';
  return `${rect({ x, y, width, height, radius: 22, fill, stroke: fill, strokeWidth: 0 })}${main}${sub}`;
}

function deviceShell(device, innerSvg) {
  const f = device.frame;
  const notchWidth = f.width * 0.28;
  return `
    <filter id="deviceShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="34" stdDeviation="34" flood-color="#000000" flood-opacity="0.36"/>
    </filter>
    <g filter="url(#deviceShadow)">
      ${rect({ ...f, fill: '#050b16', stroke: '#334155', strokeWidth: 5 })}
      <clipPath id="screenClip"><rect x="${f.x + 22}" y="${f.y + 22}" width="${f.width - 44}" height="${f.height - 44}" rx="${Math.max(34, f.radius - 20)}"/></clipPath>
      <g clip-path="url(#screenClip)">
        <rect x="${f.x + 22}" y="${f.y + 22}" width="${f.width - 44}" height="${f.height - 44}" fill="${palette.app}"/>
        ${innerSvg(f.x + 52, f.y + 70, f.width - 104, f.height - 132)}
      </g>
      <rect x="${f.x + f.width / 2 - notchWidth / 2}" y="${f.y + 34}" width="${notchWidth}" height="24" rx="12" fill="#172033" opacity="0.9"/>
    </g>
  `;
}

function screenshotSvg(device, spec) {
  const titleWidth = device.width * 0.82;
  const titleX = device.width * 0.09;
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${device.width}" height="${device.height}" viewBox="0 0 ${device.width} ${device.height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#07111f"/>
        <stop offset="0.45" stop-color="#0f1f2e"/>
        <stop offset="1" stop-color="#1e293b"/>
      </linearGradient>
      <radialGradient id="signal" cx="0.7" cy="0.1" r="0.75">
        <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.42"/>
        <stop offset="0.46" stop-color="#10b981" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.05"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#signal)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    ${pill(titleX, device.height * 0.065, 'HAM RADIO STUDY BUDDY', 'rgba(56,189,248,0.18)', palette.sky, Math.round(device.subSize * 0.56))}
    ${textBlock({ x: titleX, y: device.height * 0.15, width: titleWidth, text: spec.title, size: device.titleSize, lineHeight: 1.06, maxLines: 3 })}
    ${textBlock({ x: titleX, y: device.height * 0.275, width: titleWidth, text: spec.subtitle, size: device.subSize, lineHeight: 1.3, color: palette.muted, weight: 500, maxLines: 3 })}
    ${deviceShell(device, spec.render)}
  </svg>`;
}

function renderHeader(x, y, w, title, subtitle) {
  return `
    <text x="${x}" y="${y}" font-size="${w * 0.052}" font-weight="900" fill="${palette.sky}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Ham Radio Study Buddy</text>
    <text x="${x}" y="${y + w * 0.052}" font-size="${w * 0.026}" font-weight="700" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(title || 'Technician Class Prep')}</text>
    ${subtitle ? `<text x="${x}" y="${y + w * 0.088}" font-size="${w * 0.022}" font-weight="600" fill="${palette.muted}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(subtitle)}</text>` : ''}
  `;
}

function renderMainMenu(x, y, w, h) {
  const cardW = w * 0.86;
  const cardX = x + w * 0.07;
  let cy = y + h * 0.055;
  const btnH = h * 0.085;
  return `
    ${rect({ x: cardX, y: cy, width: cardW, height: h * 0.89, radius: 34, fill: palette.panel, stroke: '#1f2a44', strokeWidth: 3 })}
    ${renderHeader(cardX + cardW * 0.09, cy + h * 0.075, cardW, 'Technician Class Prep', '')}
    ${rect({ x: cardX + cardW * 0.09, y: cy + h * 0.15, width: cardW * 0.82, height: h * 0.105, radius: 22, fill: '#082f49', stroke: '#0c4a6e', strokeWidth: 2, opacity: 0.88 })}
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.195}" font-size="${w * 0.023}" font-weight="900" fill="${palette.sky}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">FREE PLAN</text>
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.232}" font-size="${w * 0.032}" font-weight="850" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">25 daily practice questions</text>
    ${progressBar(cardX + cardW * 0.09, cy + h * 0.305, cardW * 0.82, 0.72, palette.orange)}
    <text x="${cardX + cardW * 0.09}" y="${cy + h * 0.35}" font-size="${w * 0.022}" font-weight="700" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Study streak: 7 days    Completed lessons: 6/10</text>
    ${button(cardX + cardW * 0.09, cy + h * 0.405, cardW * 0.82, btnH, 'Learn', 'url(#learnGrad)', 'Topic lessons and quick quizzes')}
    ${button(cardX + cardW * 0.09, cy + h * 0.505, cardW * 0.82, btnH, 'Study Mode', palette.emerald, 'Immediate answers and explanations')}
    ${button(cardX + cardW * 0.09, cy + h * 0.605, cardW * 0.82, btnH, 'Practice Exam', palette.blue, '35 questions - 74 percent to pass')}
    ${button(cardX + cardW * 0.09, cy + h * 0.705, cardW * 0.82, btnH, 'Review Due', palette.rose, '12 questions need review')}
    <defs>
      <linearGradient id="learnGrad" x1="0" x2="1"><stop offset="0" stop-color="${palette.violet}"/><stop offset="1" stop-color="#2563eb"/></linearGradient>
    </defs>
  `;
}

function renderLearnTopics(x, y, w, h) {
  const cardW = w * 0.9;
  const cardX = x + w * 0.05;
  let cy = y + h * 0.05;
  const rowH = h * 0.105;
  const visibleLessons = lessons.slice(0, 6);
  return `
    ${rect({ x: cardX, y: cy, width: cardW, height: h * 0.17, radius: 28, fill: palette.panel, stroke: palette.border, strokeWidth: 3 })}
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.065}" font-size="${w * 0.046}" font-weight="900" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Learn</text>
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.105}" font-size="${w * 0.024}" font-weight="600" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Ten lessons, about five minutes each</text>
    ${progressBar(cardX + cardW * 0.08, cy + h * 0.135, cardW * 0.68, 0.6, palette.emerald)}
    <text x="${cardX + cardW * 0.81}" y="${cy + h * 0.145}" font-size="${w * 0.022}" font-weight="800" fill="${palette.muted}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">6/10</text>
    ${visibleLessons.map((lesson, index) => {
      const top = cy + h * 0.21 + index * rowH;
      const complete = index < 3;
      const accuracy = [88, 82, 76, 69, 64, 91][index];
      return `
        ${rect({ x: cardX, y: top, width: cardW, height: rowH * 0.86, radius: 22, fill: index === 3 ? '#122038' : palette.panel, stroke: index === 3 ? '#2563eb' : palette.border, strokeWidth: 2 })}
        <text x="${cardX + cardW * 0.08}" y="${top + rowH * 0.37}" font-size="${w * 0.026}" font-weight="900" fill="${palette.sky}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(lesson.id)}</text>
        <text x="${cardX + cardW * 0.18}" y="${top + rowH * 0.34}" font-size="${w * 0.027}" font-weight="850" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(lesson.title)}</text>
        <text x="${cardX + cardW * 0.18}" y="${top + rowH * 0.59}" font-size="${w * 0.019}" font-weight="600" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(lesson.subtitle)}</text>
        ${pill(cardX + cardW * 0.7, top + rowH * 0.22, complete ? 'Completed' : `${accuracy}%`, complete ? '#064e3b' : '#451a03', complete ? '#86efac' : '#fbbf24', w * 0.018)}
      `;
    }).join('')}
  `;
}

function renderStudyExplanation(x, y, w, h) {
  const q = questions.find((item) => item.id === 'T1A01') ?? questions[0];
  const cardW = w * 0.9;
  const cardX = x + w * 0.05;
  const cy = y + h * 0.05;
  const optionH = h * 0.07;
  return `
    ${rect({ x: cardX, y: cy, width: cardW, height: h * 0.88, radius: 32, fill: palette.panel, stroke: palette.border, strokeWidth: 3 })}
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.06}" font-size="${w * 0.029}" font-weight="900" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">STUDY MODE</text>
    <text x="${cardX + cardW * 0.82}" y="${cy + h * 0.06}" font-size="${w * 0.028}" font-weight="800" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">1 / 409</text>
    ${progressBar(cardX + cardW * 0.08, cy + h * 0.09, cardW * 0.84, 0.18, palette.sky)}
    ${textBlock({ x: cardX + cardW * 0.08, y: cy + h * 0.18, width: cardW * 0.84, text: `[${q.id}] ${q.question}`, size: w * 0.034, color: '#ffffff', weight: 850, lineHeight: 1.16, maxLines: 4 })}
    ${q.options.map((option, index) => {
      const top = cy + h * 0.34 + index * (optionH + h * 0.016);
      const isCorrect = q.correctAnswer === String.fromCharCode(65 + index);
      return `
        ${rect({ x: cardX + cardW * 0.08, y: top, width: cardW * 0.84, height: optionH, radius: 18, fill: isCorrect ? '#047857' : '#111827', stroke: isCorrect ? palette.emerald : '#334155', strokeWidth: isCorrect ? 4 : 2 })}
        <text x="${cardX + cardW * 0.12}" y="${top + optionH * 0.58}" font-size="${w * 0.025}" font-weight="850" fill="${isCorrect ? '#ffffff' : palette.muted}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${String.fromCharCode(65 + index)}.</text>
        ${textBlock({ x: cardX + cardW * 0.2, y: top + optionH * 0.46, width: cardW * 0.66, text: option, size: w * 0.022, color: isCorrect ? '#ffffff' : palette.muted, weight: 700, lineHeight: 1.12, maxLines: 2 })}
      `;
    }).join('')}
    ${rect({ x: cardX + cardW * 0.08, y: cy + h * 0.71, width: cardW * 0.84, height: h * 0.13, radius: 20, fill: '#082f49', stroke: '#075985', strokeWidth: 2 })}
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.755}" font-size="${w * 0.023}" font-weight="900" fill="${palette.sky}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">EXPLANATION</text>
    ${textBlock({ x: cardX + cardW * 0.13, y: cy + h * 0.795, width: cardW * 0.74, text: q.explanation, size: w * 0.02, color: '#bfdbfe', weight: 600, lineHeight: 1.2, maxLines: 3 })}
  `;
}

function renderAnalytics(x, y, w, h) {
  const cardW = w * 0.9;
  const cardX = x + w * 0.05;
  const cy = y + h * 0.055;
  const rows = [
    ['T5', 'Electrical Principles', 61, palette.rose],
    ['T6', 'Electronic Components', 68, palette.amber],
    ['T1', 'FCC Rules', 84, palette.emerald],
    ['T9', 'Antennas and Feed Lines', 79, palette.emerald],
  ];
  return `
    ${rect({ x: cardX, y: cy, width: cardW, height: h * 0.88, radius: 32, fill: palette.panel, stroke: palette.border, strokeWidth: 3 })}
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.07}" font-size="${w * 0.048}" font-weight="900" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Analytics</text>
    ${rect({ x: cardX + cardW * 0.08, y: cy + h * 0.11, width: cardW * 0.84, height: h * 0.13, radius: 24, fill: '#102033', stroke: '#1e3a8a', strokeWidth: 2 })}
    <text x="${cardX + cardW * 0.14}" y="${cy + h * 0.165}" font-size="${w * 0.046}" font-weight="900" fill="${palette.sky}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">78%</text>
    <text x="${cardX + cardW * 0.14}" y="${cy + h * 0.2}" font-size="${w * 0.021}" font-weight="700" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Overall practice accuracy</text>
    <text x="${cardX + cardW * 0.53}" y="${cy + h * 0.165}" font-size="${w * 0.034}" font-weight="900" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">142 / 182</text>
    <text x="${cardX + cardW * 0.53}" y="${cy + h * 0.2}" font-size="${w * 0.021}" font-weight="700" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Correct answers</text>
    ${rect({ x: cardX + cardW * 0.08, y: cy + h * 0.285, width: cardW * 0.84, height: h * 0.2, radius: 24, fill: '#3f121d', stroke: '#881337', strokeWidth: 2, opacity: 0.95 })}
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.335}" font-size="${w * 0.028}" font-weight="900" fill="${palette.rose}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">WEAK AREAS - FOCUS HERE</text>
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.382}" font-size="${w * 0.026}" font-weight="800" fill="#fecdd3" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">T5 Electrical Principles</text>
    <text x="${cardX + cardW * 0.13}" y="${cy + h * 0.425}" font-size="${w * 0.026}" font-weight="800" fill="#fecdd3" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">T6 Electronic Components</text>
    ${rows.map((row, index) => {
      const top = cy + h * 0.535 + index * h * 0.075;
      return `
        <text x="${cardX + cardW * 0.08}" y="${top}" font-size="${w * 0.023}" font-weight="900" fill="${row[3]}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${row[0]}</text>
        <text x="${cardX + cardW * 0.17}" y="${top}" font-size="${w * 0.023}" font-weight="700" fill="${palette.muted}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(row[1])}</text>
        ${progressBar(cardX + cardW * 0.08, top + h * 0.02, cardW * 0.67, Number(row[2]) / 100, row[3])}
        <text x="${cardX + cardW * 0.8}" y="${top + h * 0.036}" font-size="${w * 0.023}" font-weight="900" fill="${row[3]}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${row[2]}%</text>
      `;
    }).join('')}
  `;
}

function renderReviewPremium(x, y, w, h) {
  const cardW = w * 0.9;
  const cardX = x + w * 0.05;
  const cy = y + h * 0.055;
  return `
    ${rect({ x: cardX, y: cy, width: cardW, height: h * 0.88, radius: 32, fill: palette.panel, stroke: palette.border, strokeWidth: 3 })}
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.075}" font-size="${w * 0.046}" font-weight="900" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Smart Review</text>
    ${rect({ x: cardX + cardW * 0.08, y: cy + h * 0.12, width: cardW * 0.84, height: h * 0.17, radius: 28, fill: '#4c1d95', stroke: '#7c3aed', strokeWidth: 2 })}
    <text x="${cardX + cardW * 0.14}" y="${cy + h * 0.185}" font-size="${w * 0.052}" font-weight="950" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">12</text>
    <text x="${cardX + cardW * 0.29}" y="${cy + h * 0.18}" font-size="${w * 0.03}" font-weight="900" fill="#ede9fe" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">questions due now</text>
    <text x="${cardX + cardW * 0.29}" y="${cy + h * 0.22}" font-size="${w * 0.021}" font-weight="700" fill="#ddd6fe" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">Missed questions return until mastered</text>
    ${progressBar(cardX + cardW * 0.08, cy + h * 0.34, cardW * 0.84, 0.42, palette.violet)}
    <text x="${cardX + cardW * 0.08}" y="${cy + h * 0.385}" font-size="${w * 0.022}" font-weight="800" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">168 mastered questions</text>
    ${[
      ['Unlimited practice', 'Study as long as you want, any day'],
      ['Bookmarks', 'Save hard questions for focused review'],
      ['Practice exams', 'Simulate the 35-question real test'],
      ['Achievements', 'Build streaks and track milestones'],
    ].map((item, index) => {
      const top = cy + h * 0.45 + index * h * 0.095;
      return `
        ${rect({ x: cardX + cardW * 0.08, y: top, width: cardW * 0.84, height: h * 0.072, radius: 18, fill: '#111827', stroke: '#334155', strokeWidth: 2 })}
        <circle cx="${cardX + cardW * 0.13}" cy="${top + h * 0.036}" r="${w * 0.018}" fill="${[palette.emerald, palette.amber, palette.sky, palette.orange][index]}"/>
        <text x="${cardX + cardW * 0.19}" y="${top + h * 0.03}" font-size="${w * 0.025}" font-weight="900" fill="#ffffff" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(item[0])}</text>
        <text x="${cardX + cardW * 0.19}" y="${top + h * 0.055}" font-size="${w * 0.019}" font-weight="650" fill="${palette.dim}" font-family="Avenir Next, Helvetica Neue, Arial, sans-serif">${esc(item[1])}</text>
      `;
    }).join('')}
  `;
}

for (const device of devices) {
  const deviceDir = path.join(outputRoot, device.key);
  await fs.mkdir(deviceDir, { recursive: true });

  for (const spec of screenSpecs) {
    const svg = screenshotSvg(device, spec);
    const outPath = path.join(deviceDir, spec.file);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`Wrote ${path.relative(repoRoot, outPath)} (${device.width}x${device.height})`);
  }
}
