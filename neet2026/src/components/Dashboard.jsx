import { useState, useEffect } from "react";
import "./Dashboard.css";

const today = new Date();
const examDate = new Date("2026-05-05");
const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

const subjects = [
  { name: "Chemistry", icon: "⚗️", color: "#ff6b2b", topics: ["Resonance", "Inorganic", "Orbital Splitting", "Physical Chemistry"], target: 180, progress: 45 },
  { name: "Biology", icon: "🧬", color: "#22c55e", topics: ["Cell Biology", "Genetics", "Plant Biology", "Human Physiology", "Ecology"], target: 360, progress: 30 },
  { name: "Physics", icon: "⚡", color: "#3b82f6", topics: ["Mechanics", "Optics", "Modern Physics", "Electromagnetism"], target: 180, progress: 25 },
];

const tips = [
  "Biology has ~50% weightage in NEET. Prioritize it every day.",
  "Solve previous year papers after each chapter finish.",
  "Make short notes/flashcards for every reaction and formula.",
  "10 hours daily = 300 hours in 1 month. Use them wisely!",
  "Attempt at least 50 MCQs per day to build speed.",
  "Diagrams are frequently asked in NEET – practice drawing them.",
];

export default function Dashboard({ setActiveTab }) {
  const [tipIdx, setTipIdx] = useState(0);
  const [studyToday, setStudyToday] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 4000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const hoursToday = (timer / 3600).toFixed(1);

  return (
    <div className="dashboard">
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-left">
          <div className="hero-title">
            <span>🎯</span>
            <div>
              <h1>NEET 2026 Preparation</h1>
              <p>Month 1: Full Syllabus Coverage @ 10 hrs/day</p>
            </div>
          </div>
          <div className="countdown-grid">
            <div className="countdown-card">
              <div className="countdown-num" style={{ color: "#ff6b2b" }}>{daysLeft}</div>
              <div className="countdown-label">Days to NEET</div>
            </div>
            <div className="countdown-card">
              <div className="countdown-num" style={{ color: "#22c55e" }}>28</div>
              <div className="countdown-label">Days Plan</div>
            </div>
            <div className="countdown-card">
              <div className="countdown-num" style={{ color: "#3b82f6" }}>300</div>
              <div className="countdown-label">Target Hours</div>
            </div>
            <div className="countdown-card">
              <div className="countdown-num" style={{ color: "#a855f7" }}>300</div>
              <div className="countdown-label">Total MCQs</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          {/* Study Timer */}
          <div className="study-timer">
            <div className="timer-label">Today's Study Timer</div>
            <div className="timer-display">{formatTime(timer)}</div>
            <div className="timer-hours">{hoursToday} / 10 hours</div>
            <div className="timer-bar-track">
              <div className="timer-bar-fill" style={{ width: `${Math.min(100, (timer / 36000) * 100)}%` }}></div>
            </div>
            <div className="timer-buttons">
              <button className={`timer-btn ${running ? "stop" : "start"}`} onClick={() => setRunning(r => !r)}>
                {running ? "⏸ Pause" : "▶ Start"}
              </button>
              <button className="timer-btn reset" onClick={() => { setTimer(0); setRunning(false); }}>↺ Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <div className="tip-banner">
        <span className="tip-icon">💡</span>
        <span className="tip-text">{tips[tipIdx]}</span>
      </div>

      {/* Subject Cards */}
      <div className="subjects-section">
        <h2 className="section-title">📚 Subject Overview</h2>
        <div className="subjects-grid">
          {subjects.map(s => (
            <div className="subject-card" key={s.name} style={{ "--accent": s.color }}>
              <div className="subject-header">
                <span className="subject-icon">{s.icon}</span>
                <div>
                  <div className="subject-name">{s.name}</div>
                  <div className="subject-target">{s.target} hrs target</div>
                </div>
                <div className="subject-pct" style={{ color: s.color }}>{s.progress}%</div>
              </div>
              <div className="progress-bar-track" style={{ marginBottom: "0.75rem" }}>
                <div className="progress-bar-fill" style={{ width: `${s.progress}%`, background: s.color }}></div>
              </div>
              <div className="subject-topics">
                {s.topics.map(t => <span key={t} className="topic-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEET Pattern */}
      <div className="neet-pattern">
        <h2 className="section-title">📋 NEET 2026 Pattern</h2>
        <div className="pattern-grid">
          {[
            { label: "Physics", qs: "45", marks: "180", pct: "25%", color: "#3b82f6" },
            { label: "Chemistry", qs: "45", marks: "180", pct: "25%", color: "#ff6b2b" },
            { label: "Biology (Bot+Zoo)", qs: "90", marks: "360", pct: "50%", color: "#22c55e" },
          ].map(p => (
            <div className="pattern-card" key={p.label} style={{ "--c": p.color }}>
              <div className="pattern-pct" style={{ color: p.color }}>{p.pct}</div>
              <div className="pattern-label">{p.label}</div>
              <div className="pattern-info">{p.qs} Questions · {p.marks} Marks</div>
            </div>
          ))}
        </div>
        <div className="marking-info">
          <span className="mark-item correct">✅ Correct: +4 marks</span>
          <span className="mark-item wrong">❌ Wrong: –1 mark</span>
          <span className="mark-item skip">⬜ Unanswered: 0 marks</span>
          <span className="mark-item total">🎯 Total: 720 marks</span>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="quick-nav">
        <h2 className="section-title">🚀 Quick Access</h2>
        <div className="quick-grid">
          {[
            { icon: "📅", label: "Study Plan", sub: "28-day schedule", tab: "plan", color: "#ff6b2b" },
            { icon: "🧠", label: "MCQ Quiz", sub: "300 questions", tab: "quiz", color: "#3b82f6" },
            { icon: "📊", label: "My Marks", sub: "Track progress", tab: "marks", color: "#22c55e" },
            { icon: "💡", label: "Quick Tips", sub: "NEET strategy", tab: "tips", color: "#a855f7" },
          ].map(n => (
            <button key={n.tab} className="quick-btn" style={{ "--c": n.color }} onClick={() => setActiveTab(n.tab)}>
              <span className="quick-icon">{n.icon}</span>
              <span className="quick-label">{n.label}</span>
              <span className="quick-sub">{n.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}