"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Send,
  RotateCcw,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Award,
  BookOpen,
  Home,
  Check,
  Globe,
} from "lucide-react";
import { DEMO_QUESTIONS, DemoQuestion } from "@/lib/demo-questions";
import { MicrochipGraphic, CircuitBoardBg, HardwareSensorIcon } from "@/components/HardwareGraphics";

export default function DemoExamPage() {
  // Language & Mode
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [examStarted, setExamStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers: questionId -> selectedOption index
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [reviews, setReviews] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  // Timer: 8 minutes = 480 seconds
  const [remainingSeconds, setRemainingSeconds] = useState(480);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMultiTabBlocked, setIsMultiTabBlocked] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || submitted || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, submitted, remainingSeconds]);

  // Tab-switch simulation warning
  useEffect(() => {
    if (!examStarted || submitted) return;

    const handleBlur = () => {
      setCheatWarnings((prev) => {
        const next = prev + 1;
        setShowWarningModal(true);
        if (next >= 3) {
          setTimeout(() => setSubmitted(true), 2000);
        }
        return next;
      });
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [examStarted, submitted]);

  // Security: disable right-click and selection
  useEffect(() => {
    if (!examStarted || submitted) return;

    const blockEvent = (e: Event) => e.preventDefault();
    const blockKey = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U", "C", "S", "P"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("keydown", blockKey);

    return () => {
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("keydown", blockKey);
    };
  }, [examStarted, submitted]);

  // Multi-Tab Guard for demo exam
  useEffect(() => {
    const tabId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const storageKey = `nirmiti_demo_active_tab`;

    localStorage.setItem(storageKey, tabId);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(`nirmiti_demo_tab_channel`);
      channel.postMessage({ type: "NEW_TAB_OPENED", tabId });

      channel.onmessage = (event) => {
        if (event.data?.type === "NEW_TAB_OPENED" && event.data.tabId !== tabId) {
          setIsMultiTabBlocked(true);
        }
      };
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue && e.newValue !== tabId) {
        setIsMultiTabBlocked(true);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
      if (localStorage.getItem(storageKey) === tabId) {
        localStorage.removeItem(storageKey);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleSelectOption = (optIndex: number) => {
    const q = DEMO_QUESTIONS[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
  };

  const handleClearSelection = () => {
    const q = DEMO_QUESTIONS[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: null }));
  };

  const handleToggleReview = () => {
    const q = DEMO_QUESTIONS[currentIndex];
    setReviews((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
    if (currentIndex < DEMO_QUESTIONS.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < DEMO_QUESTIONS.length) {
      setCurrentIndex(idx);
      setVisited((prev) => new Set([...Array.from(prev), idx]));
    }
  };

  const getStatus = (idx: number) => {
    const q = DEMO_QUESTIONS[idx];
    const ans = answers[q.id];
    const isRev = reviews[q.id];
    const hasAns = ans !== null && ans !== undefined;
    const hasVis = visited.has(idx);

    if (hasAns && isRev) return "answered-review";
    if (hasAns) return "answered";
    if (isRev) return "review";
    if (hasVis) return "not-answered";
    return "not-visited";
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = DEMO_QUESTIONS[currentIndex];
  const qData = lang === "ml" ? currentQ.ml : currentQ.en;
  const currentSelected = answers[currentQ.id];
  const isReviewed = reviews[currentQ.id];

  // Scoring
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  DEMO_QUESTIONS.forEach((q) => {
    const chosen = answers[q.id];
    if (chosen === null || chosen === undefined) {
      unattemptedCount++;
    } else if (chosen === q.correctAnswer) {
      score++;
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // MULTI-TAB LOCK SCREEN
  if (isMultiTabBlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-5 border-2 border-rose-500 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">
              {lang === "ml"
                ? "ഒന്നിലധികം ടാബുകൾ അനുവദനീയമല്ല!"
                : "Multiple Tabs Detected!"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === "ml"
                ? "ഡെമോ പരീക്ഷ ഒന്നിലധികം ടാബുകളിൽ പ്രവർത്തിക്കാൻ അനുവാദമില്ല. ദയവായി മറ്റ് ടാബുകൾ അടച്ച് ഒരു ടാബിൽ മാത്രം തുടരുക."
                : "The examination is already active in another browser tab. Multiple concurrent tabs are strictly blocked."}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            {lang === "ml"
              ? "ദയവായി ഈ ടാബ് അടച്ച് നിങ്ങളുടെ പ്രധാന പരീക്ഷാ ടാബിലേക്ക് മടങ്ങുക."
              : "Please close this tab and return to your primary exam tab."}
          </div>
        </div>
      </div>
    );
  }

  // PRE-TEST DEMO SCREEN
  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950 text-white p-8 space-y-3">
            <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-30" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Practice &amp; Familiarization Mode
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                NIRMITI 2026 — Demo Practice Examination
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Experience the exact same 8-minute exam environment, 25 hardware questions, timer, and question palette before the actual competition.
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Questions</span>
                <span className="text-xl font-black text-slate-900">25 MCQs</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Duration</span>
                <span className="text-xl font-black text-blue-600">8 Minutes</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Medium</span>
                <span className="text-xl font-black text-emerald-600">Bilingual</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Practice Type</span>
                <span className="text-xl font-black text-slate-900">Unlimited</span>
              </div>
            </div>

            {/* Language Selection */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Choose Practice Language / ഭാഷ തിരഞ്ഞെടുക്കുക:
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                    lang === "en"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang("ml")}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                    lang === "ml"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  മലയാളം (Malayalam)
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                * You can also toggle the language anytime during the exam at the top of the test screen.
              </p>
            </div>

            {/* Start button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Official Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setExamStarted(true);
                  toggleFullscreen();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition"
              >
                Launch 8-Minute Practice Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // POST-TEST PRACTICE FEEDBACK SCREEN
  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Demo Practice Completed!</h1>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-xl mx-auto">
              Great job! You now understand how the 8-minute timer, 25 randomized questions, and palette controls function for NIRMITI 2026.
            </p>
          </div>

          {/* Scorecard */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <span className="text-3xl font-black text-slate-900">{score}</span>
                <span className="text-slate-400 text-xs font-bold block">/ 25</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block mt-1">Practice Score</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                <span className="text-3xl font-black text-emerald-700">{correctCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold uppercase block mt-1">Correct</span>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-200">
                <span className="text-3xl font-black text-rose-700">{incorrectCount}</span>
                <span className="text-[11px] text-rose-600 font-semibold uppercase block mt-1">Incorrect</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <span className="text-3xl font-black text-slate-500">{unattemptedCount}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase block mt-1">Unattempted</span>
              </div>
            </div>

            {/* Explanations & Review */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Question Review &amp; Explanations
                </h3>
                <button
                  type="button"
                  onClick={() => setLang((prev) => (prev === "en" ? "ml" : "en"))}
                  className="px-3 py-1 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 hover:bg-slate-100"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "en" ? "മലയാളത്തിൽ കാണുക" : "View in English"}
                </button>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {DEMO_QUESTIONS.map((q, idx) => {
                  const chosen = answers[q.id];
                  const isCorrect = chosen === q.correctAnswer;
                  const data = lang === "ml" ? q.ml : q.en;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border-2 ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50/40"
                          : chosen !== null && chosen !== undefined
                          ? "border-rose-200 bg-rose-50/40"
                          : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500">Q{idx + 1}.</span>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 font-manjari">
                            {q.ml.question}
                          </p>
                          <p className="text-xs text-slate-500 font-normal font-sans">
                            {q.en.question}
                          </p>
                        </div>
                        <span className="text-xs font-black">
                          {isCorrect ? (
                            <span className="text-emerald-600">Correct</span>
                          ) : (
                            <span className="text-rose-600">Incorrect</span>
                          )}
                        </span>
                      </div>
                      <div className="mt-2 pl-5 text-xs text-slate-600 space-y-1">
                        <div>
                          Correct Answer: <b className="font-manjari">{String.fromCharCode(65 + q.correctAnswer)}. {q.ml.options[q.correctAnswer]}</b> ({q.en.options[q.correctAnswer]})
                        </div>
                        <div className="text-slate-600 font-manjari">
                          വിശദീകരണം: {q.ml.explanation}
                        </div>
                        <div className="text-slate-400 italic">
                          Explanation: {q.en.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setReviews({});
                  setVisited(new Set([0]));
                  setCurrentIndex(0);
                  setRemainingSeconds(480);
                  setCheatWarnings(0);
                  setSubmitted(false);
                  setExamStarted(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Demo Exam
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                <Home className="w-4 h-4" />
                Return to Official Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE DEMO EXAM SCREEN
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-100 flex flex-col select-none overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs flex-shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-indigo-600 text-white">
              DEMO PRACTICE EXAM
            </span>
            <span className="hidden sm:inline text-xs font-bold text-slate-500">
              NIRMITI 2026
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === "en" ? "ml" : "en"))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 hover:bg-slate-100 transition flex items-center gap-1.5 text-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              {lang === "en" ? "മലയാളം" : "English"}
            </button>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-mono text-xs sm:text-base font-black transition ${
                remainingSeconds < 300
                  ? "bg-rose-100 text-rose-700 animate-pulse border border-rose-300"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${remainingSeconds < 300 ? "text-rose-600" : "text-blue-600"}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Cheat Counter */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border bg-slate-50 border-slate-200 text-slate-600">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Warnings: {cheatWarnings}/3</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Submit */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              {lang === "ml" ? "സമർപ്പിക്കുക" : "Submit Demo"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 min-h-0 lg:overflow-hidden">
        {/* Question Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full min-h-0">
          <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === "ml" ? "ചോദ്യം" : "Question"}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900">{currentIndex + 1}</span>
                <span className="text-xs text-slate-400 font-medium">/ {DEMO_QUESTIONS.length}</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lang === "ml" ? "സ്വയം സേവ് ആകുന്നു" : "Auto-saved"}
                </span>
              </div>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                +1.0 Mark
              </span>
            </div>

            {/* Question Text in Both Languages */}
            <div className="space-y-1 flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-manjari">
                {currentQ.ml.question}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-normal leading-snug font-sans pt-0.5">
                {currentQ.en.question}
              </div>
            </div>

            {/* Options list: responsive 2-column or grid without blank space */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
              {currentQ.en.options.map((opt, optIdx) => {
                const isSelected = currentSelected === optIdx;
                const label = String.fromCharCode(65 + optIdx);
                const mlOpt = currentQ.ml.options[optIdx];

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 group cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/90 bg-white"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-black transition flex-shrink-0 ${
                        isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                      }`}
                    >
                      {label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs sm:text-sm leading-snug font-manjari ${
                          isSelected ? "text-blue-950 font-bold" : "text-slate-800 font-semibold"
                        }`}
                      >
                        {mlOpt}
                      </div>
                      {mlOpt !== opt && (
                        <div className="text-[11px] sm:text-xs text-slate-500 font-normal pt-0.5 font-sans">
                          {opt}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar: High-Visibility Buttons */}
          <div className="bg-slate-50/95 border-t border-slate-200 py-2 sm:py-2.5 px-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={currentSelected === null || currentSelected === undefined}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {lang === "ml" ? "സിലക്ഷൻ ഒഴിവാക്കുക" : "Clear Selection"}
              </button>

              <button
                type="button"
                onClick={handleToggleReview}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  isReviewed
                    ? "bg-purple-100 text-purple-900 border-purple-400 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {isReviewed
                  ? lang === "ml"
                    ? "റീവ്യൂ ഒഴിവാക്കുക"
                    : "Remove Review"
                  : lang === "ml"
                  ? "റീവ്യൂവിനായി അടയാളപ്പെടുത്തുക"
                  : "Mark for Review"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                {lang === "ml" ? "മുമ്പത്തേത്" : "Previous"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentIndex < DEMO_QUESTIONS.length - 1) {
                    goToQuestion(currentIndex + 1);
                  } else {
                    setShowSubmitModal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 active:scale-[0.98] transition cursor-pointer"
              >
                {currentIndex < DEMO_QUESTIONS.length - 1 ? (
                  <>
                    <span>{lang === "ml" ? "സേവ് ചെയ്ത് അടുത്തതിലേക്ക്" : "Save & Next"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{lang === "ml" ? "പരീക്ഷ സമർപ്പിക്കുക" : "Review & Submit"}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-0 flex flex-col">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-4 shadow-sm space-y-3 flex flex-col justify-between h-full min-h-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex-shrink-0">
              {lang === "ml" ? "ചോദ്യ സൂചിക (Palette)" : "Question Palette"}
            </h3>

            {/* Grid */}
            <div className="pt-2 border-t border-slate-100 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-5 gap-1.5 pr-1">
                {DEMO_QUESTIONS.map((q, idx) => {
                  const status = getStatus(idx);
                  const isCurrent = idx === currentIndex;

                  let colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
                  if (status === "answered") colorClass = "bg-emerald-600 text-white border-emerald-600";
                  else if (status === "answered-review") colorClass = "bg-purple-600 text-white border-purple-600";
                  else if (status === "review") colorClass = "bg-amber-500 text-white border-amber-500";
                  else if (status === "not-answered") colorClass = "bg-orange-500 text-white border-orange-500";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      className={`h-8 sm:h-8.5 rounded-lg text-xs font-bold transition flex items-center justify-center border ${colorClass} ${
                        isCurrent ? "ring-2 ring-blue-500 ring-offset-1 scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
                {lang === "ml" ? "ഡെമോ സമർപ്പിക്കുക" : "Submit Demo Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-rose-200 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Security Alert! Tab Switch Detected
              </h3>
              <p className="text-xs text-slate-600">
                In the official exam, switching tabs will automatically submit after 3 violations. This is a practice simulation (Warning {cheatWarnings}/3).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
            >
              I Understand, Continue Demo
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 text-center">
              Submit Practice Demo?
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span>Total:</span>
                <b>25</b>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex justify-between text-emerald-800">
                <span>Answered:</span>
                <b>{Object.values(answers).filter((v) => v !== null && v !== undefined).length}</b>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitted(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Yes, Submit Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
