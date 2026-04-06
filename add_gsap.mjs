import { readFileSync, writeFileSync } from 'fs';

let t = readFileSync('src/LandingPage.tsx', 'utf8');

// Imports
const imports = `import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
`;
t = t.replace("import { useWallet } from '@aptos-labs/wallet-adapter-react'", "import { useWallet } from '@aptos-labs/wallet-adapter-react'\n" + imports);

// Hook inside LandingPage
const gsapHook = `
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Hero Entrance
    gsap.from('.hero-headline', { y: 60, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.1 })
    gsap.from('.hero-desc', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
    gsap.from('.hero-ctas', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 })
    gsap.from('.hero-badges', { opacity: 0, duration: 1, delay: 0.8 })
    gsap.from('.hero-mockup', { x: 80, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.3 })

    // Scroll Sections
    gsap.utils.toArray('.landing-section').forEach((section) => {
      gsap.from(section, {
        scrollTrigger: { trigger: section, start: 'top 80%' },
        y: 60, opacity: 0, duration: 1, ease: 'power3.out'
      })
    })

    // Stats Grid Stagger
    gsap.from('.stat-card', {
      scrollTrigger: { trigger: '.landing-stats-section', start: 'top 85%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.5)'
    })

    // Features Stagger
    gsap.from('.feature-card', {
      scrollTrigger: { trigger: '#features', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
    })
    
    // Steps Stagger
    gsap.from('.step-card', {
      scrollTrigger: { trigger: '#how-it-works', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
    })
  }, { scope: containerRef })
`;

t = t.replace("const heroRef = useRef<HTMLDivElement>(null)", gsapHook + "\n  const heroRef = useRef<HTMLDivElement>(null)");

// Wrap returned JSX in containerRef
t = t.replace("<div style={{ fontFamily: \"'Inter', 'Segoe UI', sans-serif\", background: '#100a14', color: '#fff', overflowX: 'hidden' }}>", "<div ref={containerRef} style={{ fontFamily: \"'Inter', 'Segoe UI', sans-serif\", background: '#100a14', color: '#fff', overflowX: 'hidden' }}>");

// Classes
t = t.replace("<h1 style={{", "<h1 className=\"hero-headline\" style={{");
t = t.replace("<p style={{\n                fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.62)',", "<p className=\"hero-desc\" style={{\n                fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.62)',");
t = t.replace("<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>", "<div className=\"hero-ctas\" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>");
t = t.replace("<div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 48 }}>", "<div className=\"hero-badges\" style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>");
// Wait my previous exact match for badges was:
t = t.replace("<div style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>", "<div className=\"hero-badges\" style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>");

t = t.replace("            <div style={{ flex: '1 1 380px', maxWidth: 460 }}>", "            <div className=\"hero-mockup\" style={{ flex: '1 1 380px', maxWidth: 460 }}>");
t = t.replace("              <div\n                key={i}\n                onClick={() => setActiveFeature(i)}", "              <div className=\"feature-card\"\n                key={i}\n                onClick={() => setActiveFeature(i)}");
t = t.replace("            <div key={i} style={{ textAlign: 'center' }}>\n              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>", "            <div className=\"stat-card\" key={i} style={{ textAlign: 'center' }}>\n              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>");
t = t.replace("              <div key={i} style={{ textAlign: 'center', padding: '24px 20px' }}>\n                <div style={{", "              <div className=\"step-card\" key={i} style={{ textAlign: 'center', padding: '24px 20px' }}>\n                <div style={{");


writeFileSync('src/LandingPage.tsx', t, 'utf8');
console.log('done applying gsap animations');
