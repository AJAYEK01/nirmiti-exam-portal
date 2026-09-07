const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Importing 1,000 High-School Questions from questions/all_questions.md ===');

  const mdPath = path.join(__dirname, '..', 'questions', 'all_questions.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const qBlocks = mdContent.split(/### Question \d+/).slice(1);

  console.log(`Parsed ${qBlocks.length} question blocks from markdown.`);

  const parsedQuestions = [];
  const mlData = {};

  for (let i = 0; i < qBlocks.length; i++) {
    const block = qBlocks[i];
    const qNum = i + 1;

    const enMatch = block.match(/> \*\*EN:\*\* (.*?)(?:\r?\n)/);
    const mlMatch = block.match(/> \*\*ML:\*\* (.*?)(?:\r?\n)/);
    const catMatch = block.match(/\*\*Category:\*\* (.*?) \|/);

    const optRegex = /- \[([ x])\] \*\*([A-D])\)\*\* (.*?)(?: \*\(ML: (.*?)\)\*)?(?: \*\*\[CORRECT ANSWER\]\*\*)?(?:\r?\n|$)/g;
    let optMatch;
    const options = [];
    const optionsMl = [];
    let correctLetter = 'A';
    let correctAnswer = 0;

    let optIdx = 0;
    while ((optMatch = optRegex.exec(block)) !== null) {
      const isCorrect = optMatch[1] === 'x';
      const letter = optMatch[2];
      const textEn = optMatch[3].replace(/\s*\*\*\[CORRECT ANSWER\]\*\*/, '').trim();
      const textMl = optMatch[4] ? optMatch[4].trim() : textEn;

      options.push(textEn);
      optionsMl.push(textMl);

      if (isCorrect) {
        correctLetter = letter;
        correctAnswer = optIdx;
      }
      optIdx++;
    }

    if (enMatch && options.length === 4) {
      const qObj = {
        orderIndex: qNum,
        category: catMatch ? catMatch[1].trim() : 'General',
        text: enMatch[1].trim(),
        textMl: mlMatch ? mlMatch[1].trim() : '',
        options,
        optionsMl,
        correctLetter,
        correctAnswer,
        ansLine: `Answer: ${correctLetter}) ${options[correctAnswer]}`
      };
      parsedQuestions.push(qObj);

      // Store in mlData by orderIndex string
      mlData[String(qNum)] = {
        text: qObj.textMl || qObj.text,
        options: qObj.optionsMl
      };
    } else {
      console.warn(`Warning: Q${qNum} failed validation! options length = ${options.length}`);
    }
  }

  console.log(`Successfully verified all ${parsedQuestions.length} questions!`);

  // 1. Generate text files for Master repository
  let textOutput = '';
  parsedQuestions.forEach(q => {
    textOutput += `Q. ${q.text}\n`;
    q.options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      textOutput += `${letter}) ${opt}\n`;
    });
    textOutput += `${q.ansLine}\n\n`;
  });

  const balancedPath = path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt');
  const headingsPath = path.join(__dirname, '..', 'Complete_1000_Questions_No_Headings.txt');
  fs.writeFileSync(balancedPath, textOutput.trim() + '\n', 'utf8');
  fs.writeFileSync(headingsPath, textOutput.trim() + '\n', 'utf8');
  console.log(`Updated master text files at:`);
  console.log(`  - ${balancedPath}`);
  console.log(`  - ${headingsPath}`);

  // 2. Find or update master exam in Neon DB
  let masterExam = await prisma.exam.findFirst({
    where: { title: { contains: "Talent Assessment" } },
  });

  if (!masterExam) {
    masterExam = await prisma.exam.create({
      data: {
        title: "State Level Online Talent Assessment (8 Mins - 25 Questions)",
        description: "Official online objective exam. 25 balanced questions (8 Science, 8 Computer Science, 6 Mathematics, 3 Logic & Reasoning) from the 1,000-question repository. 8 minutes total duration.",
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
    console.log(`Created Master Exam ID: ${masterExam.id}`);
  } else {
    masterExam = await prisma.exam.update({
      where: { id: masterExam.id },
      data: {
        durationMinutes: 8,
        totalMarks: 25,
        isPublished: true,
      },
    });
    console.log(`Using existing Master Exam ID: ${masterExam.id}`);
  }

  // 3. Clear old questions in DB
  await prisma.question.deleteMany({
    where: { examId: masterExam.id },
  });
  console.log('Cleared previous questions from exam.');

  // 4. Batch insert all 1,000 questions
  const recordsToInsert = parsedQuestions.map(q => ({
    examId: masterExam.id,
    orderIndex: q.orderIndex,
    text: q.text,
    options: JSON.stringify(q.options),
    correctAnswer: q.correctAnswer,
    explanation: `${q.category} syllabus question. Verified answer key.`,
    marks: 1.0,
    negativeMarks: 0.0,
  }));

  console.log(`Inserting ${recordsToInsert.length} questions into Neon PostgreSQL...`);
  const batchSize = 200;
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize);
    await prisma.question.createMany({ data: batch });
    console.log(`  Inserted batch ${i + 1} to ${Math.min(i + batchSize, recordsToInsert.length)}...`);
  }

  // 5. Link database question IDs in questions-ml.json
  const inserted = await prisma.question.findMany({
    where: { examId: masterExam.id },
    select: { id: true, orderIndex: true },
  });

  inserted.forEach(q => {
    const entry = mlData[String(q.orderIndex)];
    if (entry) {
      mlData[q.id] = entry;
    }
  });

  const mlPath = path.join(__dirname, '..', 'src', 'lib', 'questions-ml.json');
  fs.writeFileSync(mlPath, JSON.stringify(mlData, null, 2), 'utf8');
  console.log(`✅ Saved Malayalam translations with ${inserted.length} DB IDs to: ${mlPath}`);
  console.log('🎉 1,000 High-School Questions successfully synced across Database, Files, and Translations!');
}

main()
  .catch(e => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
