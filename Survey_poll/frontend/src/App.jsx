// ============================================
// FILE: src/App.jsx (UPDATED)
// ============================================
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PollCreator from './components/PollCreator';
import PollVote from './components/PollVote';
// import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PollCreator />} />
          <Route path="/poll/:pollId" element={<PollVote />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
