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
  Phone,
  BookOpen,
  ArrowRight,
  User,
  Sparkles,
  LayoutDashboard,
  FileCheck,
} from "lucide-react";
import { POPULAR_SCHOOLS } from "@/lib/schools-data";

export default function HomePage() {
  const router = useRouter();

  // Registration form state
  const [name, setName] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [customSchool, setCustomSchool] = useState("");
  const [className, setClassName] = useState("Class 10");
  const [medium, setMedium] = useState<"ENGLISH" | "MALAYALAM">("ENGLISH");
  const [parentMobile, setParentMobile] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const finalSchool =
      selectedSchool === "OTHER"
        ? customSchool.trim()
        : selectedSchool.trim();

    if (!finalSchool) {
      setError("Please select or enter your school name.");
      return;
    }

    if (!parentMobile || !/^[6-9]\d{9}$/.test(parentMobile.trim())) {
      setError("Please enter a valid 10-digit parent mobile number (starts with 6, 7, 8, or 9).");
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
          parentMobile: parentMobile.trim(),
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
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Official Online Talent Assessment 2026
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Online Objective Examination
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            Test your knowledge with <b>25 randomly selected questions</b> from our 1,000-question repository. Total duration: <b>8 minutes</b>. Top 2 students from each school advance to the finals!
          </p>

          {user?.role === "ADMIN" && (
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                Examiner Portal (View School Toppers)
              </Link>
            </div>
          )}
        </div>

        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Instructions vs Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exam Rules & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Examination Rules
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Strict 8 Minutes Duration</strong>
                  <span>The live countdown begins immediately upon entering the test. At 00:00, the test will automatically close and submit.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">25 Randomized Questions</strong>
                  <span>Each candidate receives 25 questions dynamically chosen from the 1,000-question bank with randomized option orders.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Top 2 per School Selection</strong>
                  <span>Finalists are selected from each school based on <b>highest score achieved in the least completion time</b>.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Parent Mobile Number Required</strong>
                  <span>A valid 10-digit mobile number is mandatory to identify your submission and notify selected toppers.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Entry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Candidate Registration
              </h2>
              <p className="text-xs text-slate-500">
                Please enter your academic details to launch your online exam session.
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
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul S. Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition"
                />
              </div>

              {/* School Name Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  School Name *
                </label>
                <select
                  required
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white transition"
                >
                  <option value="">-- Select Your School --</option>
                  {POPULAR_SCHOOLS.map((school, i) => (
                    <option key={i} value={school}>
                      {school}
                    </option>
                  ))}
                  <option value="OTHER">✍️ Other / School Not Listed Above (Type Below)</option>
                </select>

                {/* Custom School Input if "OTHER" selected */}
                {selectedSchool === "OTHER" && (
                  <div className="pt-2 animate-in fade-in">
                    <input
                      type="text"
                      required
                      value={customSchool}
                      onChange={(e) => setCustomSchool(e.target.value)}
                      placeholder="Type Full Official Name of Your School here..."
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
                    Class / Standard *
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
                    Medium of Exam *
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
                      English
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
                      മലയാളം
                    </button>
                  </div>
                </div>
              </div>

              {/* Parent Mobile Number */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    Parent Mobile Number *
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Must be exactly 10 digits
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={parentMobile}
                    onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 focus:bg-white font-mono tracking-wider transition"
                  />
                </div>
                {parentMobile && parentMobile.length !== 10 && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    Entered {parentMobile.length} of 10 digits
                  </p>
                )}
              </div>

              {/* CTA Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
                >
                  {loading ? "Preparing 25 Questions..." : "Begin 8-Minute Examination"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
