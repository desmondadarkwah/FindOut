import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerification } from '../Context/VerificationContext';
import {
  CheckCircle, XCircle, Clock, BookOpen, Award,
  TrendingUp, AlertCircle, Play, Home, Menu, X
} from 'lucide-react';
import DashSidebar from '../components/DashSidebar';
import MobileViewBar from '../components/MobileViewBar';
import MobileViewIcons from '../components/MobileViewIcons';
import FindOutLoader from '../Loader/FindOutLoader';

const VerificationDashboard = () => {
  const navigate = useNavigate();
  const { verificationStatus, fetchVerificationStatus, loading } = useVerification();
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleStartQuiz = (subject) => {
    navigate(`/take-quiz/${encodeURIComponent(subject)}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          color: '#22c55e',
          bg: 'rgba(34,197,94,0.1)',
          border: 'rgba(34,197,94,0.3)',
          icon: CheckCircle
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: '#f59e0b',
          bg: 'rgba(245,158,11,0.1)',
          border: 'rgba(245,158,11,0.3)',
          icon: Clock
        };
      case 'not_started':
        return {
          label: 'Not Started',
          color: 'rgba(255,255,255,0.4)',
          bg: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          icon: AlertCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'rgba(255,255,255,0.4)',
          bg: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <FindOutLoader />
    );
  }

  const Content = () => (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8
        }}>
          Test Your Skills on Your Subject
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
          Get verified to build trust with learners and stand out as a credible teacher
        </p>
      </div>

      {/* Overall Status Card */}
      {verificationStatus && (
        <div style={{
          background: verificationStatus.isVerified
            ? 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))'
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${verificationStatus.isVerified ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'
            }`,
          borderRadius: 20,
          padding: 32,
          marginBottom: 32
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 16
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: verificationStatus.isVerified
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {verificationStatus.isVerified ? (
                <Award size={28} color="#fff" />
              ) : (
                <BookOpen size={28} color="rgba(255,255,255,0.5)" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {verificationStatus.isVerified ? 'Verified Teacher' : 'Unverified'}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                {verificationStatus.isVerified
                  ? `Verified in ${verificationStatus.verifiedSubjects.length} subject(s)`
                  : 'Complete quizzes to get verified'}
              </p>
            </div>
          </div>

          {verificationStatus.verifiedSubjects.length > 0 && (
            <div>
              <p style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 8
              }}>
                Verified Subjects:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {verificationStatus.verifiedSubjects.map((vs, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CheckCircle size={12} />
                    {vs.subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div style={{
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        display: 'flex',
        gap: 16
      }}>
        <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>
            How Verification Works
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Take a 10-question quiz for each subject you teach. Score 70% or higher to get verified.
            You have 3 attempts per subject and 10 minutes per quiz. Verified teachers get priority
            in matching and build more trust with learners.
          </p>
        </div>
      </div>

      {/* Subject Cards */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 16
        }}>
          Your Subjects
        </h3>

        {verificationStatus?.subjectStatus?.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16
          }}>
            {verificationStatus.subjectStatus.map((subject, index) => {
              const badge = getStatusBadge(subject.status);
              const Icon = badge.icon;

              return (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    padding: 20,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Subject Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: 16
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: 4
                      }}>
                        {subject.subject}
                      </h4>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        color: badge.color
                      }}>
                        <Icon size={12} />
                        {badge.label}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  {subject.status !== 'not_started' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12,
                      marginBottom: 16
                    }}>
                      <div>
                        <p style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.4)',
                          marginBottom: 4
                        }}>
                          Attempts
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                          {subject.totalAttempts || 0} / 3
                        </p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.4)',
                          marginBottom: 4
                        }}>
                          Best Score
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                          {subject.bestScore || 0} / 10
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {subject.isVerified ? (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 12,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#22c55e'
                    }}>
                      ✓ Verified on {new Date(subject.verifiedAt).toLocaleDateString()}
                    </div>
                  ) : subject.canTakeQuiz ? (
                    <button
                      onClick={() => handleStartQuiz(subject.subject)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        border: 'none',
                        borderRadius: 12,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Play size={14} />
                      {subject.status === 'not_started' ? 'Start Quiz' : 'Retake Quiz'}
                    </button>
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 12,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#ef4444'
                    }}>
                      Maximum attempts reached
                    </div>
                  )}

                  {/* Attempts Remaining */}
                  {!subject.isVerified && subject.canTakeQuiz && subject.attemptsRemaining < 3 && (
                    <p style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      textAlign: 'center',
                      marginTop: 8
                    }}>
                      {subject.attemptsRemaining} attempt(s) remaining
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 40,
            textAlign: 'center'
          }}>
            <BookOpen size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              No subjects found. Add subjects to your profile to get started.
            </p>
            <button
              onClick={() => navigate('/profile')}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)'
    }}>
      {/* MOBILE */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{
          maxWidth: 520,
          margin: '0 auto',
          padding: '80px 16px 100px'
        }}>
          <Content />
        </div>
        <MobileViewIcons />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block">
        {/* Sidebar toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s'
          }}
        >
          {showSidebar ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Sidebar overlay */}
        {showSidebar && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 40,
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setShowSidebar(false)}
            />
            <div style={{
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100%',
              width: 256,
              zIndex: 50
            }}>
              <DashSidebar />
            </div>
          </>
        )}

        {/* Main content */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 1000,
            padding: '32px 20px'
          }}>
            {/* Top nav bar */}
            <div style={{
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '10px 16px'
            }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                  transition: 'color 0.2s'
                }}
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>

            <Content />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDashboard;