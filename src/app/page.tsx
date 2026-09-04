"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Shuffle,
  Eye,
  PlusCircle,
  FileCheck,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  shuffleQuestions: boolean;
  _count: {
    questions: number;
    attempts: number;
  };
  attempts?: {
    id: string;
    score: number;
    totalMarks: number;
    isPassed: boolean;
    submittedAt: string | null;
  }[];
}

export default function HomePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loadData = async () => {
    try {
      const [authRes, examsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/exams"),
      ]);

      const authData = await authRes.json();
      setUser(authData.user);

      const examsData = await examsRes.json();
      if (examsData.exams) {
        setExams(examsData.exams);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-blue-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Standardized Objective Testing Engine
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Conduct High-Stakes Objective Exams with Absolute Integrity
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl font-normal">
            Real-time countdown timer, multi-state question palette, custom negative marking, anti-cheat tab monitoring, and instant automated evaluation.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/25"
              >
                <PlusCircle className="w-4 h-4" />
                Open Examiner Portal
              </Link>
            ) : (
              <a
                href="#exams-list"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/25"
              >
                <FileCheck className="w-4 h-4" />
                Browse Available Exams
              </a>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tab-switch detection
              </span>
              <span className="flex items-center gap-1">
                <Shuffle className="w-4 h-4 text-cyan-400" /> Question shuffling
              </span>
            </div>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Synchronized Timer</h4>
            <p className="text-xs text-slate-500 mt-1">
              Live countdown with auto-submission when time runs out.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Negative Marking</h4>
            <p className="text-xs text-slate-500 mt-1">
              Configurable penalty deductions for incorrect guesses.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Question Palette</h4>
            <p className="text-xs text-slate-500 mt-1">
              Categorizes answered, review, and unattempted questions.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Instant Scorecard</h4>
            <p className="text-xs text-slate-500 mt-1">
              Detailed answers and step-by-step solutions immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Available Exams Section */}
      <section id="exams-list" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Active Examinations
            </h2>
            <p className="text-sm text-slate-500">
              Select an assessment below to begin your proctored online test.
            </p>
          </div>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 transition"
            >
              <PlusCircle className="w-4 h-4" /> Create New Exam
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Exams Published Yet</h3>
            <p className="text-sm text-slate-500">
              There are no examinations available at the moment. Switch to the Admin portal to create and publish exams.
            </p>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Go to Examiner Portal
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const lastAttempt = exam.attempts && exam.attempts[0];
              const isSubmitted = lastAttempt && lastAttempt.submittedAt;

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Category & Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {exam.category}
                      </span>
                      {exam.negativeMarks > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          -{exam.negativeMarks} Neg.
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {exam.description || "Comprehensive objective examination with timer and analytics."}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Questions</span>
                        <p className="text-sm font-bold text-slate-800">
                          {exam._count.questions}
                        </p>
                      </div>
                      <div className="space-y-0.5 border-x border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Duration</span>
                        <p className="text-sm font-bold text-slate-800">
                          {exam.durationMinutes}m
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Marks</span>
                        <p className="text-sm font-bold text-slate-800">
                          {exam.totalMarks}
                        </p>
                      </div>
                    </div>

                    {/* Scoring Breakdown */}
                    <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                      <span>Correct: <b className="text-emerald-700">+{exam.positiveMarks}</b></span>
                      <span>Pass: <b className="text-slate-800">{exam.passingMarks} pts</b></span>
                    </div>

                    {/* Previous Result Banner if completed */}
                    {isSubmitted && (
                      <div
                        className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
                          lastAttempt.isPassed
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              lastAttempt.isPassed ? "text-emerald-600" : "text-rose-600"
                            }`}
                          />
                          <span>
                            Last Score: <b>{lastAttempt.score}/{lastAttempt.totalMarks}</b>
                          </span>
                        </div>
                        <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/70">
                          {lastAttempt.isPassed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href={`/exams/${exam.id}/take`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition"
                    >
                      {isSubmitted ? "Retake Examination" : "Start Examination"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {isSubmitted && (
                      <Link
                        href={`/results/${lastAttempt.id}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl transition"
                        title="View detailed scorecard and answers"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
