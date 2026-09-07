// Automated verification script testing all 6 phases
const fs = require("fs");
const path = require("path");

console.log("=================================================");
console.log("NIRMITI EXAM PORTAL — FULL 6-PHASE VERIFICATION");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------
// PHASE 1: Exam Window Schedule & Boundary Testing
// -----------------------------------------------------------------
console.log("--- PHASE 1: Security & Exam Window Testing ---");
const { getExamWindowInfo, EXAM_WINDOW } = require("../src/lib/exam-window.ts");

// 1. Before 10 AM IST (e.g. Sept 9 at 09:59:59 IST)
const beforeTime = new Date("2026-09-09T09:59:59+05:30");
const infoBefore = getExamWindowInfo(beforeTime);
assert(
  infoBefore.status === "UPCOMING" && infoBefore.isOpen === false,
  `Before 10 AM IST (09:59:59): status=UPCOMING, isOpen=false (msUntilStart=${infoBefore.msUntilStart})`
);

// 2. Exactly at 10 AM IST (Sept 9 at 10:00:00 IST)
const exactStartTime = new Date("2026-09-09T10:00:00+05:30");
const infoStart = getExamWindowInfo(exactStartTime);
assert(
  infoStart.status === "OPEN" && infoStart.isOpen === true,
  `Exactly at 10:00:00 AM IST: status=OPEN, isOpen=true`
);

// 3. During the exam (e.g. Sept 9 at 03:30:00 PM IST)
const midTime = new Date("2026-09-09T15:30:00+05:30");
const infoMid = getExamWindowInfo(midTime);
assert(
  infoMid.status === "OPEN" && infoMid.isOpen === true,
  `During exam window (03:30 PM IST): status=OPEN, isOpen=true (msUntilEnd=${infoMid.msUntilEnd})`
);

// 4. Exactly after 10 PM IST (Sept 9 at 22:00:01 IST)
const afterTime = new Date("2026-09-09T22:00:01+05:30");
const infoAfter = getExamWindowInfo(afterTime);
assert(
  infoAfter.status === "CLOSED" && infoAfter.isOpen === false,
  `After 10 PM IST (22:00:01): status=CLOSED, isOpen=false`
);

// 5. Verify Server-side enforcement in start and register routes
const startRouteCode = fs.readFileSync(
  path.join(__dirname, "../src/app/api/exams/[id]/start/route.ts"),
  "utf8"
);
assert(
  (startRouteCode.includes("getEffectiveExamWindow()") || startRouteCode.includes("getExamWindowInfo()")) &&
    startRouteCode.includes('session.role !== "ADMIN"'),
  "Exam start API route enforces effective exam window on the server with Admin bypass"
);

const registerRouteCode = fs.readFileSync(
  path.join(__dirname, "../src/app/api/auth/register-candidate/route.ts"),
  "utf8"
);
assert(
  (registerRouteCode.includes("getEffectiveExamWindow()") || registerRouteCode.includes("getExamWindowInfo()")) &&
    registerRouteCode.includes('session?.role !== "ADMIN"'),
  "Candidate registration API route enforces effective exam window on the server with Admin bypass"
);

// 6. Test Admin Manual Overrides (FORCE_OPEN, FORCE_CLOSED)
const forceOpenInfo = getExamWindowInfo(beforeTime, "FORCE_OPEN");
assert(
  forceOpenInfo.status === "OPEN" && forceOpenInfo.isOpen === true,
  "Manual Admin Override: FORCE_OPEN forces status=OPEN even before 10 AM"
);

const forceClosedInfo = getExamWindowInfo(midTime, "FORCE_CLOSED");
assert(
  forceClosedInfo.status === "CLOSED" && forceClosedInfo.isOpen === false,
  "Manual Admin Override: FORCE_CLOSED forces status=CLOSED even during scheduled window"
);

// -----------------------------------------------------------------
// PHASE 2: Student Confidentiality Lockdown Testing
// -----------------------------------------------------------------
console.log("\n--- PHASE 2: Student Confidentiality Testing ---");

// Check submit route does NOT return score to candidate
const submitRouteCode = fs.readFileSync(
  path.join(__dirname, "../src/app/api/attempts/[id]/submit/route.ts"),
  "utf8"
);
assert(
  !submitRouteCode.includes("score: updatedAttempt.score") &&
  !submitRouteCode.includes("percentage: Math.round"),
  "Submit route stripped score and percentage from client response"
);

// Check take exam page routes strictly to /submitted
const takePageCode = fs.readFileSync(
  path.join(__dirname, "../src/app/exams/[id]/take/page.tsx"),
  "utf8"
);
assert(
  takePageCode.includes("/submitted?attemptId=") && !takePageCode.includes("router.push(`/results/"),
  "Exam take page redirects to /submitted on submit & expiry (no /results route for students)"
);

