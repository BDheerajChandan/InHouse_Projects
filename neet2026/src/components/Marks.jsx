import { useState } from "react";
import "./Marks.css";

const subjectColors = {
  Chemistry: "#ff6b2b",
  Biology: "#22c55e",
  Physics: "#3b82f6",
};

const initialMarks = {
  Chemistry: [],
  Biology: [],
  Physics: [],
};

export default function Marks() {
  const [marks, setMarks] = useState(initialMarks);
  const [form, setForm] = useState({ subject: "Chemistry", test: "", date: "", correct: "", wrong: "", total: "" });

  function addEntry() {
    const { subject, test, date, correct, wrong, total } = form;
    if (!test || !correct || !total) return;
    const c = parseInt(correct) || 0;
    const w = parseInt(wrong) || 0;
    const t = parseInt(total) || 100;
    const neet = c * 4 - w;
    const max = t * 4;
    setMarks(prev => ({
      ...prev,
      [subject]: [...prev[subject], { test, date: date || new Date().toLocaleDateString(), correct: c, wrong: w, total: t, neet, max, pct: Math.round((c / t) * 100) }]
    }));
    setForm({ subject: form.subject, test: "", date: "", correct: "", wrong: "", total: "" });
  }

  function deleteEntry(subj, idx) {
    setMarks(prev => ({ ...prev, [subj]: prev[subj].filter((_, i) => i !== idx) }));
  }

  const totalNeet = Object.values(marks).flat().reduce((a, m) => a + m.neet, 0);
  const allEntries = Object.entries(marks).flatMap(([s, arr]) => arr.map(m => ({ ...m, subject: s })));

  return (
    <div className="marks-page">
      <h2 className="section-title">📊 My Marks Tracker</h2>

      {/* Overall Stats */}
      <div className="marks-overview">
        {Object.entries(marks).map(([s, arr]) => {
          const avg = arr.length ? Math.round(arr.reduce((a, m) => a + m.pct, 0) / arr.length) : 0;
          const latestNeet = arr.length ? arr[arr.length - 1].neet : 0;
          return (
            <div key={s} className="marks-subject-card" style={{ "--c": subjectColors[s] }}>
              <div className="msc-header">
                <span className="msc-icon">{s === "Chemistry" ? "⚗️" : s === "Biology" ? "🧬" : "⚡"}</span>
                <span className="msc-name">{s}</span>
                <span className="msc-count">{arr.length} tests</span>
              </div>
              <div className="msc-avg" style={{ color: subjectColors[s] }}>{avg}%</div>
              <div className="msc-label">Average Accuracy</div>
              <div className="progress-bar-track" style={{ margin: "0.5rem 0" }}>
                <div className="progress-bar-fill" style={{ width: `${avg}%`, background: subjectColors[s] }}></div>
              </div>
              <div className="msc-neet">Latest NEET Score: <strong style={{ color: subjectColors[s] }}>{latestNeet}</strong></div>
            </div>
          );
        })}
      </div>

      {/* Add Entry Form */}
      <div className="marks-form-card">
        <div className="form-title">➕ Add Test Result</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Subject</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
              {Object.keys(marks).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Test Name</label>
            <input value={form.test} onChange={e => setForm(f => ({ ...f, test: e.target.value }))} placeholder="e.g. Week 1 Mock" />
          </div>
          <div className="form-field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Total Questions</label>
            <input type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} placeholder="100" />
          </div>
          <div className="form-field">
            <label>Correct Answers</label>
            <input type="number" value={form.correct} onChange={e => setForm(f => ({ ...f, correct: e.target.value }))} placeholder="72" />
          </div>
          <div className="form-field">
            <label>Wrong Answers</label>
            <input type="number" value={form.wrong} onChange={e => setForm(f => ({ ...f, wrong: e.target.value }))} placeholder="15" />
          </div>
        </div>

        {form.correct && form.total && (
          <div className="form-preview">
            NEET Score Preview: <strong style={{ color: "#22c55e" }}>+{parseInt(form.correct || 0) * 4}</strong> – <strong style={{ color: "#ef4444" }}>{parseInt(form.wrong || 0)}</strong> = <strong style={{ color: subjectColors[form.subject] }}>{parseInt(form.correct || 0) * 4 - parseInt(form.wrong || 0)} marks</strong>
            &nbsp;· Accuracy: <strong>{Math.round((parseInt(form.correct || 0) / parseInt(form.total || 1)) * 100)}%</strong>
          </div>
        )}

        <button className="add-entry-btn" onClick={addEntry}>✅ Save Result</button>
      </div>

      {/* Tables per subject */}
      {Object.entries(marks).map(([s, arr]) => arr.length > 0 && (
        <div key={s} className="marks-table-card">
          <div className="marks-table-header" style={{ color: subjectColors[s] }}>
            {s === "Chemistry" ? "⚗️" : s === "Biology" ? "🧬" : "⚡"} {s} Results
          </div>
          <div className="marks-table">
            <div className="mt-row mt-head">
              <span>Test</span><span>Date</span><span>Score</span><span>Accuracy</span><span>NEET Marks</span><span></span>
            </div>
            {arr.map((m, i) => (
              <div key={i} className="mt-row">
                <span className="mt-test">{m.test}</span>
                <span className="mt-date">{m.date}</span>
                <span className="mt-score">{m.correct}/{m.total}</span>
                <span className="mt-pct" style={{ color: m.pct >= 70 ? "#22c55e" : m.pct >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {m.pct}%
                </span>
                <span className="mt-neet" style={{ color: subjectColors[s] }}>{m.neet > 0 ? `+${m.neet}` : m.neet}</span>
                <button className="mt-del" onClick={() => deleteEntry(s, i)}>✕</button>
              </div>
            ))}
          </div>
          {arr.length > 1 && (
            <div className="marks-trend">
              📈 Avg accuracy: {Math.round(arr.reduce((a, m) => a + m.pct, 0) / arr.length)}% ·
              Best: {Math.max(...arr.map(m => m.pct))}% ·
              Latest NEET: {arr[arr.length - 1].neet}
            </div>
          )}
        </div>
      ))}

      {allEntries.length === 0 && (
        <div className="marks-empty">
          <div style={{ fontSize: "3rem" }}>📋</div>
          <div>No test results yet. Take a quiz or add your mock test results above!</div>
        </div>
      )}
    </div>
  );
}