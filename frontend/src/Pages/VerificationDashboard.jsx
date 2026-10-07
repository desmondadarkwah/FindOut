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
import { useEditUser } from '../Context/EditUserContext';
import { useToast } from '../Context/ToastContext';

// FIX: the page used to render BOTH the mobile and desktop layouts at once
// and hide one with CSS, so the whole content was in the page twice. Now only
// the layout that matches the screen size is rendered.
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

const VerificationDashboard = () => {
  const navigate = useNavigate();
  const { verificationStatus, fetchVerificationStatus, loading } = useVerification();
  const isDesktop = useIsDesktop();
  const { toast } = useToast();
  const editUser = useEditUser();
  const [newSubject, setNewSubject] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  // Adds a subject right here (same call the Settings menu uses) instead of
  // sending the user away to a separate profile page.
  const handleAddSubject = async () => {
    const value = newSubject.trim();
    if (!value) { toast.error('Please enter a subject.'); return; }
    if (!editUser?.editUserDetails) { toast.error('Could not update your subjects right now.'); return; }

    try {
      setAddingSubject(true);
      await editUser.editUserDetails({ subjects: [value] });
      setNewSubject('');
      await fetchVerificationStatus(); // refresh so the new subject card appears
      toast.success(`${value} added. You can now take its quiz.`, 'Subject Added');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add subject');
    } finally {
      setAddingSubject(false);
    }
  };

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

  // FIX: if the server ever sends the status without a `verifiedSubjects`
  // list, `.length` / `.map` on it used to crash the whole page.
  const verifiedSubjects = verificationStatus?.verifiedSubjects || [];

  // Called as a plain function ({Content()}) so it is inlined instead of being
  // mounted as its own component type (avoids remounting on every render).
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
              justifyContent: 'center',
              flexShrink: 0
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
                  ? `Verified in ${verifiedSubjects.length} subject(s)`
                  : 'Complete quizzes to get verified'}
              </p>
            </div>
          </div>

          {verifiedSubjects.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Verified Subjects:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {verifiedSubjects.map((vs, index) => (
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
          // FIX: min(300px, 100%) so a column can shrink on very small phones
          // instead of forcing sideways scrolling.
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
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
                      {/* FIX: no more "Verified on Invalid Date" if the date is missing */}
                      {subject.verifiedAt
                        ? `Verified on ${new Date(subject.verifiedAt).toLocaleDateString()}`
                        : 'Verified'}
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
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              No subjects yet. Add your first subject to start verification.
            </p>
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              maxWidth: 380, margin: '16px auto 0',
            }}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(); }}
                placeholder="e.g. Mathematics"
                disabled={addingSubject}
                style={{
                  flex: 1, minWidth: 160, padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={handleAddSubject}
                disabled={addingSubject || !newSubject.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: (addingSubject || !newSubject.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (addingSubject || !newSubject.trim()) ? 0.6 : 1,
                }}
              >
                {addingSubject ? 'Adding...' : 'Add Subject'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* MOBILE (only rendered below 1024px) */}
      {!isDesktop && (
        <div>
          <MobileViewBar />
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '80px 16px 100px' }}>
            {Content()}
          </div>
          <MobileViewIcons />
        </div>
      )}

      {/* DESKTOP (only rendered at 1024px and up) */}
      {isDesktop && (
        <div>
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
      )}
    </div>
  );
};

export default VerificationDashboard;