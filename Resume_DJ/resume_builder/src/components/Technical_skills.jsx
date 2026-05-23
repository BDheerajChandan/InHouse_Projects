// src/components/Technical_skills.jsx
import skillsData from "../Config/technical_skills.json";

export default function TechnicalSkills() {
  const entries = Object.entries(skillsData);
  if (!entries.length) return null;

  return (
    <section className="resume-section" aria-label="Technical Skills">
      <h2 className="section-title">Technical Skills</h2>

      {entries.map(([category, skills]) => (
        <div key={category} className="entry-meta skill-row">
          <span className="key-text">{category}: </span>
          <span className="value-text">
            {Array.isArray(skills) ? skills.join(", ") : skills}
          </span>
        </div>
      ))}
    </section>
  );
}