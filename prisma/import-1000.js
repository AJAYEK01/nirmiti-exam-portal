const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function importQuestions() {
  console.log("Starting 1,000 questions bank import into Neon PostgreSQL...");

  const filePath = path.join(__dirname, "..", "Complete_1000_Questions_No_Headings.txt");
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/);

  const parsedQuestions = [];
  let currentQ = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("Q.")) {
      if (currentQ && currentQ.options.length === 4 && currentQ.correctAnswer !== -1) {
        parsedQuestions.push(currentQ);
      }
      currentQ = {
        orderIndex: parsedQuestions.length + 1,
        text: line.replace(/^Q\.\s*/, "").trim(),
        options: [],
        correctAnswer: -1,
        explanation: "",
      };
    } else if (/^[A-D]\)/.test(line)) {
      if (currentQ) {
        const text = line.replace(/^[A-D]\)\s*/, "").trim();
        currentQ.options.push(text);
      }
    } else if (line.startsWith("Answer:")) {
      if (currentQ) {
        const ansMatch = line.replace("Answer:", "").trim().match(/^([A-D])/i);
        if (ansMatch) {
          const letter = ansMatch[1].toUpperCase();
          const letterMap = { A: 0, B: 1, C: 2, D: 3 };
          currentQ.correctAnswer = letterMap[letter];
        }
      }
    }
  }

  if (currentQ && currentQ.options.length === 4 && currentQ.correctAnswer !== -1) {
    parsedQuestions.push(currentQ);
  }

  console.log(`Parsed ${parsedQuestions.length} valid questions from text file.`);

  // Find or Create Master Exam
  let masterExam = await prisma.exam.findFirst({
    where: { title: { contains: "Talent Assessment" } },
  });

  if (!masterExam) {
    masterExam = await prisma.exam.create({
      data: {
        title: "State Level Online Talent Assessment (8 Mins - 25 Questions)",
        description: "Official online objective exam. 25 randomized questions from the 1,000-question bank. 8 minutes total duration with synchronized auto-submit.",
        category: "General Knowledge & IT",
        durationMinutes: 8,
        totalMarks: 25,
        passingMarks: 10,
        positiveMarks: 1.0,
        negativeMarks: 0.0,
        shuffleQuestions: true,
        isPublished: true,
      },
    });
    console.log(`Created Master Exam: ${masterExam.title} (ID: ${masterExam.id})`);
  } else {
    // Update settings if needed
    masterExam = await prisma.exam.update({
      where: { id: masterExam.id },
      data: {
        durationMinutes: 8,
        totalMarks: 25,
        isPublished: true,
      },
    });
    console.log(`Using existing Master Exam: ${masterExam.title} (ID: ${masterExam.id})`);
  }

  // Delete older questions for this exam to ensure fresh import
  await prisma.question.deleteMany({
    where: { examId: masterExam.id },
  });

  // Prepare batch insert
  const recordsToInsert = parsedQuestions.map((q, idx) => ({
    examId: masterExam.id,
    orderIndex: idx + 1,
    text: q.text,
    options: JSON.stringify(q.options),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "Official answer key verified.",
    marks: 1.0,
    negativeMarks: 0.0,
  }));

  console.log(`Inserting ${recordsToInsert.length} questions into database...`);

  // Insert in batches of 200 for maximum safety and performance
  const batchSize = 200;
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize);
    await prisma.question.createMany({
      data: batch,
    });
    console.log(`  Inserted batch ${i + 1} to ${Math.min(i + batchSize, recordsToInsert.length)}...`);
  }

  const finalCount = await prisma.question.count({
    where: { examId: masterExam.id },
  });

  console.log(`✅ Successfully imported ${finalCount} questions into exam ID: ${masterExam.id}`);

  // Link newly generated database question IDs in questions-ml.json
  const insertedQuestions = await prisma.question.findMany({
    where: { examId: masterExam.id },
    select: { id: true, orderIndex: true },
  });

  const mlPath = path.join(__dirname, "..", "src", "lib", "questions-ml.json");
  let mlData = {};
  try {
    mlData = JSON.parse(fs.readFileSync(mlPath, "utf8"));
  } catch (e) {}

  insertedQuestions.forEach((q) => {
    const byIndex = mlData[String(q.orderIndex)];
    if (byIndex) {
      mlData[q.id] = byIndex;
    }
  });

  fs.writeFileSync(mlPath, JSON.stringify(mlData, null, 2), "utf8");
  console.log(`✅ Synced ${insertedQuestions.length} database IDs with Malayalam translations.`);
}

importQuestions()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
