// pages/LandingPage.jsx
// -----------------------------------------------------------------------------
// Public landing page for MedAssist Clinic Management & Operations Portal.
// Features: Interactive timed slideshow in the hero section, authentic medical
// imagery (nanobanana), solid accessible clinical palette (zero gradients),
// and 1-click interactive demo role switcher.
// -----------------------------------------------------------------------------

import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useState, useEffect, useRef } from 'react';

const DEMO_PERSONAS = [
  { role: 'admin', label: 'Clinic Admin', name: 'Ada Admin', email: 'ada.admin+admin@medassist.dev', desc: 'Full system control, users & audit logs' },
  { role: 'doctor', label: 'Doctor', name: 'Dr. Aryan Mehta', email: 'dr.aryan.mehta+doctor@medassist.dev', desc: 'EHR, clinical notes & prescriptions' },
  { role: 'receptionist', label: 'Receptionist', name: 'Riya Reception', email: 'riya.reception+receptionist@medassist.dev', desc: 'Patient check-in, queue & billing' },
  { role: 'lab', label: 'Lab Technician', name: 'Lab Lavanya', email: 'lab.lavanya+lab@medassist.dev', desc: 'Sample tracking & diagnostic reports' },
  { role: 'patient', label: 'Patient', name: 'Aarav Sharma', email: 'aarav.sharma+patient@medassist.dev', desc: 'Personal timeline, appointments & Rx' },
];

