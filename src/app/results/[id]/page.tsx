"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  RotateCcw,
  Home,
  ShieldAlert,
  Percent,
  Check,
  X,
  FileCheck,
} from "lucide-react";

interface QuestionReview {
  id: string;
  orderIndex: number;
  text: string;
  options: string[];
  correctAnswer: number;
  selectedOption: number | null;
  explanation: string;
  isCorrect: boolean;
  marksAwarded: number;
  positiveMarks: number;
  negativeMarks: number;
  status: "correct" | "incorrect" | "unattempted";
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const attemptId = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unattempted">("all");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/result`);
        const json = await res.json();
        setData(json);

        if (json.attempt?.isPassed) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error("Failed to load result", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Calculating score and compiling review sheet...
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.attempt) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Result Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested scorecard could not be located or has not yet been submitted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { attempt, exam, candidate, questionsReview } = data;

  const filteredQuestions = questionsReview.filter((q: QuestionReview) => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner: Pass/Fail Card */}
      <div
        className={`rounded-3xl p-8 sm:p-10 border shadow-md relative overflow-hidden ${
          attempt.isPassed
            ? "bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/50"
            : "bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white border-rose-800/50"
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5" />
              Official Examination Scorecard
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {attempt.isPassed ? "Congratulations! You Passed" : "Needs Improvement - Failed"}
            </h1>

            <p className="text-sm text-slate-200">
              Candidate: <b>{candidate?.name || "Student"}</b> • Exam: <b>{exam?.title}</b>
            </p>
          </div>

          {/* Big Score Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[200px] flex flex-col items-center justify-center">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-200">
              Net Score
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight my-1">
              {attempt.score}
              <span className="text-xl text-slate-300 font-medium">/{attempt.totalMarks}</span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                attempt.isPassed
                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                  : "bg-rose-500/30 text-rose-200 border border-rose-400/40"
              }`}
            >
              Pass threshold: {exam?.passingMarks} marks
            </span>
          </div>
        </div>

        {/* Ambient background decor */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Percentage
          </span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            {attempt.percentage}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Accuracy
          </span>
          <span className="text-xl font-black text-blue-600 mt-1 block">
            {attempt.accuracy}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Correct Answers
          </span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {attempt.correctCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
            Incorrect (Penalty)
          </span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            {attempt.incorrectCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Time Taken
          </span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            {formatSeconds(attempt.timeTakenSeconds)}
          </span>
        </div>
      </div>

      {/* Cheat Warnings Banner if any */}
      {attempt.cheatWarnings > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <b>Proctoring Notice:</b> {attempt.cheatWarnings} tab-switch violation(s) were logged during this examination.
            </span>
          </div>
          <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-amber-200/60">
            Recorded in Audit Trail
          </span>
        </div>
      )}

      {/* Solutions & Explanations Review Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Question-by-Question Solution Review
            </h2>
            <p className="text-xs text-slate-500">
              Compare your selected answers with the official answer keys and step-by-step explanations.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({questionsReview.length})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "correct" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Correct ({attempt.correctCount})
            </button>
            <button
              onClick={() => setFilter("incorrect")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "incorrect" ? "bg-rose-600 text-white" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              Incorrect ({attempt.incorrectCount})
            </button>
            <button
              onClick={() => setFilter("unattempted")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "unattempted" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Skipped ({attempt.unattemptedCount})
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map((q: QuestionReview) => {
            const hasChosen = q.selectedOption !== null && q.selectedOption !== undefined;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Q{q.orderIndex}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1">
                      {q.status === "correct" && (
                        <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Correct (+{q.marksAwarded})
                        </span>
                      )}
                      {q.status === "incorrect" && (
                        <span className="text-rose-700 bg-rose-50 border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <X className="w-3 h-3 text-rose-600" /> Incorrect ({q.marksAwarded})
                        </span>
                      )}
                      {q.status === "unattempted" && (
                        <span className="text-slate-600 bg-slate-100 border-slate-200 px-2 py-0.5 rounded-full">
                          Unattempted (0)
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    Max: +{q.positiveMarks} / Neg: -{q.negativeMarks}
                  </span>
                </div>

                {/* Question Text */}
                <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                  {q.text}
                </h4>

                {/* Options list */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswer;
                    const isSelected = optIdx === q.selectedOption;
                    const label = String.fromCharCode(65 + optIdx);

                    let itemStyle = "border-slate-200 bg-slate-50/50 text-slate-700";
                    if (isCorrect) {
                      itemStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium";
                    } else if (isSelected && !isCorrect) {
                      itemStyle = "border-rose-400 bg-rose-50/70 text-rose-950 line-through opacity-80";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${itemStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : isSelected
                                ? "bg-rose-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {label}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div>
                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {q.explanation && (
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                      Step-by-step Solution / Explanation
                    </span>
                    <p className="leading-relaxed text-slate-700">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
        >
          <Home className="w-4 h-4" />
          Back to All Exams
        </Link>

        <Link
          href={`/exams/${exam?.id}/take`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Examination
        </Link>
      </div>
    </div>
  );
}
