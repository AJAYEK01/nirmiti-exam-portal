const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "Complete_1000_Questions_No_Headings.txt");
const raw = fs.readFileSync(filePath, "utf-8");

const lines = raw.split(/\r?\n/);

console.log(`Total lines in file: ${lines.length}`);

// Parser state
const questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const lineNum = i + 1;

  if (!line) continue;

  if (line.startsWith("Q.") || line.startsWith("Q:") || /^Q\d+[\.\:]/.test(line)) {
    if (currentQ) {
      questions.push(currentQ);
    }
    currentQ = {
      startLine: lineNum,
      rawText: line,
      questionText: line.replace(/^Q[\.\:\s\d]+/, "").trim(),
      options: [],
      answer: null,
      rawAnswer: null,
    };
  } else if (/^[A-D]\)/i.test(line) || /^[A-D]\./i.test(line)) {
    if (currentQ) {
      currentQ.options.push({
        line: lineNum,
        raw: line,
        text: line.replace(/^[A-D][\)\.]\s*/i, "").trim(),
      });
    }
  } else if (/^Answer\s*[:\-]/i.test(line)) {
    if (currentQ) {
      currentQ.rawAnswer = line;
      currentQ.answer = line.replace(/^Answer\s*[:\-]\s*/i, "").trim();
    }
  } else {
    // Continuation of question text or explanation or unexpected line
    if (currentQ && currentQ.options.length === 0) {
      currentQ.questionText += " " + line;
    } else if (currentQ) {
      // Possible extra line or explanation
      if (!currentQ.extra) currentQ.extra = [];
      currentQ.extra.push({ line: lineNum, text: line });
    }
  }
}

if (currentQ) {
  questions.push(currentQ);
}

console.log(`\n==============================================`);
console.log(`Total Parsed Questions: ${questions.length}`);
console.log(`==============================================`);

// 1. Structure Verification
let missingOptions = [];
let not4Options = [];
let missingAnswer = [];
let invalidAnswerKey = [];

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  if (q.options.length === 0) {
    missingOptions.push({ qNum, line: q.startLine, text: q.questionText });
  } else if (q.options.length !== 4) {
    not4Options.push({ qNum, line: q.startLine, count: q.options.length, text: q.questionText });
  }

  if (!q.answer) {
    missingAnswer.push({ qNum, line: q.startLine, text: q.questionText });
  } else {
    const match = q.answer.match(/^([A-D])/i);
    if (!match) {
      invalidAnswerKey.push({ qNum, line: q.startLine, answer: q.answer });
    }
  }
});

console.log(`\n--- STRUCTURAL CHECKS ---`);
console.log(`Questions with exactly 4 options: ${questions.length - not4Options.length - missingOptions.length}`);
console.log(`Questions missing options: ${missingOptions.length}`);
console.log(`Questions with != 4 options: ${not4Options.length}`);
console.log(`Questions missing answer: ${missingAnswer.length}`);
console.log(`Questions with unrecognized answer format: ${invalidAnswerKey.length}`);

if (not4Options.length > 0) {
  console.log("Samples with != 4 options:", not4Options.slice(0, 5));
}
if (missingAnswer.length > 0) {
  console.log("Samples missing answer:", missingAnswer.slice(0, 5));
}
if (invalidAnswerKey.length > 0) {
  console.log("Samples with invalid answer:", invalidAnswerKey.slice(0, 5));
}

// 2. Uniqueness & Duplicate Analysis
const exactMap = new Map();
const normalizedMap = new Map();

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

questions.forEach((q, idx) => {
  const qNum = idx + 1;
  const rawQ = q.questionText;
  const normQ = normalize(rawQ);

  // Exact
  if (!exactMap.has(rawQ)) {
    exactMap.set(rawQ, []);
  }
  exactMap.get(rawQ).push({ qNum, line: q.startLine, q });

  // Normalized
  if (!normalizedMap.has(normQ)) {
    normalizedMap.set(normQ, []);
  }
  normalizedMap.get(normQ).push({ qNum, line: q.startLine, q });
});

const exactDuplicates = [];
for (const [qText, occurrences] of exactMap.entries()) {
  if (occurrences.length > 1) {
    exactDuplicates.push({ text: qText, occurrences });
  }
}

const normalizedDuplicates = [];
for (const [normText, occurrences] of normalizedMap.entries()) {
  if (occurrences.length > 1) {
    normalizedDuplicates.push({ normText, occurrences });
  }
}

console.log(`\n--- UNIQUENESS & DUPLICATE CHECKS ---`);
console.log(`Unique questions (Exact match): ${exactMap.size}`);
console.log(`Exact duplicate questions found: ${exactDuplicates.length}`);
console.log(`Unique questions (Normalized / punctuation-ignored): ${normalizedMap.size}`);
console.log(`Normalized duplicate questions found: ${normalizedDuplicates.length}`);

// Duplicate options within same question
let duplicateOptionsInSameQ = [];
questions.forEach((q, idx) => {
  const optTexts = q.options.map(o => normalize(o.text));
  const uniqueOpts = new Set(optTexts);
  if (uniqueOpts.size < optTexts.length) {
    duplicateOptionsInSameQ.push({ qNum: idx + 1, line: q.startLine, q: q.questionText, options: q.options.map(o => o.raw) });
  }
});
console.log(`Questions with identical options within themselves: ${duplicateOptionsInSameQ.length}`);

// Save detailed report to JSON
const report = {
  totalCount: questions.length,
  uniqueExactCount: exactMap.size,
  uniqueNormalizedCount: normalizedMap.size,
  exactDuplicatesCount: exactDuplicates.length,
  normalizedDuplicatesCount: normalizedDuplicates.length,
  exactDuplicates: exactDuplicates.map(d => ({
    questionText: d.text,
    count: d.occurrences.length,
    instances: d.occurrences.map(o => ({
      questionNumber: o.qNum,
      line: o.line,
      answer: o.q.rawAnswer,
      options: o.q.options.map(opt => opt.raw),
    })),
  })),
  normalizedDuplicatesOnly: normalizedDuplicates.filter(nd => {
    // only if not already reported in exact
    const distinctExacts = new Set(nd.occurrences.map(o => o.q.questionText));
    return distinctExacts.size > 1;
  }).map(d => ({
    normalizedText: d.normText,
    count: d.occurrences.length,
    instances: d.occurrences.map(o => ({
      questionNumber: o.qNum,
      line: o.line,
      questionText: o.q.questionText,
      answer: o.q.rawAnswer,
    })),
  })),
  structuralIssues: {
    missingOptions,
    not4Options,
    missingAnswer,
    invalidAnswerKey,
    duplicateOptionsInSameQ,
  }
};

fs.writeFileSync(path.join(__dirname, "question_verification_report.json"), JSON.stringify(report, null, 2));
console.log(`\nDetailed verification report saved to question_verification_report.json`);
