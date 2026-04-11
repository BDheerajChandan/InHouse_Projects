// Projects/project_1/frontend/src/App.jsx
// NOTE: React components MUST start with uppercase — <Greet /> not <greet />
import React from 'react';
import Greet from './components/Greet.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Greet />
    </div>
  );
}

export default App;