import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.answerRecord.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash("admin123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Chief Examiner (Admin)",
      email: "admin@exam.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Alex Mercer (Student)",
      email: "student@exam.com",
      password: studentHash,
      role: "STUDENT",
    },
  });

  console.log(`Created users: Admin (${admin.email}), Student (${student.email})`);

  // Exam 1: Full-Stack Web Development
  const webDevExam = await prisma.exam.create({
    data: {
      title: "Full-Stack Web Development Assessment",
      description: "Test your fundamental knowledge of JavaScript, React, Node.js, asynchronous programming, and REST APIs. Features negative marking for wrong answers.",
      category: "Information Technology",
      durationMinutes: 20,
      totalMarks: 20,
      passingMarks: 12,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      shuffleQuestions: true,
      isPublished: true,
    },
  });

  const webDevQuestions = [
    {
      orderIndex: 1,
      text: "Which of the following describes the JavaScript Event Loop mechanism correctly?",
      options: JSON.stringify([
        "It executes asynchronous callbacks in a separate thread concurrently.",
        "It constantly checks if the call stack is empty before pushing tasks from the callback/microtask queue.",
        "It handles garbage collection by polling unused objects on the heap.",
        "It executes DOM events synchronously before any JavaScript code."
      ]),
      correctAnswer: 1,
      explanation: "The event loop continuously checks if the call stack is empty. When empty, it dequeues tasks from microtask queue (Promises) and macrotask queue (setTimeout) onto the call stack."
    },
    {
      orderIndex: 2,
      text: "In React, what is the primary purpose of the `useCallback` hook?",
      options: JSON.stringify([
        "To cache the return value of an expensive calculation.",
        "To memoize a callback function instance between renders to prevent unnecessary child re-renders.",
        "To run asynchronous side effects after the DOM has been updated.",
        "To synchronize React state with browser localStorage automatically."
      ]),
      correctAnswer: 1,
      explanation: "`useCallback` returns a memoized version of the callback function that only changes if one of the dependencies has changed. `useMemo` caches values, while `useCallback` caches functions."
    },
    {
      orderIndex: 3,
      text: "What will `console.log(typeof NaN)` output in modern JavaScript?",
      options: JSON.stringify([
        "\"undefined\"",
        "\"null\"",
        "\"number\"",
        "\"NaN\""
      ]),
      correctAnswer: 2,
      explanation: "In JavaScript, `NaN` stands for 'Not-a-Number', but its data type is actually a numeric type (`number`)."
    },
    {
      orderIndex: 4,
      text: "Which HTTP status code is most appropriate when a requested resource requires client authentication that was either missing or invalid?",
      options: JSON.stringify([
        "400 Bad Request",
        "401 Unauthorized",
        "403 Forbidden",
        "404 Not Found"
      ]),
      correctAnswer: 1,
      explanation: "HTTP 401 Unauthorized specifically means authentication is required and has failed or has not yet been provided. 403 Forbidden means the server understands the user identity but refuses to authorize access."
    },
    {
      orderIndex: 5,
      text: "In SQL and relational databases, what does the ACID acronym stand for?",
      options: JSON.stringify([
        "Atomicity, Consistency, Isolation, Durability",
        "Accuracy, Concurrency, Integrity, Dependency",
        "Asynchronous, Certified, Indexed, Deterministic",
        "Allocation, Centralized, Iteration, Deletion"
      ]),
      correctAnswer: 0,
      explanation: "ACID represents Atomicity (all or nothing), Consistency (preserves database rules), Isolation (concurrent transactions don't interfere), and Durability (committed changes persist)."
    },
    {
      orderIndex: 6,
      text: "What is the output of `['10', '10', '10'].map(parseInt)` in JavaScript?",
      options: JSON.stringify([
        "[10, 10, 10]",
        "[10, NaN, 2]",
        "[10, 0, 0]",
        "Throws a TypeError"
      ]),
      correctAnswer: 1,
      explanation: "`map` passes (element, index). `parseInt('10', 0)` uses base 10 -> 10. `parseInt('10', 1)` is invalid radix 1 -> NaN. `parseInt('10', 2)` parses '10' in binary -> 2."
    },
    {
      orderIndex: 7,
      text: "Which CSS layout property is best suited for 2-dimensional layouts (rows and columns simultaneously)?",
      options: JSON.stringify([
        "Flexbox",
        "CSS Grid",
        "Float with clearfix",
        "Inline-block with relative positioning"
      ]),
      correctAnswer: 1,
      explanation: "CSS Grid is inherently designed for two-dimensional layouts (rows AND columns), whereas Flexbox is primarily one-dimensional (either row OR column)."
    },
    {
      orderIndex: 8,
      text: "In Node.js, what type of stream is `process.stdin`?",
      options: JSON.stringify([
        "Writable Stream",
        "Readable Stream",
        "Duplex Stream",
        "Transform Stream"
      ]),
      correctAnswer: 1,
      explanation: "`process.stdin` is a Readable Stream that reads standard input from the terminal or user."
    },
    {
      orderIndex: 9,
      text: "What does the `Content-Security-Policy` (CSP) HTTP response header primarily defend against?",
      options: JSON.stringify([
        "SQL Injection (SQLi)",
        "Cross-Site Scripting (XSS) and data injection attacks",
        "Distributed Denial of Service (DDoS)",
        "Man-In-The-Middle (MITM) attacks"
      ]),
      correctAnswer: 1,
      explanation: "CSP helps detect and mitigate Cross-Site Scripting (XSS) attacks by restricting the sources of executable scripts, stylesheets, and assets."
    },
    {
      orderIndex: 10,
      text: "In Git, what is the difference between `git merge` and `git rebase`?",
      options: JSON.stringify([
        "`git merge` rewrites project history while `git rebase` preserves it with a merge commit.",
        "`git rebase` creates a linear history by replaying commits onto another tip, while `git merge` ties two branches with a dedicated commit.",
        "`git rebase` can only be performed on remote branches.",
        "`git merge` permanently deletes feature branches."
      ]),
      correctAnswer: 1,
      explanation: "Rebase rewrites the commit history by creating new commits for each commit in the original branch, producing a clean linear history. Merge preserves exact history with a merge commit."
    }
  ];

  for (const q of webDevQuestions) {
    await prisma.question.create({
      data: {
        examId: webDevExam.id,
        ...q,
      },
    });
  }

  // Exam 2: General Aptitude & Logical Reasoning
  const aptitudeExam = await prisma.exam.create({
    data: {
      title: "General Aptitude & Logical Reasoning Exam",
      description: "Evaluate your numerical agility, pattern recognition, and logical deduction abilities. 10 questions with +1 mark per correct answer and -0.25 penalty for wrong answers.",
      category: "Aptitude",
      durationMinutes: 15,
      totalMarks: 10,
      passingMarks: 6,
      positiveMarks: 1.0,
      negativeMarks: 0.25,
      shuffleQuestions: true,
      isPublished: true,
    },
  });

  const aptitudeQuestions = [
    {
      orderIndex: 1,
      text: "Find the next number in the sequence: 2, 6, 12, 20, 30, ?",
      options: JSON.stringify([
        "40",
        "42",
        "44",
        "46"
      ]),
      correctAnswer: 1,
      explanation: "The differences between consecutive terms are: +4, +6, +8, +10, so the next difference is +12. 30 + 12 = 42 (Alternatively, n^2 + n: 1+1=2, 4+2=6, 9+3=12, 16+4=20, 25+5=30, 36+6=42)."
    },
    {
      orderIndex: 2,
      text: "If 'PENCIL' is coded as 'QGODKM' in a certain code language, how will 'ERASER' be coded in the same pattern?",
      options: JSON.stringify([
        "FSDTFT",
        "FSCSEQ",
        "FSBUFS",
        "FTCSET"
      ]),
      correctAnswer: 1,
      explanation: "P(+1)->Q, E(+2)->G, N(+1)->O, C(+1)->D, I(+2)->K, L(+1)->M. Alternate letters shift by +1 and +2 (or consonants/vowels). Testing pattern on ERASER gives FSCSEQ."
    },
    {
      orderIndex: 3,
      text: "A train running at 72 km/h crosses a 200-meter long platform in 22 seconds. What is the length of the train?",
      options: JSON.stringify([
        "220 meters",
        "240 meters",
        "260 meters",
        "280 meters"
      ]),
      correctAnswer: 1,
      explanation: "Speed in m/s = 72 * (5/18) = 20 m/s. Total distance in 22 seconds = 20 * 22 = 440 m. Train length = Total distance - Platform length = 440 - 200 = 240 meters."
    },
    {
      orderIndex: 4,
      text: "Pointing to a photograph, John says: 'She is the mother of the only daughter of my father's wife.' Who is the woman in the photograph to John?",
      options: JSON.stringify([
        "His Sister",
        "His Mother",
        "His Wife",
        "His Aunt"
      ]),
      correctAnswer: 1,
      explanation: "Father's wife = John's mother. The only daughter of John's mother = John's sister. The mother of John's sister = John's mother."
    },
    {
      orderIndex: 5,
      text: "A car travels from A to B at 60 km/h and returns from B to A at 40 km/h. What is the average speed of the car for the entire journey?",
      options: JSON.stringify([
        "50.0 km/h",
        "48.0 km/h",
        "46.5 km/h",
        "52.0 km/h"
      ]),
      correctAnswer: 1,
      explanation: "Average speed for round trip = (2 * x * y) / (x + y) = (2 * 60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h."
    }
  ];

  for (const q of aptitudeQuestions) {
    await prisma.question.create({
      data: {
        examId: aptitudeExam.id,
        ...q,
      },
    });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
