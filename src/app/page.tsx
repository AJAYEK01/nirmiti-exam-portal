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
  Phone,
  Mail,
  FileText,
  FileCheck,
  Globe,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { POPULAR_SCHOOLS } from "@/lib/schools-data";
import {
  MicrochipGraphic,
  CircuitBoardBg,
  HardwareSensorIcon,
  HardwareRoboticsIcon,
  TrophyIcon,
  TargetIcon,
  StageStepIcon,
  PinIcon,
} from "@/components/HardwareGraphics";
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
  const [className, setClassName] = useState("Class 8");
  const [division, setDivision] = useState("A");
  const [medium, setMedium] = useState<"ENGLISH" | "MALAYALAM">("ENGLISH");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [windowInfo, setWindowInfo] = useState(getExamWindowInfo());
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);

  const t = medium === "MALAYALAM" ? TRANSLATIONS.ml : TRANSLATIONS.en;

  useEffect(() => {
    // Check if this browser already submitted an exam
    try {
      if (localStorage.getItem("nirmiti_submitted_exam") === "true") {
        setHasAlreadySubmitted(true);
      }
    } catch {}

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        if (d.user && d.user.role === "STUDENT") {
          // Check if candidate already has an attempt
          fetch("/api/auth/register-candidate/status").catch(() => {});
        }
      })
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

    if (!division.trim()) {
      setError(
        medium === "MALAYALAM"
          ? "ദയവായി നിങ്ങളുടെ ഡിവിഷൻ രേഖപ്പെടുത്തുക (ഉദാ: A, B, C)."
          : "Please enter your class division (e.g. A, B, C)."
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
          className: `${className} - Div ${division}`,
          division,
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

            <div className="space-y-2">
              <p className="text-amber-300 font-bold text-xs sm:text-sm tracking-wide">
                Usizo Solutions Private Limited in association with IEDC GCE Kannur &amp; Little KITEs presents
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                നിർമിതി (NIRMITI) — ഹൈസ്കൂൾ ഹാർഡ്‌വെയർ ഹാക്കത്തോൺ
              </h1>
            </div>

            <p className="text-slate-200 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              ഹൈസ്കൂൾ വിദ്യാർത്ഥികളുടെ ശാസ്ത്ര-സാങ്കേതിക ആശയങ്ങളെ യഥാർത്ഥ പ്രോജക്റ്റുകളാക്കി മാറ്റാൻ ഇതാ ഒരു സുവർണ്ണാവസരം. ആദ്യ ഘട്ട ഓൺലൈൻ സ്ക്രീനിംഗ് പരീക്ഷയിൽ പങ്കെടുക്കൂ!
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
                Try 25-Question Practice Demo Exam (English / മലയാളം)
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Administrator Portal (View School Toppers)
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

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.rule5Title}</strong>
                    <span>{t.rule5Desc}</span>
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

              {/* Already Submitted Notice */}
              {hasAlreadySubmitted && !isAdmin ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-emerald-950">
                    {medium === "MALAYALAM"
                      ? "നിങ്ങൾ പരീക്ഷ വിജയകരമായി പൂർത്തിയാക്കി!"
                      : "Examination Already Completed!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                    {medium === "MALAYALAM"
                      ? "ഈ ഉപകരണത്തിൽ നിന്ന് പരീക്ഷ രേഖപ്പെടുത്തി സുരക്ഷിതമായി സമർപ്പിച്ചിരിക്കുന്നു. സ്കൂൾ തിരിച്ചുള്ള ഫലങ്ങൾ സംഘാടകർ ഔദ്യോഗികമായി പ്രഖ്യാപിക്കുന്നതാണ്."
                      : "Your responses have been successfully submitted and locked. School-wise winners will be officially announced by the organizers."}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/submitted"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                    >
                      <FileCheck className="w-4 h-4" />
                      {medium === "MALAYALAM" ? "രസീത് കാണുക" : "View Submission Receipt"}
                    </Link>
                  </div>
                </div>
              ) : (
                <>
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

                {/* Class, Division & Medium in responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Class / Standard (8, 9, 10 only) */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      {t.classGrade}
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition font-medium"
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>

                  {/* Division (Manual Entry) */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {t.divisionLabel}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={division}
                      onChange={(e) => setDivision(e.target.value.toUpperCase())}
                      placeholder={t.divisionPlaceholder || "e.g. A"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition font-bold uppercase tracking-wider text-center"
                    />
                  </div>

                  {/* Medium of Exam */}
                  <div className="sm:col-span-5 space-y-1">
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MALAYALAM EVENT DESCRIPTION & DETAILS SECTION (ZERO EMOJIS, PURE SVG) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-blue-800/40 shadow-2xl relative overflow-hidden space-y-8">
        <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" />

        {/* Section Intro */}
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold backdrop-blur-sm">
            <HardwareRoboticsIcon className="w-4 h-4 text-amber-400" />
            ഹാക്കത്തോൺ വിവരങ്ങൾ (Event Overview)
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            നിങ്ങൾ ഒരു ഹൈസ്കൂൾ വിദ്യാർഥിയാണോ? എങ്കിൽ നിങ്ങൾക്ക് ഇതാ ഒരു അവസരം!
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
            ഹൈസ്കൂൾ വിദ്യാർത്ഥികളുടെ ശാസ്ത്ര-സാങ്കേതിക ആശയങ്ങളെ യഥാർത്ഥ പ്രോജക്റ്റുകളാക്കി മാറ്റാൻ ഇതാ ഒരു സുവർണ്ണാവസരം. Usizo Solutions Private Limited in association with IEDC GCE Kannur &amp; Little KITEs presents <b>നിർമിതി (NIRMITI) — ഹൈസ്കൂൾ ഹാർഡ്‌വെയർ ഹാക്കത്തോൺ</b>.
          </p>
        </div>

        {/* Key Highlights Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>ആർക്കൊക്കെ പങ്കെടുക്കാം?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              8, 9, 10 ക്ലാസുകളിൽ പഠിക്കുന്ന കണ്ണൂർ ജില്ലയിലെ ഏതൊരു ഹൈസ്കൂൾ വിദ്യാർത്ഥിക്കും പങ്കെടുക്കാം.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>രജിസ്ട്രേഷൻ ഫീസ്</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              പൂർണ്ണമായും സൗജന്യം. വിദ്യാർത്ഥികൾക്ക് യാതൊരുവിധ ഫീസും നൽകേണ്ടതില്ല.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <PinIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>ഗ്രാൻഡ് ഫിനാലെ വേദി</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ഗവൺമെന്റ് എഞ്ചിനീയറിംഗ് കോളേജ്, കണ്ണൂർ (GCE Kannur Campus).
            </p>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
          <div className="flex items-center gap-2.5">
            <TrophyIcon className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <h3 className="text-lg font-black text-white">
              സമ്മാനങ്ങൾ (Prizes &amp; Awards)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-gradient-to-b from-amber-500/20 to-transparent p-4 rounded-xl border border-amber-400/30">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">ഒന്നാം സമ്മാനം</span>
              <span className="text-2xl font-black text-white block mt-1">₹10,000</span>
              <span className="text-[11px] text-amber-200 block">+ ട്രോഫി (Trophy)</span>
            </div>
            <div className="bg-gradient-to-b from-slate-400/20 to-transparent p-4 rounded-xl border border-slate-300/30">
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">രണ്ടാം സമ്മാനം</span>
              <span className="text-2xl font-black text-white block mt-1">₹7,000</span>
              <span className="text-[11px] text-slate-200 block">+ ട്രോഫി (Trophy)</span>
            </div>
            <div className="bg-gradient-to-b from-amber-700/20 to-transparent p-4 rounded-xl border border-amber-600/30">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">മൂന്നാം സമ്മാനം</span>
              <span className="text-2xl font-black text-white block mt-1">₹3,000</span>
              <span className="text-[11px] text-amber-300 block">+ ട്രോഫി (Trophy)</span>
            </div>
          </div>
          <p className="text-center text-xs text-blue-200 font-medium">
            ഫൈനലിൽ പങ്കെടുക്കുന്ന എല്ലാ വിദ്യാർത്ഥികൾക്കും മെറിറ്റ് സർട്ടിഫിക്കറ്റുകൾ നൽകുന്നതാണ്.
          </p>
        </div>

        {/* 3 Competition Stages */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2.5">
            <TargetIcon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <h3 className="text-lg font-black text-white">
              മത്സര ഘട്ടങ്ങൾ (Competition Stages)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage 1 */}
            <div className="bg-blue-950/60 border border-blue-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Stage 1</span>
                <StageStepIcon step={1} className="w-7 h-7 text-blue-400" />
              </div>
              <h4 className="text-base font-black text-white">
                ഓൺലൈൻ സ്ക്രീനിംഗ് (Online Screening)
              </h4>
              <p className="text-xs text-blue-200 font-semibold">
                സെപ്റ്റംബർ 9 (September 9, 2026)
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• 8 മിനിറ്റിൽ 25 ഒബ്ജക്റ്റീവ് ചോദ്യങ്ങൾ (MCQ).</li>
                <li>• നെഗറ്റീവ് മാർക്കിംഗ് ഇല്ല.</li>
                <li>• സ്കൂളിലെ IT ലാബ് വഴിയോ സ്വന്തം മൊബൈൽ ഫോൺ വഴിയോ പങ്കെടുക്കാം.</li>
                <li>• ഓരോ സ്കൂളിൽ നിന്നും ഉയർന്ന സ്കോർ നേടുന്ന 2 വിദ്യാർത്ഥികൾ അടുത്ത ഘട്ടത്തിലേക്ക് യോഗ്യത നേടും.</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="bg-indigo-950/60 border border-indigo-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Stage 2</span>
                <StageStepIcon step={2} className="w-7 h-7 text-indigo-400" />
              </div>
              <h4 className="text-base font-black text-white">
                ഓൺലൈൻ കൺസെപ്റ്റ് പ്രസന്റേഷൻ
              </h4>
              <p className="text-xs text-indigo-200 font-semibold">
                സെപ്റ്റംബർ 25 – 27 (September 25 – 27, 2026)
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• ഒരു സ്കൂളിൽ നിന്ന് 2 പേർ അടങ്ങുന്ന ഒരു ടീം.</li>
                <li>• ശാസ്ത്ര-സാങ്കേതിക പ്രോജക്റ്റ് ഐഡിയ 3 മിനിറ്റിനുള്ളിൽ Google Meet വഴി അവതരിപ്പിക്കുക.</li>
                <li>• വിദഗ്ദ്ധ സമിതി വിലയിരുത്തി മികച്ച ടീമുകളെ ഗ്രാൻഡ് ഫിനാലെയിലേക്ക് തിരഞ്ഞെടുക്കും.</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="bg-purple-950/60 border border-purple-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Stage 3</span>
                <StageStepIcon step={3} className="w-7 h-7 text-purple-400" />
              </div>
              <h4 className="text-base font-black text-white">
                ഗ്രാൻഡ് ഫിനാലെ (Grand Finale)
              </h4>
              <p className="text-xs text-purple-200 font-semibold">
                ഒക്ടോബർ 10 (October 10, 2026)
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <li>• ഗവ. എഞ്ചിനീയറിംഗ് കോളേജ് കണ്ണൂർ ക്യാമ്പസിൽ വെച്ച് നേരിട്ട്.</li>
                <li>• 6 മണിക്കൂർ ലൈവ് ഹാർഡ്‌വെയർ ഹാക്കത്തോൺ (Live Hardware Prototyping).</li>
                <li>• ഹാർഡ്‌വെയർ ഘടകങ്ങൾ ഉപയോഗിച്ച് പ്രോട്ടോടൈപ്പ് നിർമ്മിക്കൽ.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact & Helpdesk */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <HardwareSensorIcon className="w-4 h-4 text-teal-400" />
            <span>സംശയങ്ങൾക്ക് ഹെൽപ്‌ഡെസ്കുമായി ബന്ധപ്പെടുക:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:+918592936392"
              className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white font-mono font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              +91 8592936392
            </a>
            <a
              href="mailto:info@usizosolutions.in"
              className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white font-bold transition"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              info@usizosolutions.in
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-2">
        <p>
          NIRMITI 2026 — DISTRICT LEVEL STUDENTS HARDWARE HACKATHON &nbsp;|&nbsp; Kannur District
        </p>
      </footer>
    </div>
  );
}
