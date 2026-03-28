// App.jsx

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import StudyPlan from "./components/StudyPlan";
import QuizApp from "./components/QuizApp";
import Tips from "./components/Tips";
import Marks from "./components/Marks";
import "../src/App.css"

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "plan", label: "Study Plan", icon: "📅" },
    { key: "quiz", label: "MCQ Quiz", icon: "🧠" },
    { key: "marks", label: "My Marks", icon: "📊" },
    { key: "tips", label: "Quick Tips", icon: "💡" },
  ];

  return (
    <div className="app-root">
      {/* Top Nav */}
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="brand-icon">⚗️</span>
          <div>
            <span className="brand-title">NEET 2026</span>
            <span className="brand-sub">Chemistry · Biology · Physics</span>
          </div>
        </div>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`nav-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-badge">NEET 2026 • 2 Months Left</div>
      </nav>

      {/* Content */}
      <main className="main-content">
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === "plan" && <StudyPlan />}
        {activeTab === "quiz" && <QuizApp />}
        {activeTab === "marks" && <Marks />}
        {activeTab === "tips" && <Tips />}
      </main>
    </div>
  );
}