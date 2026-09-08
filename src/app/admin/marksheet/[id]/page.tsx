"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ShieldAlert,
  Award,
  Clock,
  Building2,
  Phone,
  BookOpen,
  GraduationCap,
  User,
  FileText,
} from "lucide-react";
import { MicrochipGraphic, CircuitBoardBg, HardwareSensorIcon } from "@/components/HardwareGraphics";
import { cleanQuestionText } from "@/lib/clean-question";

interface Candidate {
  name: string;
  schoolName: string;
  className: string;
  rollNumber?: string;
  medium: string;
  parentMobile: string;
}

interface AttemptData {
  id: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  isPassed: boolean;
  cheatWarnings: number;
  timeTakenSeconds: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  totalQuestions: number;
}

interface QuestionRecord {
  id: string;
  orderIndex: number;
  text: string;
  textMl?: string;
  options: string[];
  optionsMl?: string[];
  correctAnswer: number;
  selectedOption: number | null;
  isCorrect: boolean;
  marksAwarded: number;
  status: "correct" | "incorrect" | "unattempted";
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  passingMarks: number;
  positiveMarks: number;
  negativeMarks: number;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Asia/Kolkata",
  });
}

export default function AdminMarksheetPage() {
  const params = useParams();
  const attemptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}/result`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAttempt(data.attempt);
          setCandidate(data.candidate);
          setExam(data.exam);
          setQuestions(data.questionsReview || []);
        }
      })
      .catch(() => setError("Failed to load marksheet data."))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading official marksheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              Sign In as Examiner
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Exam Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !candidate || !exam) return null;

  const isPassed = attempt.isPassed;
  const percentage = attempt.percentage;

  return (
    <>
      {/* Print toolbar — hidden when printing */}
      <div className="no-print bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm print:hidden">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Marksheet document */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div className="bg-white border-2 border-slate-800 rounded-xl print:rounded-none overflow-hidden shadow-2xl print:shadow-none relative">
          {/* Official Security Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none rotate-[-30deg] z-0">
            <span className="text-5xl sm:text-7xl font-black uppercase text-slate-900 tracking-widest text-center leading-tight">
              STATE TALENT ASSESSMENT 2026<br />OFFICIAL VERIFIED EVALUATION
            </span>
          </div>

          {/* Header with Hardware Graphics */}
          <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 overflow-hidden z-10">
            <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-25" />

            <div className="relative z-10 text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <MicrochipGraphic className="w-10 h-10 opacity-90" />
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
              </div>
              <span className="text-amber-400 font-extrabold text-xs tracking-widest uppercase block">
                NIRMITI 2026 — DISTRICT LEVEL STUDENTS HARDWARE HACKATHON
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                Official Individual Performance Marksheet
              </h1>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">
                Evaluation &amp; Performance Audit Report
              </p>
              <div className="text-[11px] text-blue-300 font-mono">
                Marksheet ID: {attempt.id.toUpperCase().slice(0, 16)}
              </div>
            </div>
          </div>

          {/* Candidate Information */}
          <div className="p-6 sm:p-8 border-b-2 border-slate-200 bg-slate-50/50">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Candidate Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Candidate Name</span>
                  <span className="text-sm font-black text-slate-900">{candidate.name}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">School Name</span>
                  <span className="text-sm font-bold text-slate-900">{candidate.schoolName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Class / Standard</span>
                  <span className="text-sm font-bold text-slate-900">{candidate.className}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll Number</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{candidate.rollNumber || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Medium</span>
                  <span className="text-sm font-bold text-slate-900">{candidate.medium}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {candidate.parentMobile ? "Parent Mobile" : "Candidate Roll ID"}
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {candidate.parentMobile ? `+91 ${candidate.parentMobile}` : attempt.id.slice(0, 10).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Taken</span>
                  <span className="text-sm font-black text-blue-700">{formatTime(attempt.timeTakenSeconds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-6 sm:p-8 border-b-2 border-slate-200">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Examination Timestamps (IST)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                <span className="text-[10px] text-blue-500 font-bold uppercase block mb-1">
                  Exam Started At
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatDateTime(attempt.startedAt)}
                </span>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                <span className="text-[10px] text-emerald-500 font-bold uppercase block mb-1">
                  Submitted At
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatDateTime(attempt.submittedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="p-6 sm:p-8 border-b-2 border-slate-200">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
              Score Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 text-center">
                <span className="text-3xl font-black text-slate-900">{attempt.score}</span>
                <span className="text-slate-400 text-xs font-bold block">/ {attempt.totalMarks}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block mt-1">Total Score</span>
              </div>
              <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-4 text-center">
                <span className="text-3xl font-black text-emerald-700">{attempt.correctCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold uppercase block mt-1">Correct</span>
              </div>
              <div className="bg-rose-50 rounded-2xl border-2 border-rose-200 p-4 text-center">
                <span className="text-3xl font-black text-rose-700">{attempt.incorrectCount}</span>
                <span className="text-[11px] text-rose-600 font-semibold uppercase block mt-1">Incorrect</span>
              </div>
              <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 text-center">
                <span className="text-3xl font-black text-slate-500">{attempt.unattemptedCount}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block mt-1">Unattempted</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Performance: {percentage}%</span>
                <span className={isPassed ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                  {isPassed ? "Qualifying" : "Below Qualifying"}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPassed ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>

            {/* Cheat log */}
            {attempt.cheatWarnings > 0 && (
              <div className="mt-4 flex items-start gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <b>Anti-Cheat Violations Logged:</b>{" "}
                  {attempt.cheatWarnings} tab switch(es) detected during this examination session.
                </span>
              </div>
            )}
          </div>

          {/* Question-by-question breakdown */}
          <div className="p-6 sm:p-8 border-b-2 border-slate-200">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
              Question-wise Performance Breakdown
            </h2>
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-2xl border-2 p-4 ${
                    q.status === "correct"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : q.status === "incorrect"
                      ? "border-rose-200 bg-rose-50/50"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">
                        Q{q.orderIndex}
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed font-manjari">
                          {cleanQuestionText(q.textMl) || cleanQuestionText(q.text)}
                        </p>
                        {q.textMl && q.textMl !== q.text && (
                          <p className="text-[11px] text-slate-500 font-normal leading-normal font-sans">
                            {cleanQuestionText(q.text)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {q.status === "correct" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : q.status === "incorrect" ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <MinusCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-6">
                    {q.options.map((opt, idx) => {
                      const isCorrect = idx === q.correctAnswer;
                      const isChosen = idx === q.selectedOption;
                      const mlOpt = q.optionsMl && q.optionsMl[idx] ? q.optionsMl[idx] : opt;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border ${
                            isCorrect
                              ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                              : isChosen && !isCorrect
                              ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="font-black w-4 pt-0.5">{String.fromCharCode(65 + idx)}.</span>
                          <div className="flex-1 space-y-0.5">
                            <div className="font-manjari">{mlOpt}</div>
                            {mlOpt !== opt && (
                              <div className="text-[10px] text-slate-500 font-normal font-sans">{opt}</div>
                            )}
                          </div>
                          {isCorrect && <span className="ml-auto text-emerald-600 font-black pt-0.5">✓</span>}
                          {isChosen && !isCorrect && (
                            <span className="ml-auto text-rose-600 font-black pt-0.5">✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 pl-6 text-[11px]">
                    <span
                      className={`font-bold ${
                        q.status === "correct"
                          ? "text-emerald-700"
                          : q.status === "incorrect"
                          ? "text-rose-700"
                          : "text-slate-500"
                      }`}
                    >
                      {q.status === "correct"
                        ? "+1 Mark"
                        : q.status === "incorrect"
                        ? "0 (No Negative Marking)"
                        : "Not Attempted — 0 Marks"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Footer / Signature */}
          <div className="p-6 sm:p-8 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
              <div className="text-center">
                <div className="h-12 border-b-2 border-slate-400 border-dashed mb-2" />
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                  Examiner Signature
                </span>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-slate-400 border-dashed mb-2" />
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                  Evaluation Committee
                </span>
              </div>
              <div className="text-center">
                <div className="h-12 border-b-2 border-slate-400 border-dashed mb-2" />
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                  Official Stamp
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono space-y-1">
              <p>
                This is an officially generated computer-produced marksheet. No physical signature
                required.
              </p>
              <p>
                Generated:{" "}
                {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST &nbsp;|&nbsp;
                Attempt ID: {attempt.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          .no-print { display: none !important; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
          * { box-shadow: none !important; }
        }
      `}</style>
    </>
  );
}
