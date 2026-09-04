export interface QuestionForGrading {
  id: string;
  correctAnswer: number;
  marks?: number | null;
  negativeMarks?: number | null;
}

export interface CandidateAnswer {
  questionId: string;
  selectedOption: number | null;
  isMarkedReview: boolean;
}

export interface ExamGradingConfig {
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  passingMarks: number;
  totalMarks: number;
}

export interface GradingResult {
  score: number;
  totalMarks: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracyPercentage: number;
  percentage: number;
  isPassed: boolean;
  gradedAnswers: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
    marksAwarded: number;
    isMarkedReview: boolean;
  }[];
}

export function evaluateExam(
  questions: QuestionForGrading[],
  candidateAnswers: CandidateAnswer[],
  config: ExamGradingConfig
): GradingResult {
  const answerMap = new Map<string, CandidateAnswer>();
  candidateAnswers.forEach((ans) => answerMap.set(ans.questionId, ans));

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const gradedAnswers = questions.map((q) => {
    const candidateAns = answerMap.get(q.id);
    const selectedOption = candidateAns ? candidateAns.selectedOption : null;
    const isMarkedReview = candidateAns ? candidateAns.isMarkedReview : false;

    const posMark = q.marks ?? config.defaultPositiveMarks;
    const negMark = q.negativeMarks ?? config.defaultNegativeMarks;

    let isCorrect = false;
    let marksAwarded = 0;

    if (selectedOption === null || selectedOption === undefined) {
      unattemptedCount++;
      marksAwarded = 0;
    } else if (selectedOption === q.correctAnswer) {
      isCorrect = true;
      correctCount++;
      marksAwarded = posMark;
      totalScore += posMark;
    } else {
      isCorrect = false;
      incorrectCount++;
      marksAwarded = -Math.abs(negMark);
      totalScore -= Math.abs(negMark);
    }

    return {
      questionId: q.id,
      selectedOption,
      isCorrect,
      marksAwarded,
      isMarkedReview,
    };
  });

  const attemptedCount = correctCount + incorrectCount;
  const accuracyPercentage =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  
  // Clean floating point rounding issues
  const roundedScore = Math.round(totalScore * 100) / 100;
  const percentage =
    config.totalMarks > 0
      ? Math.max(0, Math.round((roundedScore / config.totalMarks) * 100))
      : 0;

  const isPassed = roundedScore >= config.passingMarks;

  return {
    score: roundedScore,
    totalMarks: config.totalMarks,
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracyPercentage,
    percentage,
    isPassed,
    gradedAnswers,
  };
}
