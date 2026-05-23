// src/components/Projects.jsx
import projectsData from "../Config/projects_links.json";

export default function Projects() {
  const entries = Object.entries(projectsData);
  if (!entries.length) return null;

  return (
    <section className="resume-section" aria-label="Projects">
      <h2 className="section-title">Projects</h2>

      {entries.map(([key, project]) => (
        <article key={key} className="entry-block">
          <div className="entry-header">
            <span className="key-text">{project["Title"]}</span>
            {project["Year"] && (
              <>
                <span className="separator"> | </span>
                <span className="value-text">{project["Year"]}</span>
              </>
            )}
          </div>

          {project["Link"] && (
            <div>
              <a
                href={project["Link"]}
                target="_blank"
                rel="noopener noreferrer"
                className="link-text"
              >
                {project["Link"]}
              </a>
            </div>
          )}

          {project["Description"] && (
            <p className="value-text" style={{ marginTop: "2px" }}>
              {project["Description"]}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}