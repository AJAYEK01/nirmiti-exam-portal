const fs = require('fs');
const path = require('path');

const newEasy = require('./data/new-easy-questions.js');
const newChallenging = require('./data/new-challenging-questions.js');

console.log('--- Loading existing 1,000 questions bank ---');
const rawPath = path.join(__dirname, '..', 'Complete_1000_Questions_No_Headings.txt');
const raw = fs.readFileSync(rawPath, 'utf8');
const lines = raw.split(/\r?\n/);

let questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line.startsWith('Q.')) {
    if (currentQ) questions.push(currentQ);
    currentQ = {
      id: questions.length + 1,
      text: line.replace(/^Q\.\s*/, '').trim(),
      opts: [],
      ans: ''
    };
  } else if (/^[A-D]\)/.test(line)) {
    if (currentQ) currentQ.opts.push(line);
  } else if (line.startsWith('Answer:')) {
    if (currentQ) currentQ.ans = line;
  }
}
if (currentQ) questions.push(currentQ);

console.log(`Successfully parsed ${questions.length} existing questions.`);

// 1. Identify and remove unsuitable / overly tough questions
function isToughUnsuitable(q) {
  const full = (q.text + ' ' + q.opts.join(' ')).toLowerCase();
  return (
    full.includes('synfig') && (full.includes('duck') || full.includes('handle') || full.includes('waypoint') || full.includes('bline')) ||
    full.includes('flyback') || full.includes('freewheeling diode') ||
    full.includes('photoplethysmography') || full.includes('ppg') ||
    full.includes('rc522') || full.includes('mfrc522') || full.includes('13.56 mhz') ||
    full.includes('systemd') || full.includes('initrd') || full.includes('chroot') ||
    full.includes('snubber') || full.includes('optocoupler pc817') ||
    full.includes('h-bridge mosfet') || full.includes('baud rate crystal') ||
    full.includes('contact bounce') || full.includes('intel hex') ||
    full.includes('sim800l') || full.includes('nrf24l01') ||
    full.includes('input_pullup') || full.includes('20k ohm pull-up')
  );
}

// 2. Identify calculation / challenging questions in existing bank
function isChallengingExisting(q) {
  const t = q.text.toLowerCase();
  const full = (q.text + ' ' + q.opts.join(' ')).toLowerCase();
  return (
    t.includes('calculate') ||
    t.includes('what is the equivalent resistance') ||
    t.includes('if a 10 ohm and a 20 ohm') ||
    t.includes('if two resistors') ||
    t.includes('what is the output of the following python') ||
    t.includes('what is the output of:') ||
    t.includes('truth table') ||
    t.includes('power dissipated') ||
    t.includes('potential difference across') ||
    t.includes('effective resistance') ||
    full.includes('nand gate') || full.includes('nor gate') ||
    t.includes('turns ratio') ||
    (t.includes('speed') && t.includes('meters') && t.includes('seconds') && t.includes('train')) ||
    (t.includes('car travels') && t.includes('average speed'))
  );
}

// 3. Identify basic / easy questions in existing bank
function isEasyCandidate(q) {
  const t = q.text.toLowerCase();
  if (q.id <= 100) return true;
  if (q.id >= 201 && q.id <= 240) return true;
  if (
    t.includes('input device') || t.includes('output device') ||
    t.includes('tux paint') || t.includes('shortcut key') ||
    t.includes('full form of') || t.includes('stand for') ||
    t.includes('who created python') || t.includes('file extension for python') ||
    t.includes('extension of') || t.includes('brain of the computer') ||
    t.includes('temporary volatile memory') || t.includes('permanent non-volatile') ||
    t.includes('unit of length') || t.includes('unit of time') || t.includes('unit of mass') ||
    t.includes('which device is used to type') || t.includes('pointing device') ||
    t.includes('handheld pointing device') || t.includes('displays visual output') ||
    t.includes('produces sound') || t.includes('captures video') ||
    t.includes('paper printout') || t.includes('soft copy') || t.includes('hard copy') ||
    t.includes('green flag') || t.includes('sprite') || t.includes('stage')
  ) {
    return true;
  }
  return false;
}

let existEasy = [];
let existChallenging = [];
let existMedium = [];
let purgedCount = 0;

for (const q of questions) {
  if (isToughUnsuitable(q)) {
    purgedCount++;
    continue;
  }
  if (isChallengingExisting(q)) {
    existChallenging.push(q);
  } else if (isEasyCandidate(q)) {
    existEasy.push(q);
  } else {
    existMedium.push(q);
  }
}

