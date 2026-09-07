"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Award,
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
  ArrowRight,
  User,
  Sparkles,
  LayoutDashboard,
  Lock,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { POPULAR_SCHOOLS } from "@/lib/schools-data";
import { MicrochipGraphic, CircuitBoardBg, HardwareSensorIcon } from "@/components/HardwareGraphics";
import { getExamWindowInfo, EXAM_WINDOW } from "@/lib/exam-window";
import { TRANSLATIONS } from "@/lib/translations";

// Live Countdown Timer component
function CountdownTimer({ msUntilStart }: { msUntilStart: number }) {
  const [remaining, setRemaining] = useState(msUntilStart);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const totalSecs = Math.floor(remaining / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-3 justify-center flex-wrap">
      {[
        { label: "Days", value: days },
        { label: "Hours", value: hours },
        { label: "Mins", value: mins },
        { label: "Secs", value: secs },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="text-center bg-blue-900/60 backdrop-blur px-5 py-3 rounded-2xl border border-blue-500/30 min-w-[72px]"
        >
          <span className="text-3xl font-black text-white font-mono">{pad(value)}</span>
          <span className="text-[10px] text-blue-300 font-bold block uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  // Registration form state (Name, School, Class, Medium)
  const [name, setName] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [customSchool, setCustomSchool] = useState("");
  const [className, setClassName] = useState("Class 10");
  const [medium, setMedium] = useState<"ENGLISH" | "MALAYALAM">("ENGLISH");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [windowInfo, setWindowInfo] = useState(getExamWindowInfo());

  const t = medium === "MALAYALAM" ? TRANSLATIONS.ml : TRANSLATIONS.en;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});

    const fetchPortalStatus = () => {
      fetch("/api/admin/portal-status")
        .then((r) => r.json())
        .then((d) => {
          if (d.windowInfo) setWindowInfo(d.windowInfo);
        })
        .catch(() => {
          setWindowInfo(getExamWindowInfo());
        });
    };

    fetchPortalStatus();
    const interval = setInterval(fetchPortalStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const canTakeExam = windowInfo.isOpen || isAdmin;

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(medium === "MALAYALAM" ? "പൂർണ്ണ നാമം നൽകുക." : "Please enter your full name.");
      return;
    }

    const finalSchool =
      selectedSchool === "OTHER"
        ? customSchool.trim()
        : selectedSchool.trim();

    if (!finalSchool) {
      setError(
        medium === "MALAYALAM"
          ? "സ്കൂളിന്റെ പേര് തിരഞ്ഞെടുക്കുകയോ രേഖപ്പെടുത്തുകയോ ചെയ്യുക."
          : "Please select or enter your school name."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          schoolName: finalSchool,
          className,
          medium,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initiate exam registration.");
        setLoading(false);
        return;
      }

      // Route directly to exam taking screen
      router.push(`/exams/${data.examId}/take`);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Top Hero Banner with Hardware Hackathon Graphics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/40">
        <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t.hardwareTag}
            </div>

            <div className="space-y-1">
              <span className="text-amber-400 font-extrabold text-sm sm:text-base uppercase tracking-widest block">
                NIRMITI 2026
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {t.portalTitle}
              </h1>
            </div>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Test your knowledge with <b>25 randomly selected questions</b> from our 1,000-question repository. Total duration: <b>8 minutes</b>. Top 2 students from each school advance to the finals!
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-900/60 border border-blue-700/50 text-blue-200 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {t.durationBadge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 font-semibold">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                {t.questionsBadge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t.autoSubmitBadge}
              </span>
            </div>

            {/* Direct Action Buttons: Demo Exam & Admin Portal */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                🧪 Try 25-Question Practice Demo Exam (English / മലയാളം)
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Administrator Portal (View School Toppers)
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-300" />
                  Examiner / Admin Login
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block flex-shrink-0">
            <MicrochipGraphic className="w-28 h-28 opacity-85" />
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* EXAM WINDOW: UPCOMING NOTICE */}
      {windowInfo.status === "UPCOMING" && !isAdmin && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-12 text-center space-y-6 border border-indigo-800/40 shadow-2xl">
          <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-30" />
          <div className="relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto">
              <CalendarClock className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">Examination Opens Soon!</h2>
              <p className="text-blue-200 text-sm max-w-xl mx-auto">
                The official examination portal will be accessible on{" "}
                <b>September 9, 2026, from 10:00 AM to 10:00 PM IST</b> only.
              </p>
            </div>
            <CountdownTimer msUntilStart={windowInfo.msUntilStart} />
            <div className="pt-2">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Take Demo Practice Exam While Waiting
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* EXAM WINDOW: CLOSED NOTICE */}
      {windowInfo.status === "CLOSED" && !isAdmin && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 sm:p-12 text-center space-y-5 border border-slate-700 shadow-2xl">
          <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-20" />
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Examination Window Closed</h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              The NIRMITI 2026 examination window has concluded.
            </p>
            <p className="text-xs text-slate-400">
              All responses are safely locked. The Top 2 Finalists per school will be officially announced by the organizers.
            </p>
          </div>
        </div>
      )}

      {/* EXAM PORTAL ACTIVE OR ADMIN BYPASS */}
      {canTakeExam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Exam Rules & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {isAdmin && windowInfo.status !== "OPEN" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <b>Admin Bypass Active:</b> Testing allowed outside the scheduled window ({windowInfo.status}).
                </span>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                {t.rulesTitle}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.rule1Title}</strong>
                    <span>{t.rule1Desc}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.rule2Title}</strong>
                    <span>{t.rule2Desc}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.rule3Title}</strong>
                    <span>{t.rule3Desc}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.rule4Title}</strong>
                    <span>{t.rule4Desc}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
                  <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Kannur District Schools</strong>
                    <span>Open to all high school and higher secondary students representing institutions from Kannur District.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Candidate Entry Form (7 cols) - NAME, SCHOOL, CLASS, MEDIUM ONLY */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.regTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.regSubtitle}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartExam} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>

                {/* School Name Dropdown - 153 Kannur Schools */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    {t.schoolName}
                  </label>
                  <select
                    required
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition"
                  >
                    <option value="">-- Select Your School (Kannur District) --</option>
                    {POPULAR_SCHOOLS.map((school, i) => (
                      <option key={i} value={school}>
                        {school}
                      </option>
                    ))}
                    <option value="OTHER">{t.otherSchoolOption}</option>
                  </select>

                  {/* Custom School Input if "OTHER" selected */}
                  {selectedSchool === "OTHER" && (
                    <div className="pt-2">
                      <input
                        type="text"
                        required
                        value={customSchool}
                        onChange={(e) => setCustomSchool(e.target.value)}
                        placeholder={t.customSchoolPlaceholder}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Class & Medium in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Class / Standard */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      {t.classGrade}
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition"
                    >
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>

                  {/* Medium of Exam */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      {t.mediumLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setMedium("ENGLISH")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                          medium === "ENGLISH"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {t.englishMedium}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMedium("MALAYALAM")}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                          medium === "MALAYALAM"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {t.malayalamMedium}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CTA Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
                  >
                    {loading ? t.preparingExam : t.startExamBtn}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Admin Access Link */}
      <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-2">
        <p>
          NIRMITI 2026 — DISTRICT LEVEL STUDENTS HARDWARE HACKATHON &nbsp;|&nbsp; Kannur District
        </p>
        <p>
          Examiner / Administrator Access:{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-bold">
            admin@exam.com (Sign In)
          </Link>
        </p>
      </footer>
    </div>
  );
}
