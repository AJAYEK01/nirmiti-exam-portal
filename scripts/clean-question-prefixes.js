const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REGEX = /^(?:(?:Science Concept|Digital Concept|Math Problem|Logic Puzzle|Concept|Question|Q\.?)\s*\d+\s*:\s*|(?:ശാസ്ത്ര ചോദ്യം|ഡിജിറ്റൽ സാങ്കേതിക ചോദ്യം|ഗണിത ചോദ്യം|യുക്തി ചോദ്യം|ചോദ്യം|സയൻസ് ചോദ്യം|ഐ\.?ടി\.? ചോദ്യം)\s*\d+\s*:\s*)/i;

function clean(str) {
  if (!str) return str;
  return str.replace(REGEX, '').trim();
}

async function main() {
  console.log('=== Cleaning Question Bank Prefixes (e.g. "Science Concept 264:", "ശാസ്ത്ര ചോദ്യം 264:") ===\n');

  // 1. Clean src/lib/questions-ml.json
  const mlPath = path.join(__dirname, '..', 'src', 'lib', 'questions-ml.json');
  if (fs.existsSync(mlPath)) {
    const mlData = JSON.parse(fs.readFileSync(mlPath, 'utf8'));
    let mlCleanedCount = 0;
    for (const [key, val] of Object.entries(mlData)) {
      if (val && val.text && REGEX.test(val.text)) {
        val.text = clean(val.text);
        mlCleanedCount++;
      }
    }
    fs.writeFileSync(mlPath, JSON.stringify(mlData, null, 2), 'utf8');
    console.log(`✅ Cleaned ${mlCleanedCount} question entries in questions-ml.json`);
  }

  // 2. Clean Database Question Records in Neon PostgreSQL
  console.log('Querying all questions in database...');
  const allDbQs = await prisma.question.findMany({
    select: { id: true, text: true }
  });

  let dbCleanedCount = 0;
  for (const q of allDbQs) {
    if (REGEX.test(q.text)) {
      const newText = clean(q.text);
      await prisma.question.update({
        where: { id: q.id },
        data: { text: newText }
      });
      dbCleanedCount++;
    }
  }
  console.log(`✅ Cleaned ${dbCleanedCount} question records in Neon database.`);

  // 3. Clean Master Text Files
  const textFiles = [
    path.join(__dirname, '..', 'Complete_2000_Questions_Balanced.txt'),
    path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt'),
    path.join(__dirname, '..', 'Complete_1000_Questions_No_Headings.txt')
  ];

  for (const tf of textFiles) {
    if (fs.existsSync(tf)) {
      const content = fs.readFileSync(tf, 'utf8');
      const lines = content.split(/\r?\n/);
      const cleanedLines = lines.map(line => {
        if (line.startsWith('Q. ')) {
          const body = line.substring(3);
          return `Q. ${clean(body)}`;
        }
        return line;
      });
      fs.writeFileSync(tf, cleanedLines.join('\n'), 'utf8');
      console.log(`✅ Cleaned master text file: ${path.basename(tf)}`);
    }
  }

  console.log('\n🎉 Successfully stripped all question bank prefixes! All questions are now clean natural questions.');
}

main()
  .catch(err => {
    console.error('Error during cleanup:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
