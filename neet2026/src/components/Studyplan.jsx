// Studyplan.jsx

import { useState } from "react";
import { studyPlanData } from "./studyPlanData";
import "./StudyPlan.css";

const subjectColors = {
  Chemistry: "#ff6b2b",
  Biology: "#22c55e",
  Physics: "#3b82f6",
};

export default function StudyPlan() {
  const [activeSubject, setActiveSubject] = useState("Chemistry");
  const [expandedDay, setExpandedDay] = useState(null);
  const [checkedDays, setCheckedDays] = useState({});

  const plan = studyPlanData[activeSubject];
  const totalDays = plan.weeks.reduce((a, w) => a + w.days.length, 0);
  const completedDays = Object.keys(checkedDays).filter(k => k.startsWith(activeSubject) && checkedDays[k]).length;

  const toggleDay = (key) => setCheckedDays(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="study-plan">
      {/* Subject Tabs */}
      <div className="plan-subject-tabs">
        {Object.entries(studyPlanData).map(([subj, data]) => (
          <button
            key={subj}
            className={`plan-subj-tab ${activeSubject === subj ? "active" : ""}`}
            style={{ "--c": subjectColors[subj] }}
            onClick={() => setActiveSubject(subj)}
          >
            <span>{data.icon}</span>
            <span>{subj}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="plan-progress-card">
        <div className="plan-progress-header">
          <span>{plan.icon} {activeSubject} – 28-Day Plan</span>
          <span className="plan-progress-pct" style={{ color: subjectColors[activeSubject] }}>
            {completedDays}/{totalDays} days
          </span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${(completedDays / totalDays) * 100}%`, background: subjectColors[activeSubject] }}></div>
        </div>
        <div className="plan-stats">
          <span>📅 {totalDays} Study Days</span>
          <span>⏱️ 10 hrs/day = 280 hrs total</span>
          <span>📝 28 day revision each week</span>
          <span>🎯 100 MCQs per subject</span>
        </div>
      </div>

      {/* Weekly Plan */}
      {plan.weeks.map(week => (
        <div key={week.week} className="plan-week">
          <div className="week-header">
            <div className="week-badge" style={{ background: subjectColors[activeSubject] }}>W{week.week}</div>
            <div>
              <div className="week-title">Week {week.week}: {week.title}</div>
              <div className="week-sub">Days {week.days[0].day}–{week.days[week.days.length - 1].day} · 10 hours/day</div>
            </div>
          </div>

          <div className="week-days">
            {week.days.map(day => {
              const key = `${activeSubject}-D${day.day}`;
              const done = checkedDays[key] || false;
              const expanded = expandedDay === key;

              return (
                <div key={day.day} className={`day-card ${done ? "done" : ""}`} style={{ "--c": subjectColors[activeSubject] }}>
                  <div className="day-header" onClick={() => setExpandedDay(expanded ? null : key)}>
                    <div className="day-info">
                      <div className="day-num" style={{ background: subjectColors[activeSubject] }}>D{day.day}</div>
                      <div>
                        <div className="day-topic">{day.topic}</div>
                        <div className="day-meta">{day.hours} hrs · {day.subtopics.length} topics</div>
                      </div>
                    </div>
                    <div className="day-actions">
                      <button
                        className={`day-check ${done ? "checked" : ""}`}
                        style={{ "--c": subjectColors[activeSubject] }}
                        onClick={(e) => { e.stopPropagation(); toggleDay(key); }}
                        title={done ? "Mark incomplete" : "Mark complete"}
                      >
                        {done ? "✅" : "☐"}
                      </button>
                      <span className="day-expand">{expanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expanded && (
                    <div className="day-body">
                      <div className="subtopics-grid">
                        {day.subtopics.map((s, i) => (
                          <div key={i} className="subtopic-item">
                            <span style={{ color: subjectColors[activeSubject] }}>→</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                      <div className="day-tip">
                        💡 Study tip: Spend first 7 hrs on new content, 2 hrs on MCQ practice, 1 hr on revision of the day's concepts.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}