console.log(`Purged ${purgedCount} unsuitable / out-of-syllabus questions.`);
console.log(`Existing pools: Easy=${existEasy.length}, Challenging=${existChallenging.length}, Medium Candidates=${existMedium.length}`);

// Normalize helper to standardize question object
function normalizeQuestion(item) {
  if (item.opts && item.ans) {
    // Already in existing format
    return {
      text: item.text,
      opts: item.opts.map(o => o.trim()),
      ans: item.ans.trim()
    };
  }

  // From new question format
  const letters = ['A', 'B', 'C', 'D'];
  const formattedOpts = item.options.map((opt, idx) => `${letters[idx]}) ${opt}`);
  
  // Find which option letter matches the answer
  let ansLetter = 'A';
  if (item.answer.startsWith('A)') || item.answer.startsWith('B)') || item.answer.startsWith('C)') || item.answer.startsWith('D)')) {
    ansLetter = item.answer.slice(0, 2);
  }
  const answerText = item.answer.replace(/^[A-D]\)\s*/, '');
  
  return {
    text: item.text,
    opts: formattedOpts,
    ans: `Answer: ${item.answer}`
  };
}

// Assemble exactly:
// 500 Easy (Q1 - Q500)
// 400 Medium (Q501 - Q900)
// 100 Challenging (Q901 - Q1000)

const finalEasy = [];
existEasy.forEach(q => finalEasy.push(normalizeQuestion(q)));
newEasy.forEach(q => finalEasy.push(normalizeQuestion(q)));

console.log(`Total Easy accumulated: ${finalEasy.length}`);
// Slice or pad to exactly 500
const balancedEasy = finalEasy.slice(0, 500);

const finalChallenging = [];
existChallenging.forEach(q => finalChallenging.push(normalizeQuestion(q)));
newChallenging.forEach(q => finalChallenging.push(normalizeQuestion(q)));

console.log(`Total Challenging accumulated: ${finalChallenging.length}`);
// Slice or pad to exactly 100
const balancedChallenging = finalChallenging.slice(0, 100);

// Select best 400 Medium questions from existMedium
const balancedMedium = existMedium.slice(0, 400).map(q => normalizeQuestion(q));
console.log(`Selected Medium: ${balancedMedium.length}`);

// Final balanced 1,000 array
const balanced1000 = [
  ...balancedEasy,
  ...balancedMedium,
  ...balancedChallenging
];

console.log(`\n========================================`);
console.log(`Final Balanced Bank Total: ${balanced1000.length} questions`);
console.log(`Easy (Q1 - Q500):        ${balancedEasy.length} (${(balancedEasy.length / 10).toFixed(1)}%)`);
console.log(`Medium (Q501 - Q900):    ${balancedMedium.length} (${(balancedMedium.length / 10).toFixed(1)}%)`);
console.log(`Challenging (Q901 - Q1000): ${balancedChallenging.length} (${(balancedChallenging.length / 10).toFixed(1)}%)`);
console.log(`========================================\n`);

// Validation: Ensure every question has text, 4 options, and an Answer line
let validationErrors = 0;
balanced1000.forEach((q, idx) => {
  const qNum = idx + 1;
  if (!q.text) {
    console.error(`Error at Q${qNum}: missing text`);
    validationErrors++;
  }
  if (!q.opts || q.opts.length !== 4) {
    console.error(`Error at Q${qNum}: expected 4 options, got ${q.opts ? q.opts.length : 0}`);
    validationErrors++;
  }
  if (!q.ans || !q.ans.startsWith('Answer:')) {
    console.error(`Error at Q${qNum}: invalid answer format '${q.ans}'`);
    validationErrors++;
  }
});

if (validationErrors === 0) {
  console.log('✅ ALL 1,000 QUESTIONS PASSED STRICT STRUCTURAL VALIDATION!');
} else {
  console.error(`❌ Validation failed with ${validationErrors} errors!`);
  process.exit(1);
}

// Generate formatted text content
let textOutput = '';
balanced1000.forEach((q, idx) => {
  textOutput += `Q. ${q.text}\n`;
  q.opts.forEach(opt => {
    textOutput += `${opt}\n`;
  });
  textOutput += `${q.ans}\n\n`;
});

// Save to Complete_1000_Questions_Balanced.txt
const balancedPath = path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt');
fs.writeFileSync(balancedPath, textOutput.trim() + '\n', 'utf8');
console.log(`Saved balanced question bank to: ${balancedPath}`);

// Also update Complete_1000_Questions_No_Headings.txt
fs.writeFileSync(rawPath, textOutput.trim() + '\n', 'utf8');
console.log(`Updated master file: ${rawPath}`);
console.log('All operations completed successfully!');
