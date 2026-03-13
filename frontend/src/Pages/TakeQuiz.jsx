import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerification } from '../Context/VerificationContext';
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import FindOutLoader from '../Loader/FindOutLoader';

const TakeQuiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { startQuiz, submitQuiz } = useVerification();

  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load quiz on mount
  useEffect(() => {
    loadQuiz();
  }, [subject]);

  // Timer countdown
  useEffect(() => {
    if (!quizData || result) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, result]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await startQuiz(subject);
      setQuizData(data);
      setAnswers(new Array(data.questions.length).fill(null));
      setTimeRemaining(data.timeLimit || 600);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to load quiz');
      navigate('/verification');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitQuiz(quizData.quizSessionId, answers);
      setResult(response.result);
    } catch (error) {
      alert('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <FindOutLoader />
    );
  }

  // Results screen
  if (result) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: 40
        }}>
          {/* Result Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: result.passed
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              {result.passed ? (
                <CheckCircle size={40} color="#fff" />
              ) : (
                <XCircle size={40} color="#fff" />
              )}
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 8
            }}>
              {result.passed ? 'Congratulations! 🎉' : 'Not Quite There Yet'}
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
              {result.passed
                ? `You've been verified in ${subject}!`
                : 'Keep practicing and try again!'}
            </p>
          </div>

          {/* Score Card */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32,
            marginBottom: 32
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Score
                </p>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>
                  {result.score}/{result.totalQuestions}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Percentage
                </p>
                <p style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: result.passed ? '#22c55e' : '#ef4444'
                }}>
                  {result.percentage}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Time
                </p>
                <p style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>
                  {formatTime(result.timeSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 16
            }}>
              Review Your Answers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result.questions.map((q, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${q.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: 12,
                    padding: 16
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: q.isCorrect ? '#22c55e' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {q.isCorrect ? (
                        <CheckCircle size={14} color="#fff" />
                      ) : (
                        <XCircle size={14} color="#fff" />
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                      {index + 1}. {q.question}
                    </p>
                  </div>
                  <div style={{ marginLeft: 36 }}>
                    {q.options.map((option, optIndex) => {
                      const isCorrect = optIndex === q.correctAnswer;
                      const isUserAnswer = optIndex === q.userAnswer;

                      return (
                        <div
                          key={optIndex}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            marginBottom: 4,
                            background: isCorrect
                              ? 'rgba(34,197,94,0.1)'
                              : isUserAnswer
                                ? 'rgba(239,68,68,0.1)'
                                : 'transparent',
                            border: `1px solid ${isCorrect
                                ? 'rgba(34,197,94,0.3)'
                                : isUserAnswer
                                  ? 'rgba(239,68,68,0.3)'
                                  : 'transparent'
                              }`,
                            fontSize: 13,
                            color: isCorrect || isUserAnswer ? '#fff' : 'rgba(255,255,255,0.6)'
                          }}
                        >
                          {option}
                          {isCorrect && (
                            <span style={{ marginLeft: 8, color: '#22c55e' }}>✓ Correct</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span style={{ marginLeft: 8, color: '#ef4444' }}>✗ Your answer</span>
                          )}
                        </div>
                      );
                    })}
                    {q.explanation && (
                      <p style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 8,
                        fontStyle: 'italic'
                      }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/verification')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back to Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {subject} Verification Quiz
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Question {currentQuestion + 1} of {quizData.questions.length}
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: timeRemaining < 60 ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
            border: `1px solid ${timeRemaining < 60 ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
            borderRadius: 12
          }}>
            <Clock size={18} color={timeRemaining < 60 ? '#ef4444' : '#6366f1'} />
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: timeRemaining < 60 ? '#ef4444' : '#fff'
            }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 8,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 99,
          marginBottom: 24,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            transition: 'width 0.3s'
          }} />
        </div>

        {/* Question Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 32,
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#fff',
            marginBottom: 24,
            lineHeight: 1.6
          }}>
            {question.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  style={{
                    padding: '16px 20px',
                    background: isSelected
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)'
                      }`,
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 15,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: 12 }}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 24px',
              background: currentQuestion === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: currentQuestion === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '12px 32px',
                background: isSubmitting
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div style={{
          marginTop: 24,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 20
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            Quick Navigation
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: 8
          }}>
            {quizData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: answers[index] !== null
                    ? 'rgba(34,197,94,0.2)'
                    : currentQuestion === index
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${currentQuestion === index
                      ? '#6366f1'
                      : answers[index] !== null
                        ? 'rgba(34,197,94,0.4)'
                        : 'rgba(255,255,255,0.1)'
                    }`,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;