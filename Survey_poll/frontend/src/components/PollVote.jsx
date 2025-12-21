// ============================================
// FILE: src/components/PollVote.jsx
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  User,
  Share2,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { pollAPI } from '../services/api';
import AuthModal from './AuthModal';
import '../assets/poll_system.css';

const PollVote = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  const [pollData, setPollData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [voterName, setVoterName] = useState('');
  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [copied, setCopied] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);


  useEffect(() => {
    checkBackend();
  }, []);

  // useEffect(() => {
  //   if (pollId && backendConnected) {
  //     fetchPoll();
  //     fetchResults();

  //     pollingRef.current = setInterval(() => {
  //       fetchResults();
  //     }, 3000);

  //     return () => {
  //       if (pollingRef.current) {
  //         clearInterval(pollingRef.current);
  //       }
  //     };
  //   }
  // }, [pollId, backendConnected]);

  useEffect(() => {
    if (!pollId || !backendConnected) return;

    // First fetch
    fetchPoll();
    fetchResults();

    // Start auto polling
    pollingRef.current = setInterval(() => {
      fetchResults();
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

  }, [pollId, backendConnected]);


  const checkBackend = async () => {
    try {
      await pollAPI.testConnection();
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  };

  // const fetchPoll = async () => {
  //   try {
  //     const data = await pollAPI.getPoll(pollId);
  //     setPollData(data);
  //   } catch (error) {
  //     console.error('Error fetching poll:', error);
  //     setMessageType('error');
  //     setMessage('Poll not found');
  //   }
  // };

  const fetchPoll = async () => {
    try {
      const data = await pollAPI.getPoll(pollId);
      setPollData(data);
    } catch (error) {

      if (error.response?.status === 404) {
        console.warn("Poll deleted or not found. Redirecting...");

        // Stop live polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        // Show user-friendly message
        setMessageType("error");
        setMessage("This poll no longer exists.");

        // Redirect gracefully
        setTimeout(() => navigate("/"), 1500);
        return;
      }

      console.error("Error fetching poll:", error);
    }
  };

  // const fetchResults = async () => {
  //   try {
  //     const data = await pollAPI.getResults(pollId);
  //     setResults(data);
  //     setLastUpdate(new Date());
  //   } catch (error) {
  //     console.error('Error fetching results:', error);
  //   }
  // };

  const fetchResults = async () => {
    try {
      const data = await pollAPI.getResults(pollId);
      setResults(data);
      setLastUpdate(new Date());
    } catch (error) {
      // Handle only AFTER delete
      if (error.response?.status === 404) {
        console.warn("Poll deleted, stopping live updates.");

        // Stop polling to prevent repeated errors
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        // Optional: redirect user gracefully
        setTimeout(() => navigate("/"), 1500);

        return; // Prevent further updates
      }

      console.error("Error fetching results:", error);
    }
  };


  const handleSelectChoice = (questionIndex, choiceIndex) => {
    setAnswers({ ...answers, [questionIndex]: choiceIndex });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!voterName.trim()) {
      setMessageType('error');
      setMessage('Please enter your name');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (Object.keys(answers).length !== pollData.questions.length) {
      setMessageType('error');
      setMessage('Please answer all questions');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);

      await pollAPI.submitResponse(pollId, {
        voter_name: voterName.trim(),
        answers
      });

      setMessageType('success');
      setMessage('Response submitted successfully!');
      setTimeout(() => setMessage(''), 3000);

      setVoterName('');
      setAnswers({});
      fetchResults();
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.detail || 'Failed to submit response');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetResults = async () => {
    try {
      await pollAPI.deleteResponses(pollId);
      setMessageType("success");
      setMessage("All responses reset");
      fetchResults();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessageType("error");
      setMessage("Failed to reset results");
    }
  };


  // const handleDelete = async () => {
  //   try {
  //     await pollAPI.deletePoll(pollId);
  //     setMessageType('success');
  //     setMessage('Poll deleted successfully');
  //     setTimeout(() => navigate('/'), 2000);
  //   } catch (error) {
  //     setMessageType('error');
  //     setMessage('Failed to delete poll');
  //   }
  // };
  const handleDelete = async () => {
    try {
      await pollAPI.deletePoll(pollId);

      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setMessageType("success");
      setMessage("Poll deleted successfully");

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessageType("error");
      setMessage("Failed to delete poll");
    }
  };


  const getUpdateTime = () => {
    if (!lastUpdate) return '';
    const sec = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (sec < 5) return 'Just now';
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)}m ago`;
  };

  if (!pollData) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner" />
          <p className="loading-text">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-vote-page" >
      <div className="container">
        {/* Header */}
        <div className="poll-vote-header">
          <h1 className="poll-title">
            {pollData.poll_title}
          </h1>
          <p className="poll-creator-name">Created by {pollData.creator_name}</p>

          <div className="status-badges-container">
            <div className={`status-badge ${backendConnected ? 'connected' : 'disconnected'}`}>
              {backendConnected ? (
                <>
                  <Wifi className="status-icon" /> Connected
                </>
              ) : (
                <>
                  <WifiOff className="status-icon" /> Disconnected
                </>
              )}
            </div>

            {results && (
              <div className="status-badge live">
                🔵 Live • {getUpdateTime()}
              </div>
            )}
          </div>

          <button onClick={copyLink} className="share-btn">
            {copied ? (
              <>
                <CheckCircle className="status-icon" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="status-icon" /> Share Poll
              </>
            )}
          </button>
        </div>

        <div className="poll-grid">
          {/* Vote Form */}
          <div className="vote-form-card">
            <h2 className="vote-form-title">Cast Your Vote</h2>

            {!backendConnected && (
              <div className="alert-box error">
                <AlertCircle className="alert-icon" />
                <span>Backend disconnected</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="vote-questions">
              <div className="form-section">
                <label className="form-label">
                  <User className="label-icon" />
                  Your Name
                </label>
                <input
                  required
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={loading || !backendConnected}
                  className="form-input"
                />
              </div>

              {pollData.questions.map((question, qIdx) => (
                <div key={qIdx} className="vote-question-box">
                  <p className="vote-question-text">
                    {qIdx + 1}. {question.question_text}
                  </p>
                  <div className="vote-choices-list">
                    {question.choices.map((choice, cIdx) => (
                      <label
                        key={cIdx}
                        className={`vote-choice-label ${answers[qIdx] === cIdx ? 'selected' : ''
                          }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          checked={answers[qIdx] === cIdx}
                          onChange={() => handleSelectChoice(qIdx, cIdx)}
                          disabled={loading || !backendConnected}
                          className="vote-choice-input"
                        />
                        {choice.choice_text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading || !backendConnected}
                className="submit-vote-btn"
              >
                {loading ? 'Submitting...' : 'Submit Response'}
              </button>
            </form>

            {message && (
              <div className={`message-notification ${messageType}`}>
                {messageType === 'success' ? (
                  <CheckCircle className="message-icon" />
                ) : (
                  <XCircle className="message-icon" />
                )}
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="results-card">
              <div className="results-header" >
                <h2 className="results-title">
                  <TrendingUp style={{ width: '1.5rem', height: '1.5rem' }} />
                  Live Results
                </h2>
                {/* <button
                  onClick={() => setShowAuthModal(true)}
                  className="delete-btn"
                  style={"padding: 10px 20px; background: rgb(220, 38, 38); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 8px;"}
                >
                  <XCircle style={{ width: '1rem', height: '1rem' }} /> Delete
                </button> */}
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="delete-btn"
                    style={{
                      padding: "10px 20px",
                      background: "orange",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <XCircle style={{ width: "1rem", height: "1rem" }} /> Del_res
                  </button>

                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="delete-btn"
                    style={{
                      padding: "10px 20px",
                      background: "rgb(220, 38, 38)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <XCircle style={{ width: "1rem", height: "1rem" }} /> Delete
                  </button>

                </div>
              </div>
              <div className="total-responses-box">
                <p className="total-responses-label">Total Responses</p>
                <p className="total-responses-number">{results.total_responses}</p>
              </div>

              <div className="results-questions">
                {results.questions.map((question, qIdx) => (
                  <div key={qIdx} className="results-question">
                    <p className="results-question-text">
                      {qIdx + 1}. {question.question_text}
                    </p>
                    {question.choices.map((choice, cIdx) => {
                      const percentage = results.total_responses > 0
                        ? ((choice.votes / results.total_responses) * 100).toFixed(1)
                        : 0;
                      return (
                        <div key={cIdx} className="results-choice">
                          <div className="results-choice-header">
                            <span className="results-choice-label">{choice.choice_text}</span>
                            <span className="results-choice-stats">
                              {choice.votes}
                              <span className="results-choice-percentage"> ({percentage}%)</span>
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="voters-section">
                <h3 className="voters-title">
                  <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                  Voters ({results.responses.length})
                </h3>
                <div className="voters-list">
                  {results.responses.map((resp, idx) => (
                    <span key={idx} className="voter-badge">
                      {resp.voter_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={handleDelete}
        title="Operation under admin control"
      />

      <AuthModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetResults}
        title="Reset all poll results? This cannot be undone."
      />

    </div>
  );
};

export default PollVote;