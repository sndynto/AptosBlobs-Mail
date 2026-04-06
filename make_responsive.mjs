import { readFileSync, writeFileSync } from 'fs';

let t = readFileSync('src/LandingPage.tsx', 'utf8');

// 1. Navbar padding
t = t.replace(
  "padding: '0 40px',\n        height: 68,",
  "height: 68,"
);
t = t.replace(
  "<nav style={{",
  "<nav className=\"landing-nav\" style={{"
);

// 2. Navlinks
t = t.replace(
  "        {/* Nav Links */}\n        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>",
  "        {/* Nav Links */}\n        <div className=\"landing-nav-links\" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>"
);

// 3. Hero padding and gap
t = t.replace(
  "padding: '120px 40px 80px'",
  "/* padding from css */"
);
t = t.replace(
  "position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '/* padding from css */', width: '100%'",
  "position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%'"
);
t = t.replace(
  "<div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>",
  "<div className=\"landing-hero-container\" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>"
);

t = t.replace(
  "<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap' }}>",
  "<div className=\"landing-hero-content\" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>"
);

// 4. Stats section padding
t = t.replace(
  "padding: '80px 40px', borderTop: '1px solid rgba(240,64,176,0.1)'",
  "borderTop: '1px solid rgba(240,64,176,0.1)'"
);
t = t.replace(
  "section ref={statsRef} style={{ borderTop: '1px solid rgba(240,64,176,0.1)', borderBottom: '1px solid rgba(240,64,176,0.1)'",
  "section className=\"landing-stats-section\" ref={statsRef} style={{ borderTop: '1px solid rgba(240,64,176,0.1)', borderBottom: '1px solid rgba(240,64,176,0.1)'"
);

// 5. Stats grid
t = t.replace(
  "display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40",
  "display: 'grid'"
);
t = t.replace(
  "<div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid' }}>",
  "<div className=\"landing-stats-grid\" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid' }}>"
);

// 6. Features section padding
t = t.replace(
  "section id=\"features\" style={{ padding: '120px 40px' }}",
  "section id=\"features\" className=\"landing-section\" style={{}}"
);

// 7. How it works section padding
t = t.replace(
  "section id=\"how-it-works\" style={{ padding: '120px 40px', background: 'rgba(16,8,24,0.6)', position: 'relative', overflow: 'hidden' }}",
  "section id=\"how-it-works\" className=\"landing-section\" style={{ background: 'rgba(16,8,24,0.6)', position: 'relative', overflow: 'hidden' }}"
);
// Steps grid gap
t = t.replace(
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, position: 'relative'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', position: 'relative'"
);
t = t.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', position: 'relative' }}>",
  "<div className=\"landing-steps-grid\" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', position: 'relative' }}>"
);

// 8. Security section padding
t = t.replace(
  "section id=\"security\" style={{ padding: '120px 40px' }}",
  "section id=\"security\" className=\"landing-section\" style={{}}"
);
t = t.replace(
  "display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap'",
  "display: 'flex', alignItems: 'center', flexWrap: 'wrap'"
);
t = t.replace(
  "<div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>",
  "<div className=\"landing-security-content\" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>"
);

// 9. Tech stack padding
t = t.replace(
  "section style={{ padding: '80px 40px', background: 'rgba(16,8,24,0.5)', borderTop: '1px solid rgba(240,64,176,0.08)', borderBottom: '1px solid rgba(240,64,176,0.08)' }}",
  "section className=\"landing-stack-section\" style={{ background: 'rgba(16,8,24,0.5)', borderTop: '1px solid rgba(240,64,176,0.08)', borderBottom: '1px solid rgba(240,64,176,0.08)' }}"
);
t = t.replace(
  "justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap'",
  "justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'"
);
t = t.replace(
  "<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>",
  "<div className=\"landing-stack-grid\" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>"
);


// 10. CTA section padding
t = t.replace(
  "section style={{ padding: '140px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}",
  "section className=\"landing-cta-section\" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}"
);


// 11. Footer padding
t = t.replace(
  "footer style={{ padding: '40px', borderTop: '1px solid rgba(240,64,176,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}",
  "footer className=\"landing-footer\" style={{ borderTop: '1px solid rgba(240,64,176,0.1)', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}"
);


// APPEND CSS TO STYLE TAG
const cssClasses = `
        /* Responsive Classes */
        .landing-nav { padding: 0 40px; }
        .landing-hero-container { padding: 120px 40px 80px; }
        .landing-hero-content { gap: 60px; }
        .landing-stats-section { padding: 80px 40px; }
        .landing-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .landing-section { padding: 120px 40px; }
        .landing-steps-grid { gap: 24px; }
        .landing-security-content { gap: 80px; }
        .landing-stack-section { padding: 80px 40px; }
        .landing-stack-grid { gap: 48px; }
        .landing-cta-section { padding: 140px 40px; }
        .landing-footer { padding: 40px; justify-content: space-between; flex-direction: row; gap: 20px; }

        /* Tablet: 768px - 1199px */
        @media screen and (max-width: 1199px) {
          .landing-nav { padding: 0 32px; }
          .landing-hero-container { padding: 100px 32px 60px; }
          .landing-stats-section { padding: 60px 32px; }
          .landing-section { padding: 100px 32px; }
          .landing-security-content { gap: 40px; }
          .landing-cta-section { padding: 100px 32px; }
        }
        
        /* Mobile: < 768px */
        @media screen and (max-width: 767px) {
          .landing-nav-links { display: none !important; }
          .landing-nav { padding: 0 20px; }
          .landing-hero-container { padding: 80px 20px 40px; }
          .landing-hero-content { gap: 40px; flex-direction: column; text-align: center; }
          .landing-stats-section { padding: 60px 20px; }
          .landing-stats-grid { grid-template-columns: 1fr; gap: 32px; }
          .landing-section { padding: 80px 20px; }
          .landing-steps-grid { gap: 40px; }
          .landing-security-content { gap: 40px; flex-direction: column; text-align: center; }
          .landing-stack-section { padding: 60px 20px; }
          .landing-stack-grid { gap: 32px; }
          .landing-cta-section { padding: 80px 20px; }
          .landing-footer { flex-direction: column; justify-content: center; gap: 16px; padding: 32px 20px; text-align: center; }
        }

        /* Small Mobile: < 480px */
        @media screen and (max-width: 479px) {
          .landing-nav { padding: 0 16px; }
          .landing-hero-container { padding: 60px 16px 30px; }
          .landing-stats-section { padding: 40px 16px; }
          .landing-section { padding: 60px 16px; }
          .landing-cta-section { padding: 60px 16px; }
          .landing-footer { padding: 24px 16px; }
        }
`;

t = t.replace("<style>{`", "<style>{`" + cssClasses);

writeFileSync('src/LandingPage.tsx', t, 'utf8');
console.log('done replacing layout inline styles with classes');
