// Exam schedule window: September 9, 2026 from 10:00 AM to 10:00 PM IST
// In ISO format with IST (+05:30) offset
export const EXAM_WINDOW = {
  START_DATE_STR: "September 9, 2026, 10:00 AM IST",
  END_DATE_STR: "September 9, 2026, 10:00 PM IST",
  // 10:00 AM IST on Sept 9, 2026
  START_TIMESTAMP: new Date("2026-09-09T10:00:00+05:30").getTime(),
  // 10:00 PM IST on Sept 9, 2026
  END_TIMESTAMP: new Date("2026-09-09T22:00:00+05:30").getTime(),
};

export type ExamWindowStatus = "UPCOMING" | "OPEN" | "CLOSED";

export interface ExamWindowInfo {
  status: ExamWindowStatus;
  isOpen: boolean;
  startDateStr: string;
  endDateStr: string;
  msUntilStart: number;
  msUntilEnd: number;
}

export function getExamWindowInfo(currentDate: Date = new Date()): ExamWindowInfo {
  const now = currentDate.getTime();

  if (now < EXAM_WINDOW.START_TIMESTAMP) {
    return {
      status: "UPCOMING",
      isOpen: false,
      startDateStr: EXAM_WINDOW.START_DATE_STR,
      endDateStr: EXAM_WINDOW.END_DATE_STR,
      msUntilStart: Math.max(0, EXAM_WINDOW.START_TIMESTAMP - now),
      msUntilEnd: Math.max(0, EXAM_WINDOW.END_TIMESTAMP - now),
    };
  }

  if (now > EXAM_WINDOW.END_TIMESTAMP) {
    return {
      status: "CLOSED",
      isOpen: false,
      startDateStr: EXAM_WINDOW.START_DATE_STR,
      endDateStr: EXAM_WINDOW.END_DATE_STR,
      msUntilStart: 0,
      msUntilEnd: 0,
    };
  }

  return {
    status: "OPEN",
    isOpen: true,
    startDateStr: EXAM_WINDOW.START_DATE_STR,
    endDateStr: EXAM_WINDOW.END_DATE_STR,
    msUntilStart: 0,
    msUntilEnd: Math.max(0, EXAM_WINDOW.END_TIMESTAMP - now),
  };
}
