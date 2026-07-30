import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: 'Encrypted Wallet Mail',
    description: 'Encrypt messages in the browser and send them directly to any Aptos wallet using Shelby blob storage.',
    accent: 'from-violet-500 to-cyan-400',
  },
  {
    title: 'Aptos Finality',
    description: 'Every send is anchored on Aptos for verifiable proof of delivery and censorship resistance.',
    accent: 'from-fuchsia-500 to-rose-400',
  },
  {
    title: 'Scroll-driven Motion',
    description: 'Smooth scroll, pinned scenes, and animated reveals make the landing feel premium and immersive.',
    accent: 'from-cyan-400 to-blue-500',
  },
  {
    title: 'Modern Web3 Aesthetic',
    description: 'Dark glass surfaces, neon glow accents, and minimal layouts built for next-gen products.',
    accent: 'from-violet-600 to-indigo-500',
  },
]

const stickySteps = [
  {
    title: 'Connect Your Wallet',
    description: 'Use Aptos-compatible wallets to sign and manage secure Shelby messages with no centralized server.',
  },
  {
    title: 'Compose & Encrypt',
    description: 'Write your message, attach files, and encrypt everything before it leaves your browser.',
  },
  {
    title: 'Verify On-Chain',
    description: 'Shelby stores blobs while Aptos finalizes transactions for secure, verifiable delivery.',
  },
]

const showcaseItems = [
  { label: 'Inbox Preview', accent: 'bg-violet-500/10 border-violet-500/20' },
  { label: 'Wallet Flow', accent: 'bg-cyan-400/10 border-cyan-400/20' },
  { label: 'Privacy Layer', accent: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
  { label: 'Chain Proof', accent: 'bg-rose-500/10 border-rose-500/20' },
]

export default function PremiumLanding({ onEnterApp }: { onEnterApp?: () => void }) {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const showcaseRef = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      infinite: false,
      autoRaf: false,
    })

    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    lenis.on('scroll', ScrollTrigger.update)

    const cards = gsap.utils.toArray('.feature-card') as HTMLElement[]
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 40, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { y: 0 },
        {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }

    if (stickyRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyRef.current,
          start: 'top top',
          end: '+=1000',
          scrub: true,
          pin: stickyRef.current,
          anticipatePin: 1,
        },
      })
      tl.fromTo(
        '.sticky-card',
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.3 }
      )
    }

    if (showcaseRef.current) {
      const track = showcaseRef.current.querySelector('.showcase-track') as HTMLElement | null
      if (track) {
        const trackWidth = track.scrollWidth - window.innerWidth + 64
        gsap.to(track, {
          x: () => -trackWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: showcaseRef.current,
            start: 'top top',
            end: () => `+=${trackWidth + window.innerHeight * 0.6}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        })
      }
    }

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((instance) => instance.kill())
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 650)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />

      <header className="relative z-20 mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 shadow-soft backdrop-blur-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Premium Web3 Landing
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            <span className="font-semibold text-white">Aptos x Shelby</span>
            <span>•</span>
            <span>Interactive experience</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEnterApp?.()}
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          Launch App
        </button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-20 px-6 pb-24 pt-12 md:px-10">
        <section ref={heroRef} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-soft backdrop-blur-2xl md:p-12">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_28%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-violet-200 shadow-glow backdrop-blur-xl">
                Secure wallet messaging
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                Future-ready Web3 messaging for Aptos wallets.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Send encrypted messages as Shelby blobs, anchor proof on Aptos, and feel a premium motion-first landing page tuned for Web3 audiences.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => onEnterApp?.()}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                >
                  Open dashboard
                </button>
                <a href="#features" className="rounded-full border border-white/15 px-7 py-3 text-sm text-slate-100 transition hover:border-violet-300/40 hover:text-white">
                  Explore features
                </a>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-neon backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />
              <div className="relative grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-6">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>To: 0x1a2b...4c5d</span>
                  <span>09:42</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-white/5 p-5 text-white shadow-glow">
                    <p className="text-sm uppercase tracking-[0.18em] text-violet-200">DeFi Yield Update</p>
                    <p className="mt-3 text-sm text-slate-300">Encrypted update sent directly to your wallet on Aptos.</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-5 text-white shadow-glow">
                    <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">DAO Proposal #47</p>
                    <p className="mt-3 text-sm text-slate-300">High-integrity communication for decentralized coordination.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="feature-card relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-8 shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className={`absolute left-6 top-6 h-1.5 w-24 rounded-full bg-gradient-to-r ${feature.accent}`} />
              <div className="relative space-y-5 pt-5">
                <h2 className="text-2xl font-semibold text-white">{feature.title}</h2>
                <p className="text-sm leading-7 text-slate-300">{feature.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">Smooth scroll</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Neon glow</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Glass UI</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-soft backdrop-blur-2xl md:p-12" ref={stickyRef}>
          <div className="grid gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:items-start">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/10 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-violet-100">
                Sticky narrative
              </span>
              <h2 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Pinned content with step-based storytelling.</h2>
              <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Scroll through polished sections while the visual panel stays pinned and transitions smoothly with the flow.
              </p>
            </div>
            <div className="space-y-5">
              {stickySteps.map((step, index) => (
                <div key={step.title} className="sticky-card rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-slate-200 shadow-soft transition duration-500">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Step {index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={showcaseRef} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-soft backdrop-blur-2xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Pinned showcase</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Horizontal reveal for product highlights.</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              Scroll horizontally
            </div>
          </div>
          <div className="showcase-track flex gap-6 pb-6">
            {showcaseItems.map((item) => (
              <div
                key={item.label}
                className={`min-h-[320px] min-w-[320px] rounded-[2rem] border border-white/10 p-8 text-white shadow-soft ${item.accent}`}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                  Preview
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{item.label}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Sleek panels, blurred glass layers, and refined motion for a premium presentation.
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-slate-200 shadow-soft backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">AptosBlobs Landing</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Built to feel immersive, responsive, and polished for modern Web3 users with subtle motion and refined dark UI.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#" className="transition hover:text-white">Docs</a>
              <a href="#" className="transition hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </main>

      <div className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/95 transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-glow backdrop-blur-xl">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse" />
          </div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Loading premium experience</p>
        </div>
      </div>
    </div>
  )
}
