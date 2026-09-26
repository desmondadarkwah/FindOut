import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CheckCircle, MessageCircle, Users, BookOpen, Lock,
  User, TrendingUp,
} from 'lucide-react';

// NOTE: colors on this page are intentionally hardcoded hex/rgba, not the
// app's var(--bg-primary)/var(--text-primary) theme tokens used everywhere
// else in the codebase. This page sits outside the theme toggle on
// purpose — a visitor's first impression shouldn't flicker between light
// and dark depending on some stored preference from a session they don't
// have yet. It's fixed to dark, matching the app's own default (see
// ThemeContext.jsx: `useState(localStorage.getItem('theme') || 'dark')`),
// so there's no jarring switch the moment someone signs up and lands in
// the actual product.

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FIX: dropped the "AI-powered" / "algorithm" / "intelligent" framing
  // throughout this file — the app doesn't claim to be AI-driven anywhere
  // else, so the landing page shouldn't either. Matching is still the
  // real feature; it's just described honestly now.
  const features = [
    {
      icon: Search,
      title: 'Smart Matching',
      description: 'We connect you with study partners based on your subjects, learning goals, and availability — not just random suggestions.',
    },
    {
      icon: CheckCircle,
      title: 'Verified Teachers',
      description: 'Every teacher on FindOut passes a subject-specific quiz before earning their verified badge. Learn from credible, trusted peers.',
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Messaging',
      description: 'Chat instantly with your study partners and groups. Share resources, ask questions, and collaborate in real time.',
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Create or join public, private, or secret study groups tailored to your subject. Manage members and discussions all in one place.',
    },
    {
      icon: BookOpen,
      title: 'Learning Hub',
      description: 'Share resources, post help requests, and explore explanations from your peers. Build reputation by contributing helpful content.',
    },
    {
      icon: Lock,
      title: 'Privacy Controls',
      description: 'You decide who sees you and your groups. Choose public, private, or secret settings for total control of your learning space.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and add your subjects, set your learning status — Ready to Teach, Ready to Learn, or Later — and let FindOut know what you need.',
      icon: User,
    },
    {
      number: '02',
      title: 'Get Matched',
      description: 'FindOut surfaces study partners based on your subjects and goals. Browse suggestions and start a conversation in one click.',
      icon: Search,
    },
    {
      number: '03',
      title: 'Learn & Grow Together',
      description: 'Join study groups, share knowledge in the Learning Hub, get verified as a teacher, and build your academic reputation with every contribution.',
      icon: TrendingUp,
    },
  ];

  const stats = [
    { value: '500+', label: 'Students Connected' },
    { value: '50+', label: 'Study Groups' },
    { value: '30+', label: 'Subjects Covered' },
    { value: '95%', label: 'Match Satisfaction' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#f1f5f9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
    }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f5f9' }}>
            FindOut
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 20px', borderRadius: 10,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '9px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* One subtle background glow — the two extra "floating orb" blobs
            that used to sit at opposite corners were dropped as
            decorative excess. */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 68px)',
            fontWeight: 700, lineHeight: 1.15,
            margin: '0 0 24px',
            letterSpacing: '-0.02em',
          }}>
            <span style={{ color: '#f1f5f9' }}>Find your perfect </span>
            <span style={{ color: '#818cf8' }}>study partner</span>
            <br />
            <span style={{ color: '#f1f5f9' }}>today</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 19px)',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7, margin: '0 auto 48px',
            maxWidth: 600, fontWeight: 400,
          }}>
            FindOut connects students who want to teach with students who want to learn —
            through real-time chat, study groups, and verified peer expertise.
          </p>

          {/* CTAs — one deliberate gradient, reserved for the two
              conversion actions on this page */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 36px', borderRadius: 14,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none', color: '#fff',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              Start Learning Free
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 36px', borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >
              Log In
            </button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, margin: '0 0 16px',
            letterSpacing: '-0.01em', color: '#f1f5f9',
          }}>
            Everything you need to learn together
          </h2>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.4)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
          }}>
            FindOut brings matching, real-time collaboration, and verified expertise into one place.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '28px',
                  transition: 'border-color 0.2s, background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.background = 'rgba(99,102,241,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={22} color="#818cf8" />
                </div>
                <h3 style={{
                  fontSize: 16, fontWeight: 600,
                  color: '#f1f5f9', margin: '0 0 10px',
                }}>{feature.title}</h3>
                <p style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.7, margin: 0,
                }}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: '100px 24px',
        background: 'rgba(99,102,241,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700, margin: '0 0 16px',
              letterSpacing: '-0.01em', color: '#f1f5f9',
            }}>
              Up and running in 3 steps
            </h2>
            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.4)',
              maxWidth: 480, margin: '0 auto', lineHeight: 1.7,
            }}>
              Getting started with FindOut is simple.
            </p>
          </div>

          {/* FIX: each step used to carry a "connector line" div that was
              unconditionally `display: 'none'` with a comment claiming it
              was "hidden on mobile, shown on desktop via media query
              workaround" — no such media query existed anywhere, so the
              line never rendered on any screen size. Removed the dead
              element rather than keep a comment describing behavior that
              didn't exist. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32, alignItems: 'start',
          }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 18, padding: '32px 28px',
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    fontSize: 13, fontWeight: 700, color: '#818cf8',
                    letterSpacing: '0.02em', marginBottom: 20,
                  }}>
                    {step.number}
                  </div>

                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    <Icon size={24} color="#818cf8" />
                  </div>

                  <h3 style={{
                    fontSize: 17, fontWeight: 600,
                    color: '#f1f5f9', margin: '0 0 12px',
                  }}>{step.title}</h3>
                  <p style={{
                    fontSize: 14, color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7, margin: 0,
                  }}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(30px, 5vw, 48px)',
            fontWeight: 700, margin: '0 0 20px',
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            <span style={{ color: '#f1f5f9' }}>Ready to find your </span>
            <span style={{ color: '#818cf8' }}>study partner?</span>
          </h2>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7, margin: '0 auto 48px',
            maxWidth: 500,
          }}>
            Join FindOut today and connect with students who share your subjects,
            goals, and passion for learning. Free for all students.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 40px', borderRadius: 14,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none', color: '#fff',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 36px', borderRadius: 14,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>F</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>FindOut</span>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          © 2026 FindOut. Built for students, by students.
        </p>

        <div style={{ display: 'flex', gap: 24 }}>
          {['About', 'Privacy', 'Terms'].map(link => (
            <span
              key={link}
              style={{
                fontSize: 13, color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;