import './App.css'; 
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState, useEffect } from 'react';

const MOCK_COURSES = [
  { id: 'c1', code: 'CS101', name: 'Intro to Computer Science', prof: 'Dr. Alan Turing' },
  { id: 'c2', code: 'MATH201', name: 'Linear Algebra', prof: 'Dr. Katherine Johnson' },
  { id: 'c3', code: 'ENG105', name: 'Academic Writing', prof: 'Prof. Mary Shelley' },
  { id: 'c4', code: 'PHYS101', name: 'General Physics I', prof: 'Dr. Richard Feynman' },
  { id: 'c5', code: 'BIO101', name: 'Introduction to Biology', prof: 'Dr. Rosalind Franklin' }
];

const StarRating = ({ rating, setRating, interactive = false }) => (
  <div style={{ display: 'flex', gap: '4px', color: 'var(--warning)', justifyContent: 'center' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        onClick={() => interactive && setRating(star)}
        style={{ 
          width: '28px', height: '28px', 
          cursor: interactive ? 'pointer' : 'default',
          fill: star <= rating ? 'currentColor' : '#e4e4e7',
          transition: 'transform 0.1s, fill 0.2s',
          transform: interactive && star <= rating ? 'scale(1.15)' : 'scale(1)'
        }}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// --- Sun/Moon Icons ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function LoginView({ onLogin, isDark, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isStudentEmail = /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/.test(email.trim().toLowerCase());
  const isAdminEmail = email.trim().toLowerCase() === 'bs.aritra2006@gmail.com';

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
  
    const emailTrimmed = email.trim().toLowerCase();
    const isAdmin = emailTrimmed === 'bs.aritra2006@gmail.com';
    const studentRegex = /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/;
    const isStudent = studentRegex.test(emailTrimmed);
  
    if (!isAdmin && !isStudent) {
      setErrorMsg("Access Denied: Please use a valid VIT student email or authorized admin email.");
      setLoading(false);
      return;
    }
  
    // ── Students: no Firebase needed, validate email and log in directly ──
    if (isStudent) {
      onLogin({
        id: emailTrimmed,                          // use email as stable unique ID
        name: emailTrimmed.split('@')[0],           // derive name from email prefix
        email: emailTrimmed,
        avatar: emailTrimmed.charAt(0).toUpperCase(),
        role: 'student'
      });
      setLoading(false);
      return;
    }
  
    // ── Admin only: Firebase authentication ──
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, password);
      const user = userCredential.user;
      onLogin({
        id: user.uid,
        name: 'System Admin',
        email: user.email,
        avatar: '⚙️',
        role: 'admin'
      });
    } catch (error) {
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setErrorMsg("Invalid admin credentials.");
      } else {
        setErrorMsg("Failed to sign in: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-app)', padding: '1rem', position: 'relative' }}>
      
      {/* Theme toggle on login screen */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          color: 'var(--text-dark)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease'
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-badge" style={{ margin: '0 auto 1.5rem auto', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.03em' }}>Course Feedback360</h1>
          <p style={{ color: 'var(--text-muted)' }}>University Evaluation Portal</p>
        </div>
        
        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #f87171' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" required className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. arnavkumar2024@vitstudent.ac.in" />
          </div>
          {/* Only show password field for admin */}
{(isAdminEmail || (!isStudentEmail && email.length > 0)) && (
  <div className="form-group">
    <label className="form-label">Password</label>
    <input
      type="password"
      required
      className="form-control"
      value={password}
      onChange={e => setPassword(e.target.value)}
      placeholder="••••••••"
    />
  </div>
)}

{/* Show a friendly note for students */}
{isStudentEmail && (
  <div style={{
    background: 'var(--success-light)', color: 'var(--success-text)',
    padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
    fontSize: '0.875rem', textAlign: 'center', fontWeight: '500'
  }}>
    ✅ Valid VIT email detected — no password required!
  </div>
)}
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Feedback360App() {
  const [currentUser, setCurrentUser] = useState(null);

  // ── Persist current view ──────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('feedback360_view') || 'dashboard';
  });

  // ── Persist evaluations ───────────────────────────────────────────────────
  const [evaluations, setEvaluations] = useState(() => {
    const saved = localStorage.getItem('feedback360_evals');
    return saved ? JSON.parse(saved) : [];
  });

  // ── Persist theme ─────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('feedback360_theme') === 'dark';
  });

  // Apply theme to <html> element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('feedback360_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendance, setAttendance] = useState('Always');
  const [timeSpent, setTimeSpent] = useState('3-6 hours');
  const [expectedGrade, setExpectedGrade] = useState('A');
  const [difficulty, setDifficulty] = useState('Medium');
  const [instructorQuality, setInstructorQuality] = useState('Excellent');
  const [gradingFairness, setGradingFairness] = useState('Very Fair');
  const [recommend, setRecommend] = useState('Yes');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (currentUser) localStorage.setItem('feedback360_view', currentView);
  }, [currentView, currentUser]);

  useEffect(() => {
    localStorage.setItem('feedback360_evals', JSON.stringify(evaluations));
  }, [evaluations]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentView(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    if (!selectedCourseId || rating === 0 || !comment.trim()) {
      alert("Please select a course, provide an overall star rating, and write a comment.");
      return;
    }
    const course = MOCK_COURSES.find(c => c.id === selectedCourseId);
    const newEval = {
      id: `eval_${Date.now()}`,
      studentId: currentUser.id, studentName: currentUser.name,
      courseId: course.id, courseCode: course.code, courseName: course.name, prof: course.prof,
      attendance, timeSpent, expectedGrade,
      difficulty, instructorQuality, gradingFairness,
      recommend, rating, comment,
      date: new Date().toLocaleDateString()
    };
    setEvaluations([newEval, ...evaluations]);
    setSelectedCourseId(''); setRating(0); setComment('');
    setAttendance('Always'); setTimeSpent('3-6 hours'); setExpectedGrade('A');
    setDifficulty('Medium'); setInstructorQuality('Excellent'); setGradingFairness('Very Fair'); setRecommend('Yes');
    alert(`Evaluation successfully submitted for ${course.code}!`);
    setCurrentView('dashboard');
  };

  if (!currentUser) return <LoginView onLogin={handleLogin} isDark={isDark} toggleTheme={toggleTheme} />;

  const myEvaluations = evaluations.filter(ev => ev.studentId === currentUser.id);
  const pendingCourses = MOCK_COURSES.filter(course => !myEvaluations.some(ev => ev.courseId === course.id));
  const globalAvgRating = evaluations.length
    ? (evaluations.reduce((acc, curr) => acc + curr.rating, 0) / evaluations.length).toFixed(1)
    : "0.0";
  const coursesCovered = new Set(evaluations.map(e => e.courseId)).size;

  const ReviewCard = ({ ev }) => (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>{ev.courseCode} - {ev.courseName}</strong>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Prof. {ev.prof}</div>
          {currentUser.role === 'admin' && (
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '8px', fontWeight: '600' }}>
              Reviewed by: {ev.studentName}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <StarRating rating={ev.rating} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{ev.date}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem', gap: '8px' }}>
        <span className="metadata-pill">📉 Difficulty: <strong>{ev.difficulty}</strong></span>
        <span className="metadata-pill">👨‍🏫 Instructor: <strong>{ev.instructorQuality}</strong></span>
        <span className="metadata-pill">⚖️ Grading: <strong>{ev.gradingFairness}</strong></span>
        <span className="metadata-pill">⏱️ Workload: <strong>{ev.timeSpent}/wk</strong></span>
        <span className="metadata-pill">📅 Attendance: <strong>{ev.attendance}</strong></span>
        <span className="metadata-pill">🎓 Grade: <strong>{ev.expectedGrade}</strong></span>
        <span className={`badge ${ev.recommend === 'Yes' ? 'success' : ''}`}>Recommend: {ev.recommend}</span>
      </div>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.6', background: 'var(--pill-bg)', padding: '1rem', borderLeft: '4px solid var(--border-color)', borderRadius: '0 8px 8px 0' }}>
        "{ev.comment}"
      </p>
    </div>
  );

  // ── Theme toggle button (reused in sidebar) ───────────────────────────────
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', padding: '0.75rem 1rem',
        background: 'var(--sidebar-hover)', border: '1px solid #3f3f46',
        borderRadius: 'var(--radius-md)', color: '#a1a1aa',
        cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500',
        fontSize: '0.9rem', transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'white'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge" style={{ backgroundColor: currentUser.role === 'admin' ? 'var(--danger)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span>{currentUser.role === 'admin' ? 'Admin Portal' : 'Course Evals'}</span>
        </div>

        <div className="user-profile-sm">
          <div className="avatar">{currentUser.avatar}</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {currentUser.role === 'admin' ? 'Administrator' : 'Student'}
            </div>
            <div style={{ fontWeight: '600', color: '#f4f4f5' }}>{currentUser.name}</div>
          </div>
        </div>

        <div className="nav-links">
          {currentUser.role === 'student' ? (
            <>
              <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>My Dashboard</button>
              <button className={`nav-item ${currentView === 'give-feedback' ? 'active' : ''}`} onClick={() => setCurrentView('give-feedback')}>Evaluate a Course</button>
            </>
          ) : (
            <>
              <button className={`nav-item ${currentView === 'admin-dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('admin-dashboard')}>System Overview</button>
              <button className={`nav-item ${currentView === 'all-feedback' ? 'active' : ''}`} onClick={() => setCurrentView('all-feedback')}>All Feedbacks</button>
            </>
          )}
        </div>

        {/* ── Bottom section: theme toggle + logout ── */}
        <div style={{ marginTop: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ThemeToggle />
          <button onClick={() => setCurrentUser(null)} style={{ color: '#71717a', cursor: 'pointer', fontWeight: '500', textAlign: 'left', padding: '0.5rem 0' }}>
            Log out
          </button>
        </div>
      </nav>

      <main className="main-content">

        {currentView === 'admin-dashboard' && (
          <div>
            <header className="page-header">
              <h2>System Overview</h2>
              <p>University-wide course evaluation metrics and analytics.</p>
            </header>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
              <div className="card stat-card">
                <div className="stat-title">Total Reviews</div>
                <div className="stat-value text-primary">{evaluations.length}</div>
              </div>
              <div className="card stat-card">
                <div className="stat-title">Global Average</div>
                <div className="stat-value text-dark">{globalAvgRating} <span className="stat-sub" style={{ fontSize: '1.5rem' }}>/ 5.0</span></div>
              </div>
              <div className="card stat-card">
                <div className="stat-title">Courses Covered</div>
                <div className="stat-value text-success">{coursesCovered} <span className="stat-sub" style={{ fontSize: '1.5rem' }}>/ {MOCK_COURSES.length}</span></div>
              </div>
            </div>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card">
                <div className="card-title">Top Rated Courses</div>
                {evaluations.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for evaluation data...</p>
                ) : (
                  MOCK_COURSES.map(course => {
                    const courseEvals = evaluations.filter(e => e.courseId === course.id);
                    const avg = courseEvals.length ? (courseEvals.reduce((s, e) => s + e.rating, 0) / courseEvals.length).toFixed(1) : 0;
                    return { ...course, avg, count: courseEvals.length };
                  }).filter(c => c.count > 0).sort((a, b) => b.avg - a.avg).slice(0, 4).map(course => (
                    <div key={course.id} className="leaderboard-item">
                      <div className="flex-between">
                        <strong style={{ fontSize: '1.05rem' }}>{course.code}</strong>
                        <span style={{ fontWeight: 'bold' }}>{course.avg} <span style={{ color: 'var(--warning)' }}>★</span></span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.count} reviews</div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${(course.avg / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="card">
                <div className="card-title">Recent Activity</div>
                {evaluations.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity yet.</p>
                ) : (
                  <div>
                    {evaluations.slice(0, 4).map(ev => (
                      <div key={ev.id} className="activity-item">
                        <div className="activity-icon">📝</div>
                        <div>
                          <div style={{ fontSize: '0.95rem' }}><strong>{ev.studentName}</strong> reviewed <strong>{ev.courseCode}</strong></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Rated {ev.rating}/5 • {ev.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'all-feedback' && (
          <div>
            <header className="page-header">
              <h2>All Student Feedbacks</h2>
              <p>Unfiltered chronological list of all course evaluations submitted.</p>
            </header>
            {evaluations.length === 0
              ? <div className="empty-state">No evaluations have been submitted to the system yet.</div>
              : evaluations.map(ev => <ReviewCard key={ev.id} ev={ev} />)
            }
          </div>
        )}

        {currentView === 'dashboard' && (
          <div>
            <header className="page-header">
              <h2>Student Dashboard</h2>
              <p>Track your end-of-semester course evaluation progress.</p>
            </header>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div className="card-title">Completion Status</div>
                  <div style={{ display: 'flex', gap: '3rem', margin: '1rem 0' }}>
                    <div>
                      <h1 style={{ fontSize: '3rem', color: 'var(--success)', lineHeight: '1' }}>{myEvaluations.length}</h1>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500' }}>Submitted</p>
                    </div>
                    <div>
                      <h1 style={{ fontSize: '3rem', color: 'var(--warning)', lineHeight: '1' }}>{pendingCourses.length}</h1>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500' }}>Pending</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Action Required</div>
                  {pendingCourses.length === 0 ? (
                    <div style={{ padding: '1rem 0', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎉</span> You are completely caught up!
                    </div>
                  ) : (
                    pendingCourses.map(course => (
                      <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem' }}>{course.code}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course.prof}</div>
                        </div>
                        <button onClick={() => { setSelectedCourseId(course.id); setCurrentView('give-feedback'); }} className="badge primary" style={{ cursor: 'pointer', border: 'none' }}>
                          Review Course
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '700' }}>My Submitted Reviews</h3>
                {myEvaluations.length === 0
                  ? <div className="empty-state">You haven't submitted any evaluations yet.</div>
                  : myEvaluations.map(ev => <ReviewCard key={ev.id} ev={ev} />)
                }
              </div>
            </div>
          </div>
        )}

        {currentView === 'give-feedback' && (
          <div>
            <header className="page-header" style={{ textAlign: 'center' }}>
              <h2>Evaluate a Course</h2>
              <p>Your honest feedback helps improve the curriculum for future students.</p>
            </header>
            <form onSubmit={submitFeedback} className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div className="form-group" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <label className="form-label" style={{ textAlign: 'center', fontSize: '1.1rem' }}>Select Course</label>
                <select className="form-control" style={{ textAlign: 'center' }} value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                  <option value="">-- Choose a course to evaluate --</option>
                  {pendingCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name} ({course.prof})</option>
                  ))}
                </select>
              </div>
              <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />
              <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>1. Course Logistics</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Attendance</label>
                  <select className="form-control" value={attendance} onChange={(e) => setAttendance(e.target.value)}>
                    <option>Always</option><option>Mostly</option><option>Sometimes</option><option>Rarely</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time Spent (Outside Class)</label>
                  <select className="form-control" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)}>
                    <option>&lt; 3 hours/week</option><option>3-6 hours/week</option><option>7-10 hours/week</option><option>10+ hours/week</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Grade</label>
                  <select className="form-control" value={expectedGrade} onChange={(e) => setExpectedGrade(e.target.value)}>
                    <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option><option>Pass/Fail</option>
                  </select>
                </div>
              </div>
              <h4 style={{ margin: '1.5rem 0', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>2. Academic Evaluation</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Difficulty</label>
                  <select className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Very Easy</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Very Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Instructor Quality</label>
                  <select className="form-control" value={instructorQuality} onChange={(e) => setInstructorQuality(e.target.value)}>
                    <option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grading Fairness</label>
                  <select className="form-control" value={gradingFairness} onChange={(e) => setGradingFairness(e.target.value)}>
                    <option>Very Fair</option><option>Fair</option><option>Somewhat Unfair</option><option>Unfair</option>
                  </select>
                </div>
              </div>
              <hr style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />
              <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', textAlign: 'center' }}>3. Final Verdict</h4>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label">Overall Rating</label>
                <div style={{ background: 'var(--pill-bg)', display: 'inline-block', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <StarRating rating={rating} setRating={setRating} interactive={true} />
                </div>
              </div>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label">Would you recommend this course to others?</label>
                <select className="form-control" style={{ maxWidth: '200px', margin: '0 auto' }} value={recommend} onChange={(e) => setRecommend(e.target.value)}>
                  <option>Yes</option><option>No</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Comments</label>
                <textarea className="form-control" rows="5" placeholder="What were the strengths of this course? How could the professor improve?" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>Submit Secure Evaluation</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}