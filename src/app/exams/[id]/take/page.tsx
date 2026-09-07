"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
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
} from "lucide-react";
import { TRANSLATIONS } from "@/lib/translations";
import { MicrochipGraphic, HardwareSensorIcon } from "@/components/HardwareGraphics";

interface Question {
  id: string;
  orderIndex: number;
  text: string;
  options: string[];
  marks: number;
  negativeMarks: number;
}

interface SavedAnswer {
  questionId: string;
  selectedOption: number | null;
  isMarkedReview: boolean;
}

export default function TakeExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const examId = params.id;

  // Language & Localization state
  const [medium, setMedium] = useState<"ENGLISH" | "MALAYALAM">("ENGLISH");
  const t = medium === "MALAYALAM" ? TRANSLATIONS.ml : TRANSLATIONS.en;

  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Answers state: questionId -> { selectedOption: number | null, isMarkedReview: boolean }
  const [answers, setAnswers] = useState<
    Record<string, { selectedOption: number | null; isMarkedReview: boolean }>
  >({});
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set([0]));

  // Timer & Security state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [cheatWarnings, setCheatWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  const cheatWarningsRef = useRef(0);
  const attemptIdRef = useRef("");
  cheatWarningsRef.current = cheatWarnings;
  attemptIdRef.current = attemptId;

  // Load exam and attempt details
  const startExamSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/${examId}/start`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.expired) {
        alert("The allocated duration for this attempt has expired.");
        router.push(`/submitted?attemptId=${data.attemptId}`);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to start exam session.");
        router.push("/");
        return;
      }

      // Check candidate medium
      if (data.candidate?.medium === "MALAYALAM") {
        setMedium("MALAYALAM");
      }

      setExamData(data.exam);
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setRemainingSeconds(data.remainingSeconds);
      setCheatWarnings(data.cheatWarnings || 0);

      // Reconstruct answer map
      const initialAnswers: Record<
        string,
        { selectedOption: number | null; isMarkedReview: boolean }
      > = {};
      if (Array.isArray(data.savedAnswers)) {
        data.savedAnswers.forEach((ans: SavedAnswer) => {
          initialAnswers[ans.questionId] = {
            selectedOption: ans.selectedOption,
            isMarkedReview: ans.isMarkedReview,
          };
        });
      }
      setAnswers(initialAnswers);
    } catch (err) {
      console.error(err);
      alert("Error initiating exam session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startExamSession();
  }, [examId]);

  // Fullscreen helper
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

  // Submit Exam handler
  const handleFinalSubmit = useCallback(
    async (forcedReason?: string) => {
      if (submitting) return;
      setSubmitting(true);

      try {
        const answerPayload = Object.entries(answers).map(([questionId, ans]) => ({
          questionId,
          selectedOption: ans.selectedOption,
          isMarkedReview: ans.isMarkedReview,
        }));

        const res = await fetch(`/api/attempts/${attemptIdRef.current}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: answerPayload,
            cheatWarnings: cheatWarningsRef.current,
            forcedReason: forcedReason || null,
          }),
        });

        const data = await res.json();
        if (data.attemptId) {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          router.push(`/submitted?attemptId=${data.attemptId}`);
        } else {
          alert("Submission failed. Retrying...");
          setSubmitting(false);
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("Error submitting exam. Please check network connection.");
        setSubmitting(false);
      }
    },
    [answers, router, submitting]
  );

  // Live countdown timer
  useEffect(() => {
    if (!examStarted || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit("Time Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, remainingSeconds, handleFinalSubmit]);

  // Anti-cheat tab switch detection
  useEffect(() => {
    if (!examStarted) return;

    const recordViolation = (eventDesc: string) => {
      const newCount = cheatWarningsRef.current + 1;
      setCheatWarnings(newCount);
      cheatWarningsRef.current = newCount;

      // Sync cheat count to server
      fetch(`/api/attempts/${attemptIdRef.current}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cheatWarnings: newCount }),
      }).catch(() => {});

      if (newCount >= 3) {
        setWarningMessage(t.maxViolationsExceeded);
        setShowWarningModal(true);
        setTimeout(() => {
          handleFinalSubmit("Exceeded Maximum Tab-Switch Violations");
        }, 2000);
      } else {
        setWarningMessage(
          `${t.cheatAlertTitle} (${eventDesc})! ${t.cheatWarningPrefix} ${newCount} ${t.cheatWarningSuffix}`
        );
        setShowWarningModal(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(medium === "MALAYALAM" ? "ടാബ് മാറ്റി / മിനിമൈസ് ചെയ്തു" : "Tab switched / minimized");
      }
    };

    const handleWindowBlur = () => {
      recordViolation(medium === "MALAYALAM" ? "വിൻഡോ ഫോക്കസ് നഷ്ടപ്പെട്ടു" : "Window lost focus");
    };

    // Strict Anti-Malpractice: Disable right-click, copy, cut, paste, selection, and DevTools shortcuts
    const blockSecurityEvent = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toUpperCase() : "";
      if (
        key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) ||
        (e.ctrlKey && ["U", "C", "S", "P"].includes(key)) ||
        (e.metaKey && ["U", "C", "S", "P"].includes(key))
      ) {
        e.preventDefault();
        recordViolation(
          medium === "MALAYALAM"
            ? "അനധികൃത കീബോർഡ് പ്രവർത്തനം തടഞ്ഞു"
            : "Unauthorized DevTools/Copy attempt blocked"
        );
        return false;
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", blockSecurityEvent);
    document.addEventListener("copy", blockSecurityEvent);
    document.addEventListener("cut", blockSecurityEvent);
    document.addEventListener("selectstart", blockSecurityEvent);
    document.addEventListener("keydown", handleKeyDownSecurity);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", blockSecurityEvent);
      document.removeEventListener("copy", blockSecurityEvent);
      document.removeEventListener("cut", blockSecurityEvent);
      document.removeEventListener("selectstart", blockSecurityEvent);
      document.removeEventListener("keydown", handleKeyDownSecurity);
    };
  }, [examStarted, handleFinalSubmit, medium, t]);

  // Save current answer to server
  const saveAnswerToServer = (qId: string, option: number | null, isReview: boolean) => {
    fetch(`/api/attempts/${attemptId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: qId,
        selectedOption: option,
        isMarkedReview: isReview,
      }),
    }).catch((err) => console.error("Autosave failed", err));
  };

  const handleSelectOption = (optIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const existing = answers[currentQ.id] || { selectedOption: null, isMarkedReview: false };
    const updated = {
      ...existing,
      selectedOption: optIndex,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    saveAnswerToServer(currentQ.id, optIndex, updated.isMarkedReview);
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const existing = answers[currentQ.id] || { selectedOption: null, isMarkedReview: false };
    const updated = {
      ...existing,
      selectedOption: null,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    saveAnswerToServer(currentQ.id, null, updated.isMarkedReview);
  };

  const handleToggleMarkReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const existing = answers[currentQ.id] || { selectedOption: null, isMarkedReview: false };
    const updated = {
      ...existing,
      isMarkedReview: !existing.isMarkedReview,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    saveAnswerToServer(currentQ.id, updated.selectedOption, updated.isMarkedReview);

    // Jump to next question if available
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      setVisitedIndices((prev) => new Set([...Array.from(prev), index]));
    }
  };

  // Status classifier for Palette buttons
  const getQuestionStatus = (index: number) => {
    const q = questions[index];
    if (!q) return "not-visited";

    const ans = answers[q.id];
    const hasAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
    const isReview = ans && ans.isMarkedReview;
    const hasVisited = visitedIndices.has(index);

    if (hasAnswered && isReview) return "answered-review";
    if (hasAnswered) return "answered";
    if (isReview) return "review";
    if (hasVisited) return "not-answered";
    return "not-visited";
  };

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Palette counts
  const statsCounts = questions.reduce(
    (acc, q, idx) => {
      const status = getQuestionStatus(idx);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            {medium === "MALAYALAM"
              ? "പരീക്ഷാ സെഷൻ സജ്ജമാക്കുന്നു..."
              : "Securing test session and loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  // PRE-TEST INSTRUCTIONS SCREEN
  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                {t.rulesTitle}
              </span>
              <button
                type="button"
                onClick={() => setMedium((prev) => (prev === "ENGLISH" ? "MALAYALAM" : "ENGLISH"))}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition"
              >
                🌐 {medium === "ENGLISH" ? "മലയാളത്തിൽ വായിക്കുക" : "View in English"}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{examData?.title}</h1>
            <p className="text-sm text-slate-300">{examData?.description}</p>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-semibold">
                {medium === "MALAYALAM" ? "ആകെ ചോദ്യങ്ങൾ" : "Total Questions"}
              </span>
              <span className="text-lg font-black text-slate-800">{questions.length} MCQs</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-semibold">
                {medium === "MALAYALAM" ? "സമയം" : "Duration"}
              </span>
              <span className="text-lg font-black text-blue-600">
                {examData?.durationMinutes} {medium === "MALAYALAM" ? "മിനിറ്റ്" : "Minutes"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-semibold">
                {medium === "MALAYALAM" ? "ശരി / തെറ്റ് മാർക്ക്" : "Correct / Incorrect"}
              </span>
              <span className="text-lg font-black text-emerald-600">
                +{examData?.positiveMarks} / -{examData?.negativeMarks}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-semibold">
                {medium === "MALAYALAM" ? "യോഗ്യത മാർക്ക്" : "Passing Score"}
              </span>
              <span className="text-lg font-black text-slate-800">
                {examData?.passingMarks} {medium === "MALAYALAM" ? "മാർക്ക്" : "Marks"}
              </span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-8 space-y-6 text-sm text-slate-700">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              {t.rulesTitle}
            </h3>

            <ul className="space-y-2.5 list-disc pl-5 text-xs sm:text-sm text-slate-600">
              <li>
                <strong>{t.rule1Title}:</strong> {t.rule1Desc}
              </li>
              <li>
                <strong>{t.rule2Title}:</strong> {t.rule2Desc}
              </li>
              <li>
                <strong>{t.rule3Title}:</strong> {t.rule3Desc}
              </li>
              <li>
                <strong>{t.rule4Title}:</strong> {t.rule4Desc}
              </li>
            </ul>

            {/* Color Code Legend */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {medium === "MALAYALAM" ? "ചോദ്യങ്ങളുടെ വർണ്ണ സൂചിക" : "Question Palette Legend"}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>{t.answered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>{t.markedReview}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>{t.answeredReview}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-orange-500 text-white font-bold flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>{t.notAnswered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <span>{t.notVisited}</span>
                </div>
              </div>
            </div>

            {/* Checkbox agreement */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {medium === "MALAYALAM"
                  ? "ഞാൻ മറ്റാരുടെയും സഹായമില്ലാതെ ഈ പരീക്ഷ പൂർത്തിയാക്കുമെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു. പരീക്ഷാ നിയമങ്ങളും ആന്റി-ചീറ്റിംഗ് ചട്ടങ്ങളും ഞാൻ വായിച്ചു മനസ്സിലാക്കി അംഗീകരിക്കുന്നു."
                  : "I confirm that I am taking this examination individually without external assistance. I have read and agree to all rules, anti-cheating regulations, and scoring schemes."}
              </span>
            </label>

            {/* Launch CTA */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={!acceptedTerms}
                onClick={() => {
                  setExamStarted(true);
                  toggleFullscreen();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.startExamBtn}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM SCREEN
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;
  const isTimeCritical = remainingSeconds < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col exam-noselect select-none">
      {/* Top Proctored Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-slate-800 text-white">
              <HardwareSensorIcon className="w-3.5 h-3.5 text-blue-400" />
              {medium === "MALAYALAM" ? "പരീക്ഷ നടക്കുന്നു" : "EXAM IN PROGRESS"}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[180px] sm:max-w-md">
              {examData?.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setMedium((prev) => (prev === "ENGLISH" ? "MALAYALAM" : "ENGLISH"))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 hover:bg-slate-100 transition flex items-center gap-1 text-slate-700"
              title="Switch Language / ഭാഷ മാറ്റുക"
            >
              🌐 {medium === "ENGLISH" ? "മലയാളം" : "English"}
            </button>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black transition ${
                isTimeCritical
                  ? "bg-rose-100 text-rose-700 animate-pulse border border-rose-300"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeCritical ? "text-rose-600" : "text-blue-600"}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Cheat Counter Warning */}
            <div
              className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                cheatWarnings > 0
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
              title="Anti-cheating tab switch counter. 3 violations auto-submits."
            >
              <ShieldAlert
                className={`w-3.5 h-3.5 ${cheatWarnings > 0 ? "text-amber-600" : "text-slate-400"}`}
              />
              <span>
                {t.cheatWarningPrefix} {cheatWarnings}/3
              </span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Direct Submit Header button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2 px-3.5 rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              {t.submitTest}
            </button>
          </div>
        </div>
      </header>

      {/* Main Testing Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[560px]">
          {currentQ ? (
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col">
              {/* Question Header meta */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.question}
                  </span>
                  <span className="text-xl font-black text-slate-900">{currentIndex + 1}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {t.of} {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{currentQ.marks} {t.marks}
                  </span>
                  {currentQ.negativeMarks > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                      -{currentQ.negativeMarks} Neg.
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                {currentQ.text}
              </div>

              {/* Options list */}
              <div className="space-y-3 pt-2 flex-1">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = currentAnswer?.selectedOption === optIdx;
                  const label = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition flex-shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-normal pt-0.5 leading-snug ${
                          isSelected ? "text-blue-950 font-medium" : "text-slate-700"
                        }`}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No question selected</div>
          )}

          {/* Bottom Action Toolbar */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={
                  currentAnswer?.selectedOption === null || currentAnswer?.selectedOption === undefined
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.clearSelection}
              </button>

              <button
                type="button"
                onClick={handleToggleMarkReview}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  currentAnswer?.isMarkedReview
                    ? "bg-purple-50 text-purple-700 border-purple-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {currentAnswer?.isMarkedReview ? t.removeReview : t.markForReview}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => goToQuestion(currentIndex - 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                {t.previous}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    goToQuestion(currentIndex + 1);
                  } else {
                    setShowSubmitModal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    {t.saveAndNext}
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t.reviewAndSubmit}
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {medium === "MALAYALAM" ? "ചോദ്യ സൂചിക" : "Question Palette"}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {questions.length} {t.totalQuestions}
              </span>
            </div>

            {/* Quick Status Legend with real-time counters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  {t.answered}
                </span>
                <span className="font-bold">{statsCounts["answered"] || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50 text-orange-800 border border-orange-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  {t.notAnswered}
                </span>
                <span className="font-bold">{statsCounts["not-answered"] || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t.markedReview}
                </span>
                <span className="font-bold">{statsCounts["review"] || 0}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  {t.answeredReview}
                </span>
                <span className="font-bold">{statsCounts["answered-review"] || 0}</span>
              </div>
            </div>

            {/* Grid Palette buttons */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(idx);
                  const isCurrent = idx === currentIndex;

                  let colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200";
                  if (status === "answered") {
                    colorClass = "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600";
                  } else if (status === "answered-review") {
                    colorClass = "bg-purple-600 text-white hover:bg-purple-700 border-purple-600";
                  } else if (status === "review") {
                    colorClass = "bg-amber-500 text-white hover:bg-amber-600 border-amber-500";
                  } else if (status === "not-answered") {
                    colorClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center border-2 ${colorClass} ${
                        isCurrent ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Final Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-md shadow-emerald-600/20 transition"
              >
                <Send className="w-4 h-4" />
                {t.submitTest}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHEAT VIOLATION WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-rose-200 shadow-2xl animate-in fade-in zoom-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">{t.cheatAlertTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{warningMessage}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-center">
              {t.cheatWarningPrefix}: <b>{cheatWarnings} / 3</b>
            </div>

            {cheatWarnings < 3 ? (
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition"
              >
                {t.cheatDismissBtn}
              </button>
            ) : (
              <p className="text-xs text-rose-600 font-bold text-center">
                {medium === "MALAYALAM"
                  ? "പരീക്ഷ സ്വയം സമർപ്പിക്കപ്പെടുന്നു..."
                  : "Submitting examination automatically..."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t.submitConfirmTitle}</h3>
              <p className="text-xs text-slate-500">{t.submitConfirmDesc}</p>
            </div>

            {/* Summary Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">{t.totalQuestions}:</span>
                <b className="text-slate-900 text-sm">{questions.length}</b>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900">
                <span className="font-medium">{t.answered}:</span>
                <b className="text-sm">
                  {(statsCounts["answered"] || 0) + (statsCounts["answered-review"] || 0)}
                </b>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900">
                <span className="font-medium">{t.markedReview}:</span>
                <b className="text-sm">{statsCounts["review"] || 0}</b>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center justify-between text-rose-900">
                <span className="font-medium">{t.notAnswered}:</span>
                <b className="text-sm">
                  {(statsCounts["not-answered"] || 0) + (statsCounts["not-visited"] || 0)}
                </b>
              </div>
            </div>

            {(statsCounts["not-answered"] || 0) + (statsCounts["not-visited"] || 0) > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  {medium === "MALAYALAM"
                    ? "ഉത്തരം നൽകാത്ത ചോദ്യങ്ങളുണ്ട്. അവയ്ക്ക് 0 മാർക്ക് ലഭിക്കും, നെഗറ്റീവ് മാർക്ക് ഇല്ല."
                    : "You have unattempted questions. They will receive 0 marks and will not be penalized."}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
              >
                {t.backToTest}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit()}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {submitting ? t.submitting : t.yesSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