const HERO_SLIDES = [
  {
    id: 'triage',
    image: '/images/hero.jpg',
    category: 'Clinical Operations',
    title: 'MedAssist Central Clinic',
    subtitle: 'Multidisciplinary care coordination & real-time telemetry',
    status: 'Queue Active',
    statusColor: 'bg-emerald-500',
  },
  {
    id: 'consult',
    image: '/images/consultation.jpg',
    category: 'Consultation Room',
    title: 'Physician EHR & AI Summaries',
    subtitle: 'Structured visit notes with instant non-diagnostic patient summaries',
    status: 'In Consultation',
    statusColor: 'bg-teal-500',
  },
  {
    id: 'reception',
    image: '/images/reception.jpg',
    category: 'Front Desk',
    title: 'Smart Reception & Triage',
    subtitle: 'Digital token dispensing, walk-in management, and check-in kiosks',
    status: 'Triage Ready',
    statusColor: 'bg-amber-500',
  },
  {
    id: 'pathology',
    image: '/images/lab.jpg',
    category: 'Pathology Lab',
    title: 'Automated Diagnostic Analyzer',
    subtitle: 'Sample collection, verification, and critical range alerting',
    status: 'Lab Processing',
    statusColor: 'bg-blue-500',
  },
  {
    id: 'pharmacy',
    image: '/images/pharmacy.jpg',
    category: 'Clinical Pharmacy',
    title: 'Digital Prescriptions & Billing',
    subtitle: 'Barcode verified medication dispensing and automated itemized billing',
    status: 'Verified Rx',
    statusColor: 'bg-emerald-500',
  },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const SLIDE_DURATION = 4500; // 4.5s per slide

  // Fully automatic continuous timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }

  const active = HERO_SLIDES[current];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
      {/* Top Slide Category Pills */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600 no-scrollbar">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`rounded-md px-2 py-0.5 transition-colors shrink-0 ${
                idx === current
                  ? 'bg-brand-700 text-white font-bold shadow-subtle'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {s.category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Main Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-slate-900">
        {HERO_SLIDES.map((s, idx) => (
          <img
            key={s.id}
            src={s.image}
            alt={s.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        ))}

        {/* Slide Info Overlay Card (Solid white, zero gradients) */}
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-subtle backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-slate-900">{active.title}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 border border-slate-200">
              <span className={`h-1.5 w-1.5 rounded-full ${active.statusColor}`} />
              {active.status}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">{active.subtitle}</div>

          {/* Timed Progress Bar (Solid Brand Teal) */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 transition-colors"
                aria-label={`Jump to slide ${idx + 1}`}
              >
                {idx === current ? (
                  <div
                    key={current}
                    className="h-full bg-brand-700 animate-[progress_4.5s_linear]"
                  />
                ) : (
                  <div className={`h-full ${idx < current ? 'bg-brand-900/30' : 'bg-transparent'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, token, login, loading } = useAuthStore();
  const [loggingRole, setLoggingRole] = useState(null);

  async function handleQuickLogin(email) {
    try {
      setLoggingRole(email);
      await login(email, 'password123');
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setLoggingRole(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-subtle">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">MedAssist</span>
              <span className="ml-2 hidden rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 sm:inline-block border border-brand-200">
                Clinic Operations
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#roles" className="hover:text-slate-900 transition-colors">Role Portals</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Clinical Workflow</a>
          </nav>

          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="btn btn-primary flex items-center gap-2"
              >
                <span>Dashboard ({user?.role})</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline text-xs sm:text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary text-xs sm:text-sm">
                  Register Patient
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Solid Colors & Interactive Timed Slideshow */}
      <section className="relative border-b border-slate-200 bg-white py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live MERN Clinical Management Platform
              </div>

              <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
                Intelligent operations for modern healthcare clinics.
              </h1>

              <p className="mt-5 text-base text-slate-600 sm:text-lg max-w-2xl leading-relaxed">
                Coordinate appointments, electronic health records, diagnostic laboratory orders, prescriptions, and billing in one unified system. Built with zero friction, rigorous data validation, and AI-enabled clinician assistance.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link to="/login" className="btn btn-primary btn-lg">
                  Access Portal
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <a href="#roles" className="btn btn-outline btn-lg">
                  Test Demo Roles
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-left">
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900">5 Roles</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Admin, Doctor, Desk, Lab, Patient</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-brand-700">100% Solid</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">High-contrast accessibility palette</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-emerald-700">Real Data</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Connected to MongoDB Atlas</div>
                </div>
              </div>
            </div>

            {/* Right Hero Timed Slideshow Component */}
            <div className="lg:col-span-5">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick-Demo Roles Selector */}
      <section id="roles" className="border-b border-slate-200 bg-slate-100/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
              Interactive Test Drive
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">
              Try the platform as any clinic role
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Click any role below to instantly authenticate into the live database with pre-configured mock data.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DEMO_PERSONAS.map((p) => {
              const isCurrent = user?.email === p.email;
              const isSigning = loggingRole === p.email;
              return (
                <div
                  key={p.role}
                  className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-card transition-all hover:border-brand-500 ${
                    isCurrent ? 'ring-2 ring-brand-700 border-brand-700' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {p.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-slate-900">{p.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-normal">{p.desc}</p>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(p.email)}
                    disabled={loading || isSigning}
                    className="btn btn-outline btn-sm mt-5 w-full justify-center font-medium"
                  >
                    {isSigning ? 'Switching…' : isCurrent ? 'Open Workspace' : `Login as ${p.label}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Bento Grid with Real Clinic Photos */}
      <section id="features" className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Clinical Architecture
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Complete end-to-end healthcare workflow
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Engineered with clean architectural separation between front desk reception, consulting physicians, clinical pathologists, and patient self-service.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Reception Desk */}
            <div className="card overflow-hidden flex flex-col justify-between">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src="/images/reception.jpg"
                  alt="Clinic reception desk and check-in"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200 mb-2">
                    Front Desk & Triage
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Smart Queue & Walk-In Intake
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Automated token generation, doctor slot availability, and patient queue reordering for minimal waiting time.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-brand-700">
                  Live Queue Management →
                </div>
              </div>
            </div>

            {/* Card 2: EHR & Clinical Notes */}
            <div className="card overflow-hidden flex flex-col justify-between">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src="/images/consultation.jpg"
                  alt="Doctor consulting patient with digital records"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200 mb-2">
                    Doctor & EHR
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Clinical Notes & AI Summaries
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Physicians document chief complaints and diagnoses. AI generates clear visit summaries and patient explanations.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-brand-700">
                  SOAP Electronic Health Records →
                </div>
              </div>
            </div>

            {/* Card 3: Pathology & Diagnostics */}
            <div className="card overflow-hidden flex flex-col justify-between">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src="/images/lab.jpg"
                  alt="Modern clinical pathology laboratory diagnostic workflow"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200 mb-2">
                    Diagnostics & Lab
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Laboratory Investigations
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Track orders through sample collection, processing, and laboratory verification with parameter alert limits.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-brand-700">
                  Pathology Verification →
                </div>
              </div>
            </div>

            {/* Card 4: Clinical Pharmacy & Billing */}
            <div className="card overflow-hidden flex flex-col justify-between">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src="/images/pharmacy.jpg"
                  alt="Clinical pharmacy medication dispensing"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-2">
                    Pharmacy & Invoicing
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Prescriptions & Invoices
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Digital prescription dispatch with plain-language instructions, automated itemized billing, and receipt generation.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] font-semibold text-brand-700">
                  Transparent Billing Counter →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section id="architecture" className="border-b border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Enterprise Reliability & Clean Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed according to strict REST principles, immutable audit trails, and predictable state transitions.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold">
                1
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900">Strict Schema Validation</h3>
              <p className="mt-1 text-xs text-slate-600 leading-normal">
                Every request payload is verified via Zod on the server before database persistence, preventing malformed medical data.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold">
                2
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900">Role-Based Access Control</h3>
              <p className="mt-1 text-xs text-slate-600 leading-normal">
                Granular route guards isolate sensitive patient clinical history, invoices, and user management to authorized personnel.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold">
                3
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900">Immutable Audit Logs</h3>
              <p className="mt-1 text-xs text-slate-600 leading-normal">
                All patient updates, note revisions, and authentication events append to an audit trail recording actor, IP, and timestamp.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold">
                4
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900">Printable Clinical Reports</h3>
              <p className="mt-1 text-xs text-slate-600 leading-normal">
                Direct export to printer-friendly clean medical summaries, invoices, and lab requisition slips without UI chrome clutter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MedAssist Clinic Management</span>
            <span>·</span>
            <span>MERN Stack Capstone</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/login" className="hover:text-slate-900">Staff Portal</Link>
            <Link to="/register" className="hover:text-slate-900">Patient Registration</Link>
            <Link to="/dashboard" className="hover:text-slate-900">Direct Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