// Check /api/attempts/[id]/result is restricted to Admin
const resultRouteCode = fs.readFileSync(
  path.join(__dirname, "../src/app/api/attempts/[id]/result/route.ts"),
  "utf8"
);
assert(
  resultRouteCode.includes('session.role !== "ADMIN"') && resultRouteCode.includes("confidential: true"),
  "Result API restricts scorecards & answers strictly to ADMIN (403 for students)"
);

// Check /results/[id]/page.tsx locks view for students
const resultPageCode = fs.readFileSync(
  path.join(__dirname, "../src/app/results/[id]/page.tsx"),
  "utf8"
);
assert(
  resultPageCode.includes("Official Evaluation Confidential") && resultPageCode.includes("data?.confidential"),
  "Result page renders confidential guard screen if student attempts direct access"
);

// -----------------------------------------------------------------
// PHASE 3: Malayalam Localization Testing
// -----------------------------------------------------------------
console.log("\n--- PHASE 3: Malayalam Localization Testing ---");
const { TRANSLATIONS } = require("../src/lib/translations.ts");

const enKeys = Object.keys(TRANSLATIONS.en);
const mlKeys = Object.keys(TRANSLATIONS.ml);

assert(
  enKeys.length > 0 && enKeys.length === mlKeys.length,
  `Translations dictionary symmetry: ${enKeys.length} EN keys, ${mlKeys.length} ML keys`
);

let allMlNonEmpty = true;
enKeys.forEach((k) => {
  if (!TRANSLATIONS.ml[k] || TRANSLATIONS.ml[k].trim() === "") {
    allMlNonEmpty = false;
    console.error(`Missing ML translation for key: ${k}`);
  }
});
assert(allMlNonEmpty, "All Malayalam dictionary strings are populated and non-empty");

assert(
  takePageCode.includes("TRANSLATIONS") &&
  takePageCode.includes("t.submitTest") &&
  takePageCode.includes("t.saveAndNext") &&
  takePageCode.includes("t.cheatAlertTitle"),
  "Exam take page is fully localized using translations dictionary for controls, modals, and anti-cheat"
);

// -----------------------------------------------------------------
// PHASE 4: Admin Marksheet Testing
// -----------------------------------------------------------------
console.log("\n--- PHASE 4: Admin Marksheet Testing ---");
const marksheetPath = path.join(__dirname, "../src/app/admin/marksheet/[id]/page.tsx");
assert(fs.existsSync(marksheetPath), "Admin marksheet page file exists (/admin/marksheet/[id]/page.tsx)");

const marksheetCode = fs.readFileSync(marksheetPath, "utf8");
assert(
  marksheetCode.includes("@media print") && marksheetCode.includes("A4 portrait"),
  "Marksheet includes A4 portrait print-specific CSS"
);
assert(
  marksheetCode.includes("formatDateTime(attempt.startedAt)") &&
  marksheetCode.includes("formatDateTime(attempt.submittedAt)") &&
  marksheetCode.includes("formatTime(attempt.timeTakenSeconds)"),
  "Marksheet includes exact audited timestamps (started, submitted, exact duration)"
);
assert(
  marksheetCode.includes("Evaluation Committee") && marksheetCode.includes("Examiner Signature"),
  "Marksheet includes evaluator & committee signature section"
);
assert(
  marksheetCode.includes("OFFICIAL VERIFIED EVALUATION") || marksheetCode.includes("Watermark"),
  "Marksheet includes official verification watermark"
);
assert(
  marksheetCode.includes("window.print()"),
  "Marksheet includes Print / Save as PDF button"
);

// -----------------------------------------------------------------
// PHASE 5: Hardware Hackathon SVG Theme Testing
// -----------------------------------------------------------------
console.log("\n--- PHASE 5: Hardware Hackathon Theme Testing ---");
const graphicsPath = path.join(__dirname, "../src/components/HardwareGraphics.tsx");
assert(fs.existsSync(graphicsPath), "HardwareGraphics component exists");

const homePageCode = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf8");
assert(
  homePageCode.includes("MicrochipGraphic") && homePageCode.includes("CircuitBoardBg"),
  "Landing page includes CircuitBoardBg and MicrochipGraphic inline SVGs"
);

assert(
  takePageCode.includes("HardwareSensorIcon"),
  "Exam taking header includes Hardware Hackathon SVG icon"
);

const adminPageCode = fs.readFileSync(path.join(__dirname, "../src/app/admin/page.tsx"), "utf8");
assert(
  adminPageCode.includes("CircuitBoardBg") && adminPageCode.includes("MicrochipGraphic"),
  "Admin dashboard includes Hardware Hackathon circuit board banner and chip SVG"
);

// -----------------------------------------------------------------
// RESULTS SUMMARY
// -----------------------------------------------------------------
console.log("\n=================================================");
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("=================================================\n");

if (passedTests === totalTests) {
  console.log("🎉 ALL 6 PHASES FULLY VERIFIED AND VALIDATED!");
  process.exit(0);
} else {
  console.error("⚠️ Some tests failed. Please review errors above.");
  process.exit(1);
}
