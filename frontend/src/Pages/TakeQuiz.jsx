import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerification } from '../Context/VerificationContext';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import FindOutLoader from '../Loader/FindOutLoader';
import { useToast } from '../Context/ToastContext';

const TakeQuiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { startQuiz, submitQuiz } = useVerification();
  const { toast, confirm } = useToast();

  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [subject]);

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
      toast.error(error.response?.data?.message || 'Failed to load quiz');
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

  // FIX: this is the actual submission call, split out from handleSubmit
  // so the timeout path can call it directly. Previously handleAutoSubmit
  // called handleSubmit(), which starts by checking for unanswered
  // questions and popping a "submit anyway?" confirmation — but if the
  // timer has already hit zero, there's no more time to answer anything,
  // so asking "are you sure" at that exact moment is nonsensical and just
  // leaves the quiz hanging on a dialog with the clock already frozen at
  // 0:00.
  const submitNow = async () => {
    try {
      setIsSubmitting(true);
      const response = await submitQuiz(quizData.quizSessionId, answers);
      setResult(response.result);
    } catch (error) {
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    submitNow();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      const confirmed = await confirm({
        title: 'Unanswered Questions',
        message: `You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Submit anyway?`,
        confirmText: 'Submit',
        cancelText: 'Keep Answering',
        confirmStyle: 'warning',
      });
      if (!confirmed) return;
    }

    submitNow();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <FindOutLoader />;
  }

  // Results screen
  if (result) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 40
        }}>
          {/* Result Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: result.passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${result.passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              {result.passed ? (
                <CheckCircle size={34} color="#4ade80" />
              ) : (
                <XCircle size={34} color="#f87171" />
              )}
            </div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8
            }}>
              {result.passed ? 'Congratulations!' : 'Not Quite There Yet'}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
              {result.passed
                ? `You've been verified in ${subject}!`
                : 'Keep practicing and try again!'}
            </p>
          </div>

          {/* Score Card */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 28,
            marginBottom: 32
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Score
                </p>
                <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {result.score}/{result.totalQuestions}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Percentage
                </p>
                <p style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: result.passed ? '#4ade80' : '#f87171'
                }}>
                  {result.percentage}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Time
                </p>
                <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatTime(result.timeSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 16
            }}>
              Review Your Answers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {result.questions.map((q, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg-primary)',
                    border: `1px solid ${q.isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    borderRadius: 12,
                    padding: 16
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: q.isCorrect ? '#22c55e' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {q.isCorrect ? (
                        <CheckCircle size={13} color="#fff" />
                      ) : (
                        <XCircle size={13} color="#fff" />
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                      {index + 1}. {q.question}
                    </p>
                  </div>
                  <div style={{ marginLeft: 34 }}>
                    {q.options.map((option, optIndex) => {
                      const isCorrect = optIndex === q.correctAnswer;
                      const isUserAnswer = optIndex === q.userAnswer;

                      return (
                        <div
                          key={optIndex}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 12px',
                            borderRadius: 8,
                            marginBottom: 4,
                            background: isCorrect
                              ? 'rgba(34,197,94,0.08)'
                              : isUserAnswer
                                ? 'rgba(239,68,68,0.08)'
                                : 'transparent',
                            border: `1px solid ${isCorrect
                                ? 'rgba(34,197,94,0.25)'
                                : isUserAnswer
                                  ? 'rgba(239,68,68,0.25)'
                                  : 'transparent'
                              }`,
                            fontSize: 13,
                            color: isCorrect || isUserAnswer ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          <span>{option}</span>
                          {isCorrect && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#4ade80', fontSize: 12 }}>
                              <CheckCircle size={12} />Correct
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#f87171', fontSize: 12 }}>
                              <XCircle size={12} />Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {q.explanation && (
                      <p style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginTop: 8,
                        fontStyle: 'italic'
                      }}>
                        {q.explanation}
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
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {subject} Verification Quiz
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
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
            borderRadius: 10
          }}>
            <Clock size={17} color={timeRemaining < 60 ? '#ef4444' : '#818cf8'} />
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: timeRemaining < 60 ? '#f87171' : 'var(--text-primary)'
            }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 6,
          background: 'var(--bg-card)',
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 32,
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 24,
            lineHeight: 1.6
          }}>
            {question.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  style={{
                    padding: '15px 18px',
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--bg-primary)',
                    border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--border)'}`,
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: 12, color: 'var(--text-secondary)' }}>
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
              padding: '11px 22px',
              background: currentQuestion === 0 ? 'var(--bg-card)' : 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: currentQuestion === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
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
                padding: '11px 30px',
                background: isSubmitting
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                borderRadius: 10,
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
                padding: '11px 22px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
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
                    ? 'rgba(34,197,94,0.15)'
                    : currentQuestion === index
                      ? 'rgba(99,102,241,0.15)'
                      : 'var(--bg-primary)',
                  border: `1px solid ${currentQuestion === index
                      ? '#6366f1'
                      : answers[index] !== null
                        ? 'rgba(34,197,94,0.35)'
                        : 'var(--border)'
                    }`,
                  color: 'var(--text-primary)',
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