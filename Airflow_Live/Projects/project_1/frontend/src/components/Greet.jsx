// Projects/project_1/frontend/src/components/Greet.jsx
import React, { useState, useEffect } from "react";
// import { getConfig } from "../../../services/config.js";
import { getConfig } from "../../services/config.js";
import "./Greet.css";

function Greet() {
  const [welcome,  setWelcome]  = useState("");
  const [greeting, setGreeting] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { apiBase } = await getConfig();

        const [rootRes, greetRes] = await Promise.all([
          fetch(`${apiBase}/`),
          fetch(`${apiBase}/greet`),
        ]);

        const rootData  = await rootRes.json();
        const greetData = await greetRes.json();

        setWelcome(rootData.message);
        setGreeting(greetData.message);
      } catch (err) {
        setError("Could not reach the backend. Is it running?");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <div className="greet-state">Loading...</div>;
  if (error)   return <div className="greet-state greet-error">{error}</div>;

  return (
    <div className="greet-card">
      <div className="greet-badge">Project Alpha</div>
      <h1 className="greet-welcome">{welcome}</h1>
      <p  className="greet-message">{greeting}</p>
      <div className="greet-dot" />
    </div>
  );
}

export default Greet;