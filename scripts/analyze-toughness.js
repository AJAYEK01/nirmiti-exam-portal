const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt');
const raw = fs.readFileSync(targetFile, 'utf8');
const lines = raw.split(/\r?\n/);

let questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line.startsWith('Q.')) {
    if (currentQ) questions.push(currentQ);
    currentQ = {
      index: questions.length + 1,
      text: line.replace(/^Q\.\s*/, '').trim(),
      options: [],
      answer: ''
    };
  } else if (/^[A-D]\)/.test(line)) {
    if (currentQ) currentQ.options.push(line);
  } else if (line.startsWith('Answer:')) {
    if (currentQ) currentQ.answer = line;
  }
}
if (currentQ) questions.push(currentQ);

console.log('===============================================================');
console.log('       KERALA STATE SYLLABUS 1,000 QUESTION BANK ANALYSIS      ');
console.log('             Target Standard: Classes 8, 9 & 10                ');
console.log('===============================================================\n');

console.log(`Total Questions in Bank: ${questions.length}`);

// Segment analysis
const easyQuestions = questions.slice(0, 500);
const mediumQuestions = questions.slice(500, 900);
const challengingQuestions = questions.slice(900, 1000);

console.log(`\n--- TOUGHNESS DISTRIBUTION ---`);
console.log(`1. EASY (Classes 4-8 Foundation):      ${easyQuestions.length} questions (${(easyQuestions.length / 10).toFixed(1)}%)`);
console.log(`2. MEDIUM (Classes 8-10 Standard):     ${mediumQuestions.length} questions (${(mediumQuestions.length / 10).toFixed(1)}%)`);
console.log(`3. CHALLENGING (Topper Selectors):     ${challengingQuestions.length} questions (${(challengingQuestions.length / 10).toFixed(1)}%)\n`);

// Check formatting integrity
let formatErrors = 0;
questions.forEach((q, idx) => {
  if (!q.text || q.options.length !== 4 || !q.answer.startsWith('Answer:')) {
    formatErrors++;
    console.error(`Format issue at Q${idx + 1}`);
  }
});

console.log(`Formatting & Integrity Check: ${formatErrors === 0 ? '✅ 100% VALID (4 options & valid answers for all 1,000 questions)' : '❌ Errors detected: ' + formatErrors}`);

// Topic breakdown helper
function getTopicStats(list) {
  let stats = { Science_Physics: 0, IT_Computers: 0, Mathematics: 0, Robotics_Electronics: 0 };
  list.forEach(q => {
    const txt = (q.text + ' ' + q.options.join(' ')).toLowerCase();
    if (txt.includes('scratch') || txt.includes('python') || txt.includes('libreoffice') || txt.includes('linux') || txt.includes('browser') || txt.includes('keyboard') || txt.includes('tux paint') || txt.includes('desktop') || txt.includes('mouse') || txt.includes('monitor') || txt.includes('file') || txt.includes('icon') || txt.includes('url') || txt.includes('email')) {
      stats.IT_Computers++;
    } else if (txt.includes('arduino') || txt.includes('breadboard') || txt.includes('sensor') || txt.includes('resistor') || txt.includes('circuit') || txt.includes('ohm') || txt.includes('led') || txt.includes('buzzer')) {
      stats.Robotics_Electronics++;
    } else if (txt.includes('triangle') || txt.includes('circle') || txt.includes('area') || txt.includes('perimeter') || txt.includes('percentage') || txt.includes('ratio') || txt.includes('lcm') || txt.includes('hcf') || txt.includes('pythagoras') || txt.includes('angle')) {
      stats.Mathematics++;
    } else {
      stats.Science_Physics++;
    }
  });
  return stats;
}

console.log('\n--- TOPIC DISTRIBUTION IN EASY TIER (500 Questions) ---');
console.log(getTopicStats(easyQuestions));

console.log('\n--- TOPIC DISTRIBUTION IN MEDIUM TIER (400 Questions) ---');
console.log(getTopicStats(mediumQuestions));

console.log('\n--- TOPIC DISTRIBUTION IN CHALLENGING TIER (100 Questions) ---');
console.log(getTopicStats(challengingQuestions));

console.log('\n--- SAMPLES FROM EACH TIER ---');
console.log('Sample Easy (Q1):', easyQuestions[0].text, '-->', easyQuestions[0].answer);
console.log('Sample Easy (Q250):', easyQuestions[249].text, '-->', easyQuestions[249].answer);
console.log('Sample Medium (Q501):', mediumQuestions[0].text, '-->', mediumQuestions[0].answer);
console.log('Sample Medium (Q700):', mediumQuestions[199].text, '-->', mediumQuestions[199].answer);
console.log('Sample Challenging (Q901):', challengingQuestions[0].text, '-->', challengingQuestions[0].answer);
console.log('Sample Challenging (Q950):', challengingQuestions[49].text, '-->', challengingQuestions[49].answer);
console.log('===============================================================\n');
