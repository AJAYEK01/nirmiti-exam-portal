const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Merging Question Banks to 2,000 Questions (60% Easy, 35% Medium, 5% Challenging) ===\n');

  // 1. Load 1,000 questions from questions/all_questions.md
  console.log('Loading 1,000 questions from questions/all_questions.md...');
  const mdPath = path.join(__dirname, '..', 'questions', 'all_questions.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const qBlocks = mdContent.split(/### Question \d+/).slice(1);

  const mdQs = [];
  for (let i = 0; i < qBlocks.length; i++) {
    const block = qBlocks[i];
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
      mdQs.push({
        source: 'questions_folder',
        category: catMatch ? catMatch[1].trim() : 'General',
        text: enMatch[1].trim(),
        textMl: mlMatch ? mlMatch[1].trim() : enMatch[1].trim(),
        options,
        optionsMl,
        correctLetter,
        correctAnswer,
        ansLine: `Answer: ${correctLetter}) ${options[correctAnswer]}`
      });
    }
  }
  console.log(`Loaded ${mdQs.length} questions from questions folder.`);

  // 2. Load 1,000 questions from git commit e1e9eb8 (Complete_1000_Questions_Balanced.txt)
  console.log('Loading 1,000 questions from previous balanced bank...');
  const gitTxt = execSync('git show e1e9eb8:Complete_1000_Questions_Balanced.txt', { maxBuffer: 20 * 1024 * 1024 }).toString('utf8');
  const gitLines = gitTxt.split(/\r?\n/);
  let prevQs = [];
  let cur = null;
  for (let line of gitLines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith('Q.')) {
      if (cur) prevQs.push(cur);
      cur = { text: line.replace(/^Q\.\s*/, '').trim(), options: [], ansLine: '' };
    } else if (/^[A-D]\)/.test(line)) {
      if (cur) cur.options.push(line.replace(/^[A-D]\)\s*/, '').trim());
    } else if (line.startsWith('Answer:')) {
      if (cur) cur.ansLine = line;
    }
  }
  if (cur) prevQs.push(cur);

  // Load translations from git commit e1e9eb8
  const prevMl = JSON.parse(execSync('git show e1e9eb8:src/lib/questions-ml.json', { maxBuffer: 20 * 1024 * 1024 }).toString('utf8'));

  // Attach translations to prevQs
  prevQs.forEach((q, idx) => {
    const qNum = idx + 1;
    const mlEntry = prevMl[String(qNum)] || { text: q.text, options: q.options };
    q.textMl = mlEntry.text || q.text;
    q.optionsMl = mlEntry.options || q.options;
    
    // Parse correct answer
    const ansMatch = q.ansLine.replace('Answer:', '').trim().match(/^([A-D])/i);
    const letter = ansMatch ? ansMatch[1].toUpperCase() : 'A';
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    q.correctLetter = letter;
    q.correctAnswer = letterMap[letter] ?? 0;
  });
  console.log(`Loaded ${prevQs.length} questions from previous balanced bank.`);

  // 3. Partition into Target Distribution:
  // Target: 2,000 questions
  // - Easy: 1,200 questions (60%)
  // - Medium: 700 questions (35%)
  // - Challenging: 100 questions (5%)

  // Easy pool:
  // 500 from prevQs (Q1-Q500) + 700 from mdQs (0 to 700)
  const prevEasy500 = prevQs.slice(0, 500);
  const mdEasy700 = mdQs.slice(0, 700);
  const easy1200 = [...prevEasy500, ...mdEasy700];

  // Medium pool:
  // 400 from prevQs (Q501-Q900) + 300 from mdQs (700 to 1000)
  const prevMed400 = prevQs.slice(500, 900);
  const mdMed300 = mdQs.slice(700, 1000);
  const medium700 = [...prevMed400, ...mdMed300];

  // Challenging pool:
  // 100 from prevQs (Q901-Q1000, calculations, circuits, transformers, python tracing)
  const challenging100 = prevQs.slice(900, 1000);

  console.log(`\n--- Assembled Distribution ---`);
  console.log(`1. EASY:        ${easy1200.length} questions (${(easy1200.length / 20).toFixed(1)}%)  [Target: 1,200 (60%)]`);
  console.log(`2. MEDIUM:      ${medium700.length} questions (${(medium700.length / 20).toFixed(1)}%)   [Target: 700 (35%)]`);
  console.log(`3. CHALLENGING: ${challenging100.length} questions (${(challenging100.length / 20).toFixed(1)}%)   [Target: 100 (5%)]`);
  console.log(`TOTAL:          ${easy1200.length + medium700.length + challenging100.length} questions (100.0%)\n`);

  // Final 2,000 array
  const all2000 = [...easy1200, ...medium700, ...challenging100];
  const mlDict = {};

  all2000.forEach((q, idx) => {
    q.orderIndex = idx + 1;
    mlDict[String(q.orderIndex)] = {
      text: q.textMl || q.text,
      options: q.optionsMl || q.options,
    };
  });

  // Validate every question
  let errors = 0;
  all2000.forEach(q => {
    if (!q.text || q.options.length !== 4 || q.correctAnswer < 0 || q.correctAnswer > 3) {
      errors++;
      console.error(`Validation error at Q${q.orderIndex}`);
    }
  });

  if (errors > 0) {
    console.error(`❌ Found ${errors} validation errors!`);
    process.exit(1);
  }
  console.log(`✅ All 2,000 questions passed 100% strict validation!`);

  // 4. Write out text files
  let textContent = '';
  all2000.forEach(q => {
    textContent += `Q. ${q.text}\n`;
    q.options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      textContent += `${letter}) ${opt}\n`;
    });
    textContent += `${q.ansLine}\n\n`;
  });

  const txtPath1 = path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt');
  const txtPath2 = path.join(__dirname, '..', 'Complete_1000_Questions_No_Headings.txt');
  const txtPath2000 = path.join(__dirname, '..', 'Complete_2000_Questions_Balanced.txt');
  fs.writeFileSync(txtPath1, textContent.trim() + '\n', 'utf8');
  fs.writeFileSync(txtPath2, textContent.trim() + '\n', 'utf8');
  fs.writeFileSync(txtPath2000, textContent.trim() + '\n', 'utf8');
  console.log(`Wrote 2,000 questions to master text files.`);

  // 5. Update Master Exam in Neon DB
  let masterExam = await prisma.exam.findFirst({
    where: { title: { contains: "Talent Assessment" } },
  });

  if (!masterExam) {
    masterExam = await prisma.exam.create({
      data: {
        title: "State Level Online Talent Assessment (8 Mins - 25 Questions)",
        description: "Official online objective exam. 25 randomized questions (15 Easy, 9 Medium, 1 Challenging) from the 2,000-question repository. 8 minutes total duration.",
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

  // Delete previous questions
  await prisma.question.deleteMany({
    where: { examId: masterExam.id },
  });
  console.log('Cleared previous questions in DB.');

  // Batch insert all 2,000 questions
  console.log('Inserting 2,000 questions into Neon PostgreSQL...');
  const records = all2000.map(q => ({
    examId: masterExam.id,
    orderIndex: q.orderIndex,
    text: q.text,
    options: JSON.stringify(q.options),
    correctAnswer: q.correctAnswer,
    explanation: 'Official verified answer key.',
    marks: 1.0,
    negativeMarks: 0.0,
  }));

  const batchSize = 250;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await prisma.question.createMany({ data: batch });
    console.log(`  Inserted batch ${i + 1} to ${Math.min(i + batchSize, records.length)}...`);
  }

  // Link DB IDs in questions-ml.json
  const insertedQs = await prisma.question.findMany({
    where: { examId: masterExam.id },
    select: { id: true, orderIndex: true },
  });

  insertedQs.forEach(q => {
    const mlEntry = mlDict[String(q.orderIndex)];
    if (mlEntry) {
      mlDict[q.id] = mlEntry;
    }
  });

  const mlPath = path.join(__dirname, '..', 'src', 'lib', 'questions-ml.json');
  fs.writeFileSync(mlPath, JSON.stringify(mlDict, null, 2), 'utf8');
  console.log(`Saved 2,000 Malayalam translations (mapped by orderIndex and DB ID) to: ${mlPath}`);
  console.log('\n🎉 Successfully merged and loaded 2,000 questions into Database!');
}

main()
  .catch(e => {
    console.error('Merge error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
