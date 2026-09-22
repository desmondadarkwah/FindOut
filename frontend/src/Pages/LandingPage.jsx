import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🧠',
      title: 'Intelligent Matching',
      description: 'Our algorithm connects you with the right study partners based on your subjects, learning goals, and availability — not just random suggestions.',
    },
    {
      icon: '✅',
      title: 'Verified Teachers',
      description: 'Every teacher on FindOut passes a subject-specific quiz before earning their verified badge. Learn from credible, trusted peers.',
    },
    {
      icon: '💬',
      title: 'Real-Time Messaging',
      description: 'Chat instantly with your study partners and groups. Share resources, ask questions, and collaborate in real time.',
    },
    {
      icon: '👥',
      title: 'Study Groups',
      description: 'Create or join public, private, or secret study groups tailored to your subject. Manage members and discussions all in one place.',
    },
    {
      icon: '📚',
      title: 'Learning Hub',
      description: 'Share resources, post help requests, and explore explanations from your peers. Build reputation by contributing helpful content.',
    },
    {
      icon: '🔒',
      title: 'Privacy Controls',
      description: 'You decide who sees you and your groups. Choose public, private, or secret settings for total control of your learning space.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and add your subjects, set your learning status — Ready to Teach, Ready to Learn, or Later — and let FindOut know what you need.',
      icon: '👤',
    },
    {
      number: '02',
      title: 'Get Matched Instantly',
      description: 'Our intelligent algorithm finds your ideal study partners based on your subjects and goals. Browse suggestions and start a conversation in one click.',
      icon: '🔍',
    },
    {
      number: '03',
      title: 'Learn & Grow Together',
      description: 'Join study groups, share knowledge in the Learning Hub, get verified as a teacher, and build your academic reputation with every contribution.',
      icon: '🚀',
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
      background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a0f 50%, #0d0d1a 100%)',
      color: '#f1f5f9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ── NAVBAR ── */}
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
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>F</div>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FindOut</span>
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
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 800, height: 500,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '8%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99, marginBottom: 32,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
          }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>
              AI-Powered Peer Learning Platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 900, lineHeight: 1.1,
            margin: '0 0 24px',
            letterSpacing: '-0.03em',
          }}>
            <span style={{ color: '#f1f5f9' }}>Find Your </span>
            <span style={{
              background: 'linear-gradient(135deg,#60a5fa,#818cf8,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Perfect Study</span>
            <br />
            <span style={{ color: '#f1f5f9' }}>Partner Today</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7, margin: '0 auto 48px',
            maxWidth: 600, fontWeight: 400,
          }}>
            FindOut intelligently connects students who want to teach with students who want to learn —
            powered by AI matching, real-time chat, and verified peer expertise.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 36px', borderRadius: 14,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none', color: '#fff',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.4)'; }}
            >
              🚀 Start Learning Free
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
              Log In →
            </button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 99, marginBottom: 20,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Platform Features
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800, margin: '0 0 16px',
            letterSpacing: '-0.02em', color: '#f1f5f9',
          }}>
            Everything You Need to{' '}
            <span style={{
              background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Learn Together</span>
          </h2>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.4)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
          }}>
            FindOut brings intelligent matching, real-time collaboration, and verified expertise into one seamless platform.
          </p>
        </div>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '28px 28px',
                transition: 'all 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20,
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 17, fontWeight: 700,
                color: '#f1f5f9', margin: '0 0 10px',
                letterSpacing: '-0.01em',
              }}>{feature.title}</h3>
              <p style={{
                fontSize: 14, color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.7, margin: 0,
              }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: '100px 24px',
        background: 'rgba(99,102,241,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 99, marginBottom: 20,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                How It Works
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800, margin: '0 0 16px',
              letterSpacing: '-0.02em', color: '#f1f5f9',
            }}>
              Up and Running in{' '}
              <span style={{
                background: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>3 Simple Steps</span>
            </h2>
            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.4)',
              maxWidth: 480, margin: '0 auto', lineHeight: 1.7,
            }}>
              Getting started with FindOut is simple. Join thousands of students already learning together.
            </p>
          </div>

          {/* Steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32, alignItems: 'start',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 32, left: 'calc(50% + 60px)',
                    width: 'calc(100% - 20px)', height: 1,
                    background: 'linear-gradient(to right, rgba(99,102,241,0.3), transparent)',
                    display: 'none', // hidden on mobile, shown on desktop via media query workaround
                  }} />
                )}

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24, padding: '36px 28px',
                  textAlign: 'center',
                  transition: 'all 0.25s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.2))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    fontSize: 13, fontWeight: 800, color: '#818cf8',
                    letterSpacing: '0.05em', marginBottom: 20,
                  }}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.15))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, margin: '0 auto 24px',
                  }}>
                    {step.icon}
                  </div>

                  <h3 style={{
                    fontSize: 18, fontWeight: 700,
                    color: '#f1f5f9', margin: '0 0 12px',
                    letterSpacing: '-0.01em',
                  }}>{step.title}</h3>
                  <p style={{
                    fontSize: 14, color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.7, margin: 0,
                  }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 99, marginBottom: 28,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          }}>
            <span style={{ fontSize: 14 }}>🎓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>
              Free for all students
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900, margin: '0 0 20px',
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            <span style={{ color: '#f1f5f9' }}>Ready to Find Your </span>
            <span style={{
              background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Study Partner?</span>
          </h2>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7, margin: '0 auto 48px',
            maxWidth: 500,
          }}>
            Join FindOut today and connect with students who share your subjects,
            goals, and passion for learning.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 40px', borderRadius: 14,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                border: 'none', color: '#fff',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(99,102,241,0.45)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)'; }}
            >
              🚀 Create Free Account
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
              Already have an account? →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: 1280, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
          }}>F</div>
          <span style={{
            fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FindOut</span>
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