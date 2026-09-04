// Test script to verify objective exam scoring engine logic
const { evaluateExam } = require("./src/lib/exam-engine-common.js");

const sampleQuestions = [
  { id: "q1", correctAnswer: 1, marks: 2.0, negativeMarks: 0.5 },
  { id: "q2", correctAnswer: 0, marks: 2.0, negativeMarks: 0.5 },
  { id: "q3", correctAnswer: 2, marks: 2.0, negativeMarks: 0.5 },
  { id: "q4", correctAnswer: 3, marks: 2.0, negativeMarks: 0.5 },
  { id: "q5", correctAnswer: 1, marks: 2.0, negativeMarks: 0.5 },
];

const config = {
  defaultPositiveMarks: 2.0,
  defaultNegativeMarks: 0.5,
  passingMarks: 5.0,
  totalMarks: 10.0,
};

// Candidate answers:
// q1: option 1 (correct, +2.0)
// q2: option 3 (wrong, -0.5)
// q3: option 2 (correct, +2.0)
// q4: null (unattempted, 0)
// q5: option 1 (correct, +2.0)
// Expected score: +2 - 0.5 + 2 + 0 + 2 = 5.5
// Expected correct: 3, incorrect: 1, unattempted: 1
// Expected accuracy: 3 / 4 = 75%
// Expected isPassed: 5.5 >= 5.0 -> true

const candidateAnswers = [
  { questionId: "q1", selectedOption: 1, isMarkedReview: false },
  { questionId: "q2", selectedOption: 3, isMarkedReview: false },
  { questionId: "q3", selectedOption: 2, isMarkedReview: true },
  { questionId: "q4", selectedOption: null, isMarkedReview: false },
  { questionId: "q5", selectedOption: 1, isMarkedReview: false },
];

const result = evaluateExam(sampleQuestions, candidateAnswers, config);
console.log("Evaluation Result:", JSON.stringify(result, null, 2));

if (result.score === 5.5 && result.correctCount === 3 && result.incorrectCount === 1 && result.unattemptedCount === 1 && result.isPassed === true) {
  console.log("✅ SCORING ENGINE TEST PASSED!");
} else {
  console.error("❌ SCORING ENGINE TEST FAILED!");
  process.exit(1);
}
