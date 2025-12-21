// ============================================
// FILE: src/components/PollCreator.jsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  User, 
  FileText,
  HelpCircle,
  Save
} from 'lucide-react';
import { pollAPI } from '../services/api';
import '../assets/poll_system.css';

const PollCreator = () => {
  const navigate = useNavigate();
  
  const [creatorName, setCreatorName] = useState('');
  const [pollTitle, setPollTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      choices: [
        { choice_text: '' },
        { choice_text: '' }
      ]
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      choices: [{ choice_text: '' }, { choice_text: '' }]
    }]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
    }
  };

  const updateQuestion = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].question_text = value;
    setQuestions(updated);
  };

  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ choice_text: '' });
    setQuestions(updated);
  };

  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    if (updated[qIndex].choices.length > 2) {
      updated[qIndex].choices = updated[qIndex].choices.filter((_, i) => i !== cIndex);
      setQuestions(updated);
    }
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex].choice_text = value;
    setQuestions(updated);
  };

  const validateForm = () => {
    if (!creatorName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!pollTitle.trim()) {
      setError('Please enter a poll title');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        setError(`Question ${i + 1} is empty`);
        return false;
      }
      
      const validChoices = questions[i].choices.filter(c => c.choice_text.trim());
      if (validChoices.length < 2) {
        setError(`Question ${i + 1} needs at least 2 choices`);
        return false;
      }
    }
    
    return true;
  };

  const handleCreatePoll = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const pollData = {
        creator_name: creatorName.trim(),
        poll_title: pollTitle.trim(),
        questions: questions.map(q => ({
          question_text: q.question_text.trim(),
          choices: q.choices
            .filter(c => c.choice_text.trim())
            .map(c => ({ choice_text: c.choice_text.trim(), votes: 0 }))
        }))
      };

      const response = await pollAPI.createPoll(pollData);
      console.log('✅ Poll created:', response.poll_id);
      
      navigate(`/poll/${response.poll_id}`);
    } catch (err) {
      console.error('Create poll error:', err);
      setError('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poll-creator-page">
      <div className="poll-creator-container">
        <div className="poll-creator-header">
          <h1 className="poll-creator-title">
            📊 Create Your Poll
          </h1>
          <p className="poll-creator-subtitle">
            Build a custom poll with multiple questions and choices
          </p>
        </div>

        <div className="poll-form-wrapper">
          {/* Creator Info */}
          <div className="form-section">
            <label className="form-label">
              <User className="label-icon" />
              Your Name
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter your name"
              className="form-input"
            />
          </div>

          {/* Poll Title */}
          <div className="form-section">
            <label className="form-label">
              <FileText className="label-icon" />
              Poll Title
            </label>
            <input
              type="text"
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              placeholder="e.g., Team Lunch Survey, Weekend Activity Poll"
              className="form-input"
            />
          </div>

          {/* Questions */}
          <div className="questions-container">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-header">
                  <div className="question-label-wrapper">
                    <div className="question-number">
                      {qIndex + 1}
                    </div>
                    <span className="question-label-text">
                      <HelpCircle className="label-icon" style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Question {qIndex + 1}
                    </span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="remove-question-btn"
                      title="Remove question"
                    >
                      <Trash2 style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  placeholder="Enter your question"
                  className="question-input"
                />

                <div className="choices-section">
                  <p className="choices-label">Choices:</p>
                  <div className="choices-list">
                    {question.choices.map((choice, cIndex) => (
                      <div key={cIndex} className="choice-row">
                        <span className="choice-number">{cIndex + 1}</span>
                        <input
                          type="text"
                          value={choice.choice_text}
                          onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                          placeholder={`Choice ${cIndex + 1}`}
                          className="choice-input"
                        />
                        {question.choices.length > 2 && (
                          <button
                            onClick={() => removeChoice(qIndex, cIndex)}
                            className="remove-choice-btn"
                            title="Remove choice"
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addChoice(qIndex)}
                    className="add-choice-btn"
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} /> Add Choice
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="add-question-btn"
          >
            <Plus style={{ width: '1.25rem', height: '1.25rem' }} /> Add Question
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-box">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreatePoll}
            disabled={loading}
            className="create-poll-btn"
          >
            {loading ? (
              <>
                <div className="btn-spinner" />
                Creating...
              </>
            ) : (
              <>
                <Save className="btn-icon" />
                Create Poll & Get Share Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;