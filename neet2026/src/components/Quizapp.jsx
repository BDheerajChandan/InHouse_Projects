// Quizapp.jsx

import { useState } from "react";
import { allSubjects } from "./questionsData";
import "./QuizApp.css";

const subjectColors = {
  Chemistry: "#ff6b2b",
  Biology: "#22c55e",
  Physics: "#3b82f6",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizApp() {
  const [subject, setSubject] = useState("Chemistry");
  const [topic, setTopic] = useState("All");
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [answered, setAnswered] = useState(0);
  const [wrongRetry, setWrongRetry] = useState(false);
  const [history, setHistory] = useState([]);

  const subjectData = allSubjects[subject];
  const topics = ["All", ...new Set(subjectData.questions.map(q => q.topic))];

  function startQuiz(mode = "full") {
    let qs;
    if (mode === "wrong") {
      qs = shuffle(wrong);
    } else {
      qs = topic === "All" ? subjectData.questions : subjectData.questions.filter(q => q.topic === topic);
      qs = shuffle(qs);
    }
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setRevealed(false);
    setCorrect(0);
    setWrong([]);
    setAnswered(0);
    setQuizStarted(true);
    setQuizDone(false);
    setWrongRetry(mode === "wrong");
  }

  function handleAnswer(idx) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === questions[currentQ].ans;
    setAnswered(a => a + 1);
    if (isCorrect) setCorrect(c => c + 1);
    else setWrong(w => [...w, questions[currentQ]]);
  }

  function nextQ() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const score = correct + (selected === questions[currentQ].ans ? 0 : 0);
      const finalCorrect = correct + (revealed && selected === questions[currentQ].ans ? 0 : 0);
      setHistory(h => [...h, {
        subject, topic, total: questions.length,
        correct: finalCorrect + (revealed && selected === questions[currentQ].ans ? 1 : 0),
        date: new Date().toLocaleDateString()
      }]);
      setQuizDone(true);
    }
  }

  function backToSetup() {
    setQuizStarted(false);
    setQuizDone(false);
    setWrongRetry(false);
  }

  const q = questions[currentQ];
  const neetScore = correct * 4 - (answered - correct);
  const maxNeetScore = questions.length * 4;
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <div className="quiz-app">
      {!quizStarted ? (
        <div className="quiz-setup">
          {/* Subject Selector */}
          <div className="setup-section">
            <div className="setup-label">Select Subject</div>
            <div className="setup-subjects">
              {Object.entries(allSubjects).map(([s, data]) => (
                <button
                  key={s}
                  className={`setup-subject-btn ${subject === s ? "active" : ""}`}
                  style={{ "--c": subjectColors[s] }}
                  onClick={() => { setSubject(s); setTopic("All"); }}
                >
                  <span className="ssb-icon">{data.icon}</span>
                  <span className="ssb-name">{s}</span>
                  <span className="ssb-count">{data.questions.length} Questions</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selector */}
          <div className="setup-section">
            <div className="setup-label">Filter by Topic</div>
            <div className="topic-chips">
              {topics.map(t => (
                <button
                  key={t}
                  className={`topic-chip ${topic === t ? "active" : ""}`}
                  style={{ "--c": subjectColors[subject] }}
                  onClick={() => setTopic(t)}
                >
                  {t}
                  <span className="topic-chip-count">
                    {t === "All" ? allSubjects[subject].questions.length
                      : allSubjects[subject].questions.filter(q => q.topic === t).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="setup-stats">
            {["Chemistry", "Biology", "Physics"].map(s => (
              <div key={s} className="setup-stat" style={{ "--c": subjectColors[s] }}>
                <div className="setup-stat-icon">{allSubjects[s].icon}</div>
                <div className="setup-stat-num">{allSubjects[s].questions.length}</div>
                <div className="setup-stat-label">{s}</div>
              </div>
            ))}
            <div className="setup-stat" style={{ "--c": "#a855f7" }}>
              <div className="setup-stat-icon">📝</div>
              <div className="setup-stat-num">300</div>
              <div className="setup-stat-label">Total MCQs</div>
            </div>
          </div>

          <button className="start-quiz-btn" style={{ background: subjectColors[subject] }} onClick={() => startQuiz("full")}>
            🚀 Start Quiz — {topic === "All" ? allSubjects[subject].questions.length : allSubjects[subject].questions.filter(q => q.topic === topic).length} Questions
          </button>

          {/* Session History */}
          {history.length > 0 && (
            <div className="history-section">
              <div className="setup-label">📊 Recent Sessions</div>
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="history-item">
                  <span>{h.subject} · {h.topic}</span>
                  <span style={{ color: subjectColors[h.subject] }}>{h.correct}/{h.total}</span>
                  <span style={{ color: "#22c55e" }}>+{h.correct * 4 - (h.total - h.correct)}</span>
                  <span style={{ color: "var(--text3)" }}>{h.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : quizDone ? (
        <div className="quiz-results">
          <div className="result-emoji">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}</div>
          <h2 className="result-title">{subject} · {wrongRetry ? "Wrong Qs Retry" : topic}</h2>

          <div className="result-score" style={{ color: subjectColors[subject] }}>
            {correct} / {questions.length}
          </div>
          <div className="result-pct">{pct}% Accuracy</div>

          <div className="result-neet">
            NEET Score: <span className="neet-green">+{correct * 4}</span> – <span className="neet-red">{questions.length - correct}</span> = <strong style={{ color: subjectColors[subject] }}>{neetScore} marks</strong>
            <span style={{ color: "var(--text3)" }}> (out of {maxNeetScore})</span>
          </div>

          <div className="result-cards">
            <div className="result-card correct-card">
              <div className="rc-num">{correct}</div>
              <div className="rc-label">Correct</div>
            </div>
            <div className="result-card wrong-card">
              <div className="rc-num">{questions.length - correct}</div>
              <div className="rc-label">Wrong</div>
            </div>
            <div className="result-card score-card">
              <div className="rc-num">{neetScore}</div>
              <div className="rc-label">NEET Marks</div>
            </div>
            <div className="result-card level-card">
              <div className="rc-num">{pct >= 80 ? "A" : pct >= 60 ? "B" : "C"}</div>
              <div className="rc-label">{pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : "Revise"}</div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-ghost" onClick={backToSetup}>🔄 New Quiz</button>
            <button className="btn btn-primary" onClick={() => startQuiz("full")}>🔁 Retry Same</button>
            {wrong.length > 0 && (
              <button className="btn" style={{ background: "#ef4444", color: "white" }} onClick={() => startQuiz("wrong")}>
                ❌ Practice Wrong ({wrong.length})
              </button>
            )}
          </div>
        </div>

      ) : q ? (
        <div className="quiz-active">
          {/* Progress Bar */}
          <div className="quiz-topbar">
            <div className="quiz-progress-info">
              <span>{allSubjects[subject].icon} {subject} · {q.topic}</span>
              <span>{currentQ + 1} / {questions.length}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill"
                style={{ width: `${(currentQ / questions.length) * 100}%`, background: subjectColors[subject] }}>
              </div>
            </div>
            <div className="quiz-score-row">
              <span className="qs-correct">✅ {correct}</span>
              <span className="qs-wrong">❌ {answered - correct}</span>
              <span className="qs-neet" style={{ color: subjectColors[subject] }}>
                NEET: {correct * 4 - (answered - correct)}
              </span>
              <button className="quiz-quit" onClick={backToSetup}>✕ Quit</button>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card" style={{ borderLeft: `4px solid ${subjectColors[subject]}` }}>
            <div className="question-meta">
              <span className="topic-chip-q" style={{ background: subjectColors[subject] + "30", color: subjectColors[subject] }}>
                {q.topic}
              </span>
              <span className="q-id">Q{q.id}</span>
            </div>
            <p className="question-text">{q.q}</p>
          </div>

          {/* Options */}
          <div className="options-list">
            {q.options.map((opt, i) => {
              let cls = "option-btn";
              if (revealed) {
                if (i === q.ans) cls += " correct";
                else if (i === selected) cls += " wrong";
                else cls += " dim";
              } else if (selected === i) cls += " selected";
              return (
                <button
                  key={i}
                  className={cls}
                  style={{ "--c": subjectColors[subject] }}
                  onClick={() => handleAnswer(i)}
                >
                  <span className="option-letter">{["A", "B", "C", "D"][i]}</span>
                  <span className="option-text">{opt}</span>
                  {revealed && i === q.ans && <span className="option-icon">✅</span>}
                  {revealed && i === selected && i !== q.ans && <span className="option-icon">❌</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="explanation-box">
              <span className="exp-label">💡 Explanation</span>
              <p>{q.exp}</p>
            </div>
          )}

          {/* Next Button */}
          {revealed && (
            <button
              className="next-btn"
              style={{ background: subjectColors[subject] }}
              onClick={nextQ}
            >
              {currentQ < questions.length - 1 ? "Next Question →" : "🏁 View Results"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}