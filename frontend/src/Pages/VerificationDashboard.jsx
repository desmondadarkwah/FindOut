import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerification } from '../Context/VerificationContext';
import {
  CheckCircle, XCircle, Clock, BookOpen, Award,
  AlertCircle, Play, Home
} from 'lucide-react';
import DashSidebar from '../components/DashSidebar';
import MobileViewBar from '../components/MobileViewBar';
import MobileViewIcons from '../components/MobileViewIcons';
import FindOutLoader from '../Loader/FindOutLoader';

const VerificationDashboard = () => {
  const navigate = useNavigate();
  const { verificationStatus, fetchVerificationStatus, loading } = useVerification();

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
          color: '#4ade80',
          bg: 'rgba(34,197,94,0.1)',
          border: 'rgba(34,197,94,0.3)',
          icon: CheckCircle
        };
      case 'in_progress':
        // FIX: was #f59e0b, a slightly different amber than the warning
        // color used everywhere else in the app (#eab308) — unified.
        return {
          label: 'In Progress',
          color: '#eab308',
          bg: 'rgba(234,179,8,0.1)',
          border: 'rgba(234,179,8,0.3)',
          icon: Clock
        };
      case 'not_started':
        return {
          label: 'Not Started',
          color: 'var(--text-muted)',
          bg: 'var(--bg-card)',
          border: 'var(--border)',
          icon: AlertCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'var(--text-muted)',
          bg: 'var(--bg-card)',
          border: 'var(--border)',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return <FindOutLoader />;
  }

  // FIX: this was declared inside the component body as `const Content = () =>`
  // and rendered as <Content /> — a component redefined inside its
  // parent's render body gets a brand-new function identity every
  // render, so React treats it as a completely different component type
  // each time and remounts the whole subtree instead of updating it in
  // place. Same root cause as the flashing bug originally found in
  // AllPost.jsx. Calling it as a plain function, `{Content()}`, below
  // avoids that — it's inlined as JSX rather than mounted as its own
  // component instance.
  const Content = () => (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8
        }}>
          Test Your Skills on Your Subject
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Get verified to build trust with learners and stand out as a credible teacher
        </p>
      </div>

      {/* Overall Status Card */}
      {verificationStatus && (
        <div style={{
          background: verificationStatus.isVerified ? 'rgba(34,197,94,0.06)' : 'var(--bg-card)',
          border: `1px solid ${verificationStatus.isVerified ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
          borderRadius: 18,
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
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: verificationStatus.isVerified ? '#22c55e' : 'var(--bg-card-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {verificationStatus.isVerified ? (
                <Award size={26} color="#fff" />
              ) : (
                <BookOpen size={26} color="var(--text-secondary)" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {verificationStatus.isVerified ? 'Verified Teacher' : 'Unverified'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {verificationStatus.isVerified
                  ? `Verified in ${verificationStatus.verifiedSubjects.length} subject(s)`
                  : 'Complete quizzes to get verified'}
              </p>
            </div>
          </div>

          {verificationStatus.verifiedSubjects.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Verified Subjects:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {verificationStatus.verifiedSubjects.map((vs, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#4ade80',
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
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 14,
        padding: 20,
        marginBottom: 32,
        display: 'flex',
        gap: 16
      }}>
        <AlertCircle size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>
            How Verification Works
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Take a 10-question quiz for each subject you teach. Score 70% or higher to get verified.
            You have 3 attempts per subject and 10 minutes per quiz. Verified teachers get priority
            in matching and build more trust with learners.
          </p>
        </div>
      </div>

      {/* Subject Cards */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
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
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 20,
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {/* Subject Header */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
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

                  {/* Stats */}
                  {subject.status !== 'not_started' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12,
                      marginBottom: 16
                    }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Attempts
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {subject.totalAttempts || 0} / 3
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Best Score
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {subject.bestScore || 0} / 10
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {subject.isVerified ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#4ade80'
                    }}>
                      <CheckCircle size={14} />
                      Verified on {new Date(subject.verifiedAt).toLocaleDateString()}
                    </div>
                  ) : subject.canTakeQuiz ? (
                    <button
                      onClick={() => handleStartQuiz(subject.subject)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        border: 'none',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      <Play size={14} />
                      {subject.status === 'not_started' ? 'Start Quiz' : 'Retake Quiz'}
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '12px',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#f87171'
                    }}>
                      <XCircle size={14} />
                      Maximum attempts reached
                    </div>
                  )}

                  {/* Attempts Remaining */}
                  {!subject.isVerified && subject.canTakeQuiz && subject.attemptsRemaining < 3 && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                      {subject.attemptsRemaining} attempt(s) remaining
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center'
          }}>
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              No subjects found. Add subjects to your profile to get started.
            </p>
            <button
              onClick={() => navigate('/profile')}
              style={{
                marginTop: 16,
                padding: '10px 24px',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-primary)',
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* MOBILE */}
      <div className="lg:hidden">
        <MobileViewBar />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>
          {Content()}
        </div>
        <MobileViewIcons />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block">
        {/*
          FIX: this used to render its own sidebar-toggle button, its own
          backdrop, and a fixed-position wrapper around <DashSidebar />
          (identical to a bug already fixed in ExploreGroups.jsx).
          DashSidebar manages its own open/close state and toggle button
          internally now — this duplicate scaffolding would render a
          second, conflicting toggle button stacked on top of it. Rendered
          plainly instead, same as Dashboard.jsx and ExploreGroups.jsx.
        */}
        <DashSidebar />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1000, padding: '32px 20px' }}>
            {/* Top nav bar */}
            <div style={{
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
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
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: 0,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>

            {Content()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDashboard;