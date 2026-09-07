const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const oldMl = require('../src/lib/questions-ml.json');

// Dictionary of core terms for natural Malayalam rendering
const termMap = {
  // Science & Biology
  "chlorophyll": "ക്ലോറോഫിൽ (Chlorophyll)",
  "photosynthesis": "പ്രകാശസംശ്ലേഷണം (Photosynthesis)",
  "stomata": "ആസ്യരന്ധ്രങ്ങൾ (Stomata)",
  "root": "വേര് (Root)",
  "stem": "തണ്ട് (Stem)",
  "leaf": "ഇല (Leaf)",
  "flower": "പൂവ് (Flower)",
  "xylem": "സൈലം (Xylem)",
  "phloem": "ഫ്ലോയം (Phloem)",
  "oxygen": "ഓക്സിജൻ (Oxygen)",
  "carbon dioxide": "കാർബൺ ഡൈ ഓക്സൈഡ് (Carbon dioxide)",
  "nitrogen": "നൈട്രജൻ (Nitrogen)",
  "hydrogen": "ഹൈഡ്രജൻ (Hydrogen)",
  "transpiration": "സ്വേദനം (Transpiration)",
  "pollination": "പരാഗണം (Pollination)",
  "germination": "മുളയ്ക്കൽ (Germination)",
  "herbivores": "സസ്യഭുക്കുകൾ (Herbivores)",
  "carnivores": "മാംസഭുക്കുകൾ (Carnivores)",
  "omnivores": "മിശ്രഭുക്കുകൾ (Omnivores)",
  "autotrophs": "സ്വപോഷികൾ (Autotrophs)",
  "decomposers": "വിഘാടകർ (Decomposers)",
  "kidneys": "വൃക്കകൾ (Kidneys)",
  "lungs": "ശ്വാസകോശം (Lungs)",
  "heart": "ഹൃദയം (Heart)",
  "brain": "മസ്തിഷ്കം (Brain)",
  "stomach": "ആമാശയം (Stomach)",
  "liver": "കരൾ (Liver)",
  "skull": "തലയോട്ടി (Skull)",
  "ribcage": "വാരിയെല്ല് കൂട് (Ribcage)",
  "tendon": "ടെൻഡൺ (Tendon)",
  "ligament": "ലിഗമെന്റ് (Ligament)",
  "hemoglobin": "ഹീമോഗ്ലോബിൻ (Hemoglobin)",
  "arteries": "ധമനികൾ (Arteries)",
  "veins": "സിരകൾ (Veins)",
  "enamel": "ഇനാമൽ (Enamel)",
  "sublimation": "ഉത്പതനം (Sublimation)",
  "evaporation": "ബാഷ്പീകരണം (Evaporation)",
  "condensation": "സാന്ദ്രീകരണം (Condensation)",
  "mercury": "മെർക്കുറി (Mercury)",
  "barometer": "ബാരോമീറ്റർ (Barometer)",
  "rain gauge": "റെയിൻ ഗേജ് (Rain gauge)",
  "anemometer": "അനിമോമീറ്റർ (Anemometer)",
  "lever": "ഉത്തോലകം (Lever)",
  "pulley": "കപ്പി (Pulley)",
  "fulcrum": "ധാരം (Fulcrum)",
  "inclined plane": "ചരിവുതലം (Inclined plane)",
  "wedge": "ആപ്പ് (Wedge)",
  "screw": "സ്ക്രൂ (Screw)",
  "reflection": "പ്രതിപതനം (Reflection)",
  "refraction": "അപവർത്തനം (Refraction)",
  "dispersion": "പ്രകീർണ്ണനം (Dispersion)",
  "lodestone": "ലോഡ്സ്റ്റോൺ (കാന്തക്കല്ല്)",
  "compass": "കോമ്പസ് (ദിശാസൂചി)",
  "periscope": "പെരിസ്കോപ്പ് (Periscope)",
  "stethoscope": "സ്റ്റെതസ്കോപ്പ് (Stethoscope)",
  "microscope": "മൈക്രോസ്കോപ്പ് (Microscope)",
  "telescope": "ടെലിസ്കോപ്പ് (Telescope)",

  // Physics & Measurements
  "meter": "മീറ്റർ (m)",
  "kilogram": "കിലോഗ്രാം (kg)",
  "second": "സെക്കൻഡ് (s)",
  "kelvin": "കെൽവിൻ (K)",
  "stopwatch": "സ്റ്റോപ്പ്‌വാച്ച്",
  "area": "വിസ്തീർണ്ണം (Area)",
  "volume": "വ്യാപ്തം (Volume)",
  "density": "സാന്ദ്രത (Density)",
  "resistor": "റെസിസ്റ്റർ (Resistor)",
  "resistance": "പ്രതിരോധം (Resistance)",
  "ohm": "ഓം (Ohm)",
  "volt": "വോൾട്ട് (Volt)",
  "ampere": "ആമ്പിയർ (Ampere)",
  "watt": "വാട്ട് (Watt)",
  "joule": "ജൂൾ (Joule)",
  "ammeter": "അമ്മീറ്റർ (Ammeter)",
  "voltmeter": "വോൾട്ട്മീറ്റർ (Voltmeter)",
  "transformer": "ട്രാൻസ്ഫോർമർ (Transformer)",
  "focal length": "ഫോക്കസ് ദൂരം (Focal length)",
  "dioptre": "ഡയോപ്റ്റർ (Dioptre)",
  "convex lens": "കോൺവെക്സ് ലെൻസ് (Convex lens)",
  "concave lens": "കോൺകേവ് ലെൻസ് (Concave lens)",
  "convex mirror": "കോൺവെക്സ് ദർപ്പണം",
  "plane mirror": "സമതല ദർപ്പണം",
  "acceleration": "ത്വരണം (Acceleration)",
  "velocity": "പ്രവേഗം (Velocity)",
  "kinetic energy": "ഗതികോർജ്ജം (Kinetic energy)",
  "potential energy": "സ്ഥിതികോർജ്ജം (Potential energy)",
  "work done": "ചെയ്ത പ്രവൃത്തി (Work done)",
  "wavelength": "തരംഗദൈർഘ്യം (Wavelength)",
  "frequency": "ആവൃത്തി (Frequency)",

  // ICT & Computing
  "monitor": "മോണിറ്റർ (Monitor)",
  "keyboard": "കീബോർഡ് (Keyboard)",
  "mouse": "മൗസ് (Mouse)",
  "printer": "പ്രിന്റർ (Printer)",
  "scanner": "സ്കാനർ (Scanner)",
  "microphone": "മൈക്രോഫോൺ (Microphone)",
  "speaker": "സ്പീക്കർ (Speaker)",
  "webcam": "വെബ്ക്യാം (Webcam)",
  "projector": "പ്രൊജക്ടർ (Projector)",
  "ups": "യു.പി.എസ് (UPS)",
  "pen drive": "പെൻ ഡ്രൈവ് (USB Flash Drive)",
  "spacebar": "സ്പേസ്ബാർ (Spacebar)",
  "enter key": "എന്റർ കീ (Enter key)",
  "backspace": "ബാക്ക്‌സ്പേസ് (Backspace)",
  "delete key": "ഡിലീറ്റ് കീ (Delete key)",
  "caps lock": "ക്യാപ്സ് ലോക്ക് (Caps Lock)",
  "desktop": "ഡെസ്ക്ടോപ്പ് (Desktop)",
  "icons": "ഐക്കണുകൾ (Icons)",
  "wallpaper": "വാൾപേപ്പർ (Wallpaper)",
  "taskbar": "ടാസ്ക്ബാർ (Taskbar)",
  "trash": "ട്രാഷ് / വേസ്റ്റ്ബാസ്കറ്റ് (Trash)",
  "folder": "ഫോൾഡർ (Folder)",
  "tux paint": "ടക്സ് പെയിന്റ് (Tux Paint)",
  "sprite": "സ്പ്രൈറ്റ് (Sprite)",
  "stage": "സ്റ്റേജ് (Stage)",
  "costume": "വേഷം / കോസ്റ്റ്യൂം (Costume)",
  "backdrop": "ബാക്ക്ഡ്രോപ്പ് (Backdrop)",
  "browser": "വെബ് ബ്രൗസർ (Web browser)",
  "search engine": "സെർച്ച് എഞ്ചിൻ (Search Engine)",
  "email": "ഇമെയിൽ (Email)",
  "attachment": "അറ്റാച്ച്മെന്റ് (Attachment)",
  "wi-fi": "വൈ-ഫൈ (Wi-Fi)",
  "bluetooth": "ബ്ലൂടൂത്ത് (Bluetooth)",
  "antivirus": "ആന്റിവൈറസ് (Antivirus)"
};

// Translate option string
function translateOption(opt) {
  let cleaned = opt.replace(/^[A-D]\)\s*/, '').trim();
  const lower = cleaned.toLowerCase();

  // Common measurements and numbers
  if (/^(\d+(\.\d+)?)\s*(ohms?|ohm)/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} ഓം (${val} ohms)`;
  }
  if (/^(\d+(\.\d+)?)\s*a$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} ആമ്പിയർ (${val} A)`;
  }
  if (/^(\d+(\.\d+)?)\s*v$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} വോൾട്ട് (${val} V)`;
  }
  if (/^(\d+(\.\d+)?)\s*w$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} വാട്ട് (${val} W)`;
  }
  if (/^(\d+(\.\d+)?)\s*j$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} ജൂൾ (${val} J)`;
  }
  if (/^(\d+(\.\d+)?)\s*kwh$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} കിലോവാട്ട്-അവർ (${val} kWh)`;
  }
  if (/^(\d+(\.\d+)?)\s*units$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} യൂണിറ്റുകൾ (${val} units)`;
  }
  if (/^(\d+(\.\d+)?)\s*m\/s\^2$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} m/s²`;
  }
  if (/^(\d+(\.\d+)?)\s*m\/s$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} m/s`;
  }
  if (/^(\d+(\.\d+)?)\s*m$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} മീറ്റർ (${val} m)`;
  }
  if (/^(\d+(\.\d+)?)\s*cm$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} സെ.മീ (${val} cm)`;
  }
  if (/^(\d+(\.\d+)?)\s*degrees$/i.test(cleaned)) {
    const val = cleaned.match(/^(\d+(\.\d+)?)/)[1];
    return `${val} ഡിഗ്രി (${val}°)`;
  }
  if (/^(\d+(\.\d+)?)\s*%/i.test(cleaned)) {
    return cleaned;
  }
  if (/^\+?\-?(\d+(\.\d+)?)\s*d$/i.test(cleaned)) {
    return cleaned;
  }
  if (/^rs\.\s*(\d+)/i.test(cleaned)) {
    const val = cleaned.match(/\d+/)[0];
    return `രൂപ ${val} (Rs. ${val})`;
  }

  // Direct lookup
  for (const [k, v] of Object.entries(termMap)) {
    if (lower === k) return v;
  }

  // Common quick words
  if (lower === 'chlorophyll') return 'ക്ലോറോഫിൽ (Chlorophyll)';
  if (lower === 'oxygen') return 'ഓക്സിജൻ (Oxygen)';
  if (lower === 'carbon dioxide') return 'കാർബൺ ഡൈ ഓക്സൈഡ്';
  if (lower === 'nitrogen') return 'നൈട്രജൻ (Nitrogen)';
  if (lower === 'hydrogen') return 'ഹൈഡ്രജൻ (Hydrogen)';
  if (lower === 'vitamin a') return 'വിറ്റാമിൻ എ (Vitamin A)';
  if (lower === 'vitamin b') return 'വിറ്റാമിൻ ബി (Vitamin B)';
  if (lower === 'vitamin c') return 'വിറ്റാമിൻ സി (Vitamin C)';
  if (lower === 'vitamin d') return 'വിറ്റാമിൻ ഡി (Vitamin D)';
  if (lower === 'calcium') return 'കാൽസ്യം (Calcium)';
  if (lower === 'iron') return 'ഇരുമ്പ് (Iron)';
  if (lower === 'iodine') return 'അയോഡിൻ (Iodine)';
  if (lower === 'solid') return 'ഖരം (Solid)';
  if (lower === 'liquid') return 'ദ്രാവകം (Liquid)';
  if (lower === 'gas') return 'വാതകം (Gas)';
  if (lower === '0') return '0';
  if (lower === '1') return '1';
  if (lower === 'and gate') return 'AND ഗേറ്റ് (AND gate)';
  if (lower === 'or gate') return 'OR ഗേറ്റ് (OR gate)';
  if (lower === 'not gate') return 'NOT ഗേറ്റ് (NOT gate)';
  if (lower === 'nand gate') return 'NAND ഗേറ്റ് (NAND gate)';
  if (lower === 'nor gate') return 'NOR ഗേറ്റ് (NOR gate)';
  if (lower === 'xor gate') return 'XOR ഗേറ്റ് (XOR gate)';
  if (lower === 'ctrl + s') return 'Ctrl + S';
  if (lower === 'ctrl + c') return 'Ctrl + C';
  if (lower === 'ctrl + v') return 'Ctrl + V';
  if (lower === 'ctrl + x') return 'Ctrl + X';
  if (lower === 'ctrl + z') return 'Ctrl + Z';
  if (lower === 'ctrl + b') return 'Ctrl + B (Bold)';
  if (lower === 'ctrl + i') return 'Ctrl + I (Italic)';
  if (lower === 'ctrl + u') return 'Ctrl + U (Underline)';
  if (lower === 'ctrl + p') return 'Ctrl + P (Print)';
  if (lower === 'ctrl + a') return 'Ctrl + A (Select All)';
  if (lower === 'ctrl + o') return 'Ctrl + O (Open)';
  if (lower === 'ctrl + n') return 'Ctrl + N (New)';
  if (lower === 'f5') return 'F5 (Slide Show)';
  if (lower === 'f1') return 'F1 (Help)';

  return cleaned;
}

// Generate contextual natural Malayalam question text
function translateQuestionText(en) {
  const lower = en.toLowerCase();

  // Circuit & Ohm's Law
  if (lower.includes('two resistors of 6 ohms and 3 ohms are connected in parallel')) {
    return '6 ഓം, 3 ഓം എന്നീ രണ്ട് പ്രതിരോധകങ്ങൾ സമാന്തരമായി (Parallel) ബന്ധിപ്പിച്ചിരിക്കുന്നു. അവയുടെ സഫല പ്രതിരോധം (Equivalent Resistance) എത്രയാണ്?';
  }
  if (lower.includes('three resistors of 5 ohms, 10 ohms, and 15 ohms are connected in series')) {
    return '5 ഓം, 10 ഓം, 15 ഓം എന്നീ മൂന്ന് പ്രതിരോധകങ്ങൾ ശ്രേണിരീതിയിൽ (Series) ബന്ധിപ്പിച്ചിരിക്കുന്നു. സർക്യൂട്ടിന്റെ ആകെ പ്രതിരോധം എത്രയാണ്?';
  }
  if (lower.includes('three identical resistors of 30 ohms each are connected in parallel')) {
    return '30 ഓം വീതമുള്ള മൂന്ന് സമാന പ്രതിരോധകങ്ങൾ സമാന്തരമായി ബന്ധിപ്പിച്ചാൽ സഫല പ്രതിരോധം എത്രയായിരിക്കും?';
  }
  if (lower.includes('potential difference of 24 v is applied across an 8-ohm resistor')) {
    return '8 ഓം പ്രതിരോധമുള്ള ഒരു റെസിസ്റ്ററിന് കുറുകെ 24 വോൾട്ട് നൽകിയാൽ അതിലൂടെ ഒഴുകുന്ന വൈദ്യുത പ്രവാഹം (Current) എത്രയാണ്?';
  }
  if (lower.includes('electric heater draws a current of 5 a from a 230 v power supply')) {
    return '230 V സപ്ലൈയിൽ പ്രവർത്തിക്കുന്ന ഒരു ഇലക്ട്രിക് ഹീറ്റർ 5 A കറന്റ് എടുക്കുന്നുവെങ്കിൽ ഹീറ്റിംഗ് എലമെന്റിന്റെ പ്രതിരോധം (Resistance) എത്രയാണ്?';
  }
  if (lower.includes('what voltage is required to produce a current of 0.5 a through a lamp of resistance 200 ohms')) {
    return '200 ഓം പ്രതിരോധമുള്ള ഒരു ലാമ്പിലൂടെ 0.5 A കറന്റ് പ്രവഹിപ്പിക്കാൻ ആവശ്യമായ വോൾട്ടേജ് എത്രയാണ് (V = I * R)?';
  }
  if (lower.includes('ratio of their series resistance to parallel resistance')) {
    return '10 ഓം വീതമുള്ള രണ്ട് പ്രതിരോധകങ്ങൾ ആദ്യം ശ്രേണിയിലും പിന്നീട് സമാന്തരമായും ബന്ധിപ്പിച്ചാൽ അവയുടെ പ്രതിരോധങ്ങളുടെ അനുപാതം (Rs : Rp) എത്രയാണ്?';
  }
  if (lower.includes('potential difference across the 4-ohm resistor')) {
    return '4 ഓം, 2 ഓം പ്രതിരോധങ്ങൾ ശ്രേണിയിൽ 12 V ബാറ്ററിയുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു. 4 ഓം പ്രതിരോധകത്തിന് കുറുകെയുള്ള പൊട്ടൻഷ്യൽ വ്യത്യാസം എത്രയാണ്?';
  }
  if (lower.includes('current flowing through each individual branch')) {
    return '12 V സപ്ലൈയിൽ 12 ഓം വീതമുള്ള രണ്ട് ശാഖകളുള്ള ഒരു സമാന്തര സർക്യൂട്ടിൽ, ഓരോ ശാഖയിലൂടെയും ഒഴുകുന്ന കറന്റ് എത്രയാണ്?';
  }
  if (lower.includes('four 100-ohm resistors are connected in parallel across a 50 v source')) {
    return '100 ഓം വീതമുള്ള നാല് പ്രതിരോധകങ്ങൾ 50 V സ്രോതസ്സിന് കുറുകെ സമാന്തരമായി ബന്ധിപ്പിച്ചാൽ ആകെ കറന്റ് എത്രയാണ്?';
  }

  // Power & Joule's Heating
  if (lower.includes('electric bulb is rated 100 w, 220 v')) {
    return '100 W, 220 V എന്ന് രേഖപ്പെടുത്തിയ ഒരു ഇലക്ട്രിക് ബൾബ് 220 V-ൽ പ്രവർത്തിക്കുമ്പോൾ എടുക്കുന്ന കറന്റ് എത്രയാണ് (I = P / V)?';
  }
  if (lower.includes("joule's law of heating") && lower.includes('doubled')) {
    return 'ജൂൾ നിയമപ്രകാരം (H = I²Rt), ഒരു നിശ്ചിത പ്രതിരോധകത്തിലൂടെയുള്ള കറന്റ് ഇരട്ടിയാക്കിയാൽ ഉൽപ്പാദിപ്പിക്കപ്പെടുന്ന താപം എത്ര മടങ്ങായി വർദ്ധിക്കും?';
  }
  if (lower.includes('electric iron rated 750 w is used for 2 hours daily')) {
    return '750 W ഉള്ള ഒരു ഇസ്തിരിപ്പെട്ടി ദിവസവും 2 മണിക്കൂർ ഉപയോഗിച്ചാൽ ഒരു ദിവസം ഉപയോഗിക്കുന്ന വൈദ്യുതി എത്ര കിലോവാട്ട്-അവർ (kWh) ആണ്?';
  }
  if (lower.includes('1000 w electric geyser runs for 3 hours')) {
    return '1000 W ഉള്ള ഒരു ഇലക്ട്രിക് ഗീസർ 3 മണിക്കൂർ പ്രവർത്തിച്ചാൽ എത്ര യൂണിറ്റ് (kWh) വൈദ്യുതി ചെലവാകും?';
  }
  if (lower.includes('current of 2 a flows through a resistor of 10 ohms for 5 seconds')) {
    return '10 ഓം റെസിസ്റ്ററിലൂടെ 2 A കറന്റ് 5 സെക്കൻഡ് പ്രവഹിച്ചാൽ ഉൽപ്പാദിപ്പിക്കപ്പെടുന്ന താപോർജ്ജം എത്ര ജൂൾ ആണ് (H = I²Rt)?';
  }
  if (lower.includes('electric appliance rated 2 kw operates on a 200 v circuit')) {
    return '200 V സർക്യൂട്ടിൽ പ്രവർത്തിക്കുന്ന 2 kW റേറ്റിംഗുള്ള ഒരു ഉപകരണം എടുക്കുന്ന കറന്റ് എത്രയാണ്?';
  }
  if (lower.includes('fuse wire rated 5 a is connected in a domestic 230 v line')) {
    return '230 V ലൈനിൽ ഘടിപ്പിച്ച 5 A ഫ്യൂസ് വയർ വഴി സുരക്ഷിതമായി പ്രവർത്തിപ്പിക്കാൻ കഴിയുന്ന പരമാവധി വാട്ടേജ് (Power) എത്രയാണ്?';
  }

  // Transformers
  if (lower.includes('step-down transformer has 1000 turns in the primary coil and 100 turns in the secondary')) {
    return 'ഒരു സ്റ്റെപ്പ്-ഡൗൺ ട്രാൻസ്ഫോർമറിന്റെ പ്രൈമറിയിൽ 1000 ചുറ്റുകളും സെക്കൻഡറിയിൽ 100 ചുറ്റുകളുമുണ്ട്. പ്രൈമറി വോൾട്ടേജ് 220 V ആണെങ്കിൽ സെക്കൻഡറി വോൾട്ടേജ് എത്രയാണ്?';
  }
  if (lower.includes('primary coil has 200 turns and the secondary coil has 800 turns')) {
    return 'ഒരു ട്രാൻസ്ഫോർമറിൽ പ്രൈമറിയിൽ 200 ചുറ്റുകളും സെക്കൻഡറിയിൽ 800 ചുറ്റുകളുമുണ്ട്. ഇൻപുട്ട് 12 V ആണെങ്കിൽ ഔട്ട്പുട്ട് വോൾട്ടേജ് എത്രയാണ് (Vs = Vp * Ns / Np)?';
  }
  if (lower.includes('secondary voltage is 5 times the primary voltage')) {
    return 'ഒരു ആദർശ സ്റ്റെപ്പ്-അപ്പ് ട്രാൻസ്ഫോർമറിൽ സെക്കൻഡറി വോൾട്ടേജ് പ്രൈമറിയുടെ 5 മടങ്ങാണെങ്കിൽ, സെക്കൻഡറി കറന്റ് എത്രയായിരിക്കും?';
  }
  if (lower.includes('step-up transformer converts 10 v to 200 v')) {
    return '10 V-നെ 200 V ആയി മാറ്റുന്ന ഒരു സ്റ്റെപ്പ്-അപ്പ് ട്രാൻസ്ഫോർമറിന്റെ ചുറ്റുകളുടെ അനുപാതം (Ns / Np) എത്രയാണ്?';
  }

  // Optics & Lenses
  if (lower.includes('convex lens has a focal length of +0.5 meters')) {
    return '+0.5 മീറ്റർ ഫോക്കസ് ദൂരമുള്ള ഒരു കോൺവെക്സ് ലെൻസിന്റെ പവർ ഡയോപ്റ്ററിൽ (P = 1 / f) എത്രയാണ്?';
  }
  if (lower.includes('corrective lens of power -2.5 d')) {
    return '-2.5 D പവർ ഉള്ള ഒരു തിരുത്തൽ ലെൻസിന്റെ ഫോക്കസ് ദൂരവും ലെൻസിന്റെ തരവും എന്താണ്?';
  }
  if (lower.includes('convex lens has a focal length of +25 cm')) {
    return '+25 സെ.മീ ഫോക്കസ് ദൂരമുള്ള ഒരു കോൺവെക്സ് ലെൻസിന്റെ പവർ എത്ര ഡയോപ്റ്റർ ആണ്?';
  }
  if (lower.includes('object is placed at 2f')) {
    return 'ഒരു കോൺവെക്സ് ലെൻസിന്റെ 2F-ൽ ഒരു വസ്തു വെച്ചാൽ ലഭിക്കുന്ന പ്രതിബിംബത്തിന്റെ സ്വഭാവവും വലിപ്പവും എന്താണ്?';
  }
  if (lower.includes('ray of light traveling from air enters water at an angle')) {
    return 'വായുവിൽ നിന്ന് ചരിഞ്ഞ് വെള്ളത്തിലേക്ക് പ്രവേശിക്കുന്ന പ്രകാശകിരണത്തിന്റെ വേഗതയ്ക്കും ദിശയ്ക്കും എന്ത് മാറ്റമാണ് സംഭവിക്കുന്നത്?';
  }

  // Motion & Sound
  if (lower.includes('accelerates uniformly from rest to a speed of 20 m/s in 5 seconds')) {
    return 'നിശ്ചലാവസ്ഥയിൽ നിന്ന് പുറപ്പെട്ട ഒരു വാഹനം 5 സെക്കൻഡിൽ 20 m/s വേഗത കൈവരിച്ചാൽ അതിന്റെ ത്വരണം (Acceleration) എത്രയാണ്?';
  }
  if (lower.includes('stone dropped freely from the top of a building reaches the ground in 3 seconds')) {
    return 'കെട്ടിടത്തിന് മുകളിൽ നിന്ന് താഴേക്ക് വീഴുന്ന കല്ല് 3 സെക്കൻഡിൽ നിലത്തു പതിക്കുന്നു (g = 9.8 m/s²). നിലത്തു പതിക്കുമ്പോഴുള്ള പ്രവേഗം എത്രയാണ് (v = gt)?';
  }
  if (lower.includes('kinetic energy of a body of mass 2 kg moving with a uniform velocity of 4 m/s')) {
    return '4 m/s വേഗതയിൽ സഞ്ചരിക്കുന്ന 2 kg പിണ്ഡമുള്ള ഒരു വസ്തുവിന്റെ ഗതികോർജ്ജം (Kinetic Energy) എത്രയാണ് (KE = ½mv²)?';
  }
  if (lower.includes('speed of a moving car is tripled')) {
    return 'ഒരു വാഹനത്തിന്റെ വേഗത 3 മടങ്ങായി വർദ്ധിച്ചാൽ അതിന്റെ ഗതികോർജ്ജം എത്ര മടങ്ങായി വർദ്ധിക്കും?';
  }
  if (lower.includes('constant force of 20 n moves a box across a smooth floor through a distance of 5 meters')) {
    return '20 N ബലം പ്രയോഗിച്ച് ഒരു പെട്ടിയെ 5 മീറ്റർ ദൂരം തള്ളിയാൽ ചെയ്ത പ്രവൃത്തി (Work done) എത്ര ജൂൾ ആണ് (W = F * s)?';
  }
  if (lower.includes('sound wave has a frequency of 500 hz and travels at a speed of 340 m/s')) {
    return '500 Hz ആവൃത്തിയും 340 m/s വേഗതയുമുള്ള ഒരു ശബ്ദ തരംഗത്തിന്റെ തരംഗദൈർഘ്യം (Wavelength) എത്രയാണ് (λ = v / f)?';
  }
  if (lower.includes('claps near a cliff and hears the echo after 2 seconds')) {
    return 'ഒരു കുന്നിൻ ചുവട്ടിൽ നിന്ന് കൈകൊട്ടി 2 സെക്കൻഡിന് ശേഷം പ്രതിധ്വനി (Echo) കേൾക്കുന്നു. ശബ്ദവേഗത 340 m/s ആണെങ്കിൽ കുന്നിലേക്കുള്ള ദൂരം എത്രയാണ്?';
  }
  if (lower.includes('body of mass 5 kg is raised to a vertical height of 4 meters')) {
    return '5 kg പിണ്ഡമുള്ള ഒരു വസ്തുവിനെ 4 മീറ്റർ ഉയരത്തിലേക്ക് ഉയർത്തുമ്പോൾ അതിൽ അടങ്ങിയിരിക്കുന്ന സ്ഥിതികോർജ്ജം (Potential Energy) എത്രയാണ് (PE = mgh)?';
  }
  if (lower.includes('vehicle covers 180 kilometers in 3 hours')) {
    return '180 കിലോമീറ്റർ ദൂരം 3 മണിക്കൂർ കൊണ്ട് സഞ്ചരിക്കുന്ന ഒരു വാഹനത്തിന്റെ വേഗത മീറ്റർ/സെക്കൻഡിൽ (m/s) എത്രയാണ്?';
  }
  if (lower.includes('acceleration of 2 m/s^2 to a cart of mass 15 kg')) {
    return '15 kg പിണ്ഡമുള്ള ഒരു വണ്ടിക്ക് 2 m/s² ത്വരണം നൽകാൻ ആവശ്യമായ ബലം (Force) എത്ര ന്യൂട്ടൺ ആണ് (F = ma)?';
  }

  // Python Tracing
  if (lower.includes('what is the output of the following python code') || lower.includes('what will be printed by this python snippet')) {
    return `ഇനിപ്പറയുന്ന പൈത്തൺ (Python) പ്രോഗ്രാമിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?\n\n${en.replace(/What.*Python.*\?[\s\n]*/i, '')}`;
  }

  // Logic Gates
  if (lower.includes('and gate when inputs are a = 1 and b = 0')) {
    return 'ഇൻപുട്ടുകൾ A = 1, B = 0 ആകുമ്പോൾ ഒരു AND ഗേറ്റിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?';
  }
  if (lower.includes('or gate when the inputs are a = 0 and b = 1')) {
    return 'ഇൻപുട്ടുകൾ A = 0, B = 1 ആകുമ്പോൾ ഒരു OR ഗേറ്റിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?';
  }
  if (lower.includes('gives an output of 1 only when both of its inputs are 1')) {
    return 'രണ്ട് ഇൻപുട്ടുകളും 1 ആകുമ്പോൾ മാത്രം ഔട്ട്പുട്ട് 1 നൽകുന്ന ലോജിക് ഗേറ്റ് ഏതാണ്?';
  }
  if (lower.includes('nand gate when both inputs are 1')) {
    return 'രണ്ട് ഇൻപുട്ടുകളും 1 (A = 1, B = 1) ആകുമ്പോൾ NAND ഗേറ്റിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?';
  }
  if (lower.includes('nor gate when both inputs are 0')) {
    return 'രണ്ട് ഇൻപുട്ടുകളും 0 (A = 0, B = 0) ആകുമ്പോൾ NOR ഗേറ്റിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?';
  }
  if (lower.includes('not gate has an input of binary 0')) {
    return 'ഒരു NOT ഗേറ്റിലേക്ക് ബൈനറി 0 ഇൻപുട്ട് നൽകിയാൽ അതിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?';
  }
  if (lower.includes('produces an output of 1 when its two inputs are different')) {
    return 'രണ്ട് ഇൻപുട്ടുകൾ വ്യത്യസ്തമാകുമ്പോൾ (0 ഉം 1 ഉം) ഔട്ട്പുട്ട് 1 നൽകുന്ന ലോജിക് ഗേറ്റ് ഏതാണ്?';
  }
  if (lower.includes('inverter (not gate) directly to the output of an and gate')) {
    return 'ഒരു AND ഗേറ്റിന്റെ ഔട്ട്പുട്ടിൽ ഒരു NOT ഗേറ്റ് ഘടിപ്പിച്ചാൽ ലഭിക്കുന്ന ഗേറ്റ് ഏതാണ്?';
  }

  // Binary Numbers
  if (lower.includes('decimal equivalent of the binary number 1010')) {
    return 'ബൈനറി സംഖ്യയായ 1010-ന്റെ ഡെസിമൽ (ദശാംശ) മൂല്യം എത്രയാണ്?';
  }
  if (lower.includes('decimal value of the binary number 1111')) {
    return 'ബൈനറി സംഖ്യയായ 1111-ന്റെ ഡെസിമൽ മൂല്യം എത്രയാണ്?';
  }
  if (lower.includes('binary representation of the decimal number 8')) {
    return '8 എന്ന ഡെസിമൽ സംഖ്യയുടെ ബൈനറി രൂപം ഏതാണ്?';
  }
  if (lower.includes('decimal equivalent of the binary number 1100')) {
    return 'ബൈനറി സംഖ്യയായ 1100-ന്റെ ഡെസിമൽ മൂല്യം എത്രയാണ്?';
  }
  if (lower.includes('how many bits are in exactly 2 bytes')) {
    return 'കൃത്യം 2 ബൈറ്റിൽ (Bytes) എത്ര ബിറ്റുകൾ (Bits) അടങ്ങിയിരിക്കുന്നു?';
  }
  if (lower.includes('how many kilobytes (kb) are equivalent to 1 megabyte (mb)')) {
    return '1 മെഗാബൈറ്റിന് (MB) തുല്യമായ കിലോബൈറ്റുകൾ (KB) എത്രയാണ്?';
  }
  if (lower.includes('binary addition of 1 + 1')) {
    return 'ഡിജിറ്റൽ ബൈനറി കൂട്ടിച്ചേർക്കലിൽ 1 + 1 ന്റെ ഫലം എന്താണ്?';
  }

  // Maths
  if (lower.includes('lengths of the two perpendicular sides are 6 cm and 8 cm')) {
    return 'ഒരു മട്ടത്രികോണത്തിന്റെ ലംബവശങ്ങൾ 6 സെ.മീ, 8 സെ.മീ ആണെങ്കിൽ പൈതഗോറസ് സിദ്ധാന്തപ്രകാരം കർണ്ണത്തിന്റെ (Hypotenuse) നീളം എത്രയാണ്?';
  }
  if (lower.includes('hypotenuse is 13 cm and one side is 5 cm')) {
    return 'ഒരു മട്ടത്രികോണത്തിൽ കർണ്ണം 13 സെ.മീ, ഒരു വശം 5 സെ.മീ ആണെങ്കിൽ മൂന്നാമത്തെ വശത്തിന്റെ നീളം എത്രയാണ്?';
  }
  if (lower.includes('area of a circle with a radius of 7 cm')) {
    return 'ആരം (Radius) 7 സെ.മീ ആയ ഒരു വൃത്തത്തിന്റെ വിസ്തീർണ്ണം എത്രയാണ് (π = 22/7)?';
  }
  if (lower.includes('circumference of a circular wheel of diameter 14 cm')) {
    return 'വ്യാസം (Diameter) 14 സെ.മീ ആയ ഒരു വൃത്താകൃതിയിലുള്ള ചക്രത്തിന്റെ ചുറ്റളവ് (Circumference) എത്രയാണ് (π = 22/7)?';
  }
  if (lower.includes('perimeter of the classroom')) {
    return '12 മീറ്റർ നീളവും 8 മീറ്റർ വീതിയുമുള്ള ഒരു ദീർഘചതുരാകൃതിയിലുള്ള ക്ലാസ് മുറിയുടെ ചുറ്റളവ് എത്രയാണ്?';
  }
  if (lower.includes('scores 40 marks out of 50 in an exam')) {
    return 'പരീക്ഷയിൽ 50-ൽ 40 മാർക്ക് നേടിയ ഒരു വിദ്യാർത്ഥിയുടെ വിജയശതമാനം (Percentage) എത്രയാണ്?';
  }
  if (lower.includes('bought for rs. 200 is sold for rs. 250')) {
    return '200 രൂപയ്ക്ക് വാങ്ങിയ ഒരു വസ്തു 250 രൂപയ്ക്ക് വിറ്റാൽ ലഭിച്ച ലാഭശതമാനം എത്രയാണ്?';
  }
  if (lower.includes('three angles of a triangle are in the ratio 1 : 2 : 3')) {
    return 'ഒരു ത്രികോണത്തിലെ കോണുകൾ 1 : 2 : 3 എന്ന അനുപാതത്തിലാണെങ്കിൽ ഏറ്റവും വലിയ കോണിന്റെ അളവ് എത്രയാണ്?';
  }
  if (lower.includes('two angles are supplementary. if one angle is 75 degrees')) {
    return 'രണ്ട് കോണുകൾ അനുപൂരകങ്ങളാണ് (Supplementary - ആകെ 180°). ഒരു കോൺ 75° ആണെങ്കിൽ മറ്റേ കോണിന്റെ അളവ് എത്രയാണ്?';
  }
  if (lower.includes('two angles are complementary. if one angle is 35 degrees')) {
    return 'രണ്ട് കോണുകൾ പൂരകങ്ങളാണ് (Complementary - ആകെ 90°). ഒരു കോൺ 35° ആണെങ്കിൽ മറ്റേ കോണിന്റെ അളവ് എത്രയാണ്?';
  }
  if (lower.includes('if 5x - 7 = 18')) {
    return '5x - 7 = 18 ആണെങ്കിൽ x-ന്റെ വില എത്രയാണ്?';
  }
  if (lower.includes('average (mean) of the numbers 12, 16, 20, 24, and 28')) {
    return '12, 16, 20, 24, 28 എന്നീ സംഖ്യകളുടെ ശരാശരി (Mean) എത്രയാണ്?';
  }
  if (lower.includes('train travels a distance of 300 km in 5 hours')) {
    return '300 കിലോമീറ്റർ ദൂരം 5 മണിക്കൂർ കൊണ്ട് സഞ്ചരിച്ച തീവണ്ടിയുടെ ശരാശരി വേഗത എത്രയാണ്?';
  }
  if (lower.includes('value of 3^4')) {
    return '3⁴ (3 ഘാതം 4) ന്റെ വില എത്രയാണ്?';
  }
  if (lower.includes('square root of 625')) {
    return '625 ന്റെ വർഗ്ഗമൂലം (Square Root) എത്രയാണ്?';
  }
  if (lower.includes('least common multiple (lcm) of 12 and 18')) {
    return '12, 18 എന്നീ സംഖ്യകളുടെ ല.സാ.ഗു (LCM) എത്രയാണ്?';
  }
  if (lower.includes('highest common factor (hcf) of 24 and 36')) {
    return '24, 36 എന്നീ സംഖ്യകളുടെ ഉ.സാ.ഘ (HCF) എത്രയാണ്?';
  }
  if (lower.includes('simple interest per year')) {
    return '1000 രൂപയ്ക്ക് 5% വാർഷിക സാധാരണ പലിശ നിരക്കിൽ 3 വർഷത്തേക്ക് ലഭിക്കുന്ന ആകെ പലിശ എത്രയാണ് (I = PNR / 100)?';
  }
  if (lower.includes('length of 20 meters and a width of 15 meters. what is the total area')) {
    return '20 മീറ്റർ നീളവും 15 മീറ്റർ വീതിയുമുള്ള ഒരു ദീർഘചതുര കളത്തിന്റെ ആകെ വിസ്തീർണ്ണം എത്രയാണ്?';
  }

  // Biology & Living World Easy
  if (lower.includes('green pigment in plant leaves absorbs sunlight')) {
    return 'പ്രകാശസംശ്ലേഷണത്തിനായി (Photosynthesis) സൂര്യപ്രകാശം ആഗിരണം ചെയ്യുന്ന സസ്യ ഇലകളിലെ ഹരിത വർണ്ണകം ഏതാണ്?';
  }
  if (lower.includes('tiny microscopic pores on leaf surfaces')) {
    return 'വാതക കൈമാറ്റം സാധ്യമാക്കുന്ന സസ്യ ഇലകളുടെ ഉപരിതലത്തിലെ സൂക്ഷ്മ സുഷിരങ്ങൾ ഏതാണ്?';
  }
  if (lower.includes('part of a plant firmly anchors it into the soil and absorbs water')) {
    return 'സസ്യങ്ങളെ മണ്ണിൽ ഉറപ്പിച്ചു നിർത്തുകയും വെള്ളവും ലവണങ്ങളും ആഗിരണം ചെയ്യുകയും ചെയ്യുന്ന ഭാഗം ഏതാണ്?';
  }
  if (lower.includes('fibrous root system is found in')) {
    return 'പുല്ല്, നെല്ല്, ചോളം തുടങ്ങിയ സസ്യങ്ങളിൽ കാണപ്പെടുന്ന വേരുപടലം ഏതാണ്?';
  }
  if (lower.includes('taproot system features a single thick central root')) {
    return 'ക്യാരറ്റ്, മാവ് തുടങ്ങിയ സസ്യങ്ങളിൽ കാണപ്പെടുന്ന പ്രധാന തായ്‌വേരടങ്ങിയ വേരുപടലം ഏതാണ്?';
  }
  if (lower.includes('primary food substance produced by green leaves')) {
    return 'പ്രകാശസംശ്ലേഷണത്തിലൂടെ സസ്യങ്ങൾ നിർമ്മിക്കുന്ന പ്രധാന ആഹാരം ഏതാണ്?';
  }
  if (lower.includes('gas is released into the atmosphere by plants as a byproduct of photosynthesis')) {
    return 'പ്രകാശസംശ്ലേഷണ പ്രക്രിയയുടെ ഉപോൽപ്പന്നമായി സസ്യങ്ങൾ അന്തരീക്ഷത്തിലേക്ക് പുറത്തുവിടുന്ന വാതകം ഏതാണ്?';
  }
  if (lower.includes('water is lost from plant leaves as water vapor')) {
    return 'സസ്യ ഇലകളിൽ നിന്ന് ജലം നീരാവിയായി പുറന്തള്ളപ്പെടുന്ന പ്രക്രിയ ഏതാണ്?';
  }
  if (lower.includes('conducts water and dissolved minerals from roots upward')) {
    return 'വേരുകൾ ആഗിരണം ചെയ്യുന്ന ജലവും ലവണങ്ങളും ഇലകളിലേക്ക് എത്തിക്കുന്ന സസ്യ കല ഏതാണ്?';
  }
  if (lower.includes('transports synthesized food from the leaves')) {
    return 'ഇലകൾ തയ്യാറാക്കിയ ആഹാരം സസ്യത്തിന്റെ ഇതര ഭാഗങ്ങളിലേക്ക് എത്തിക്കുന്ന സംവഹന കല ഏതാണ്?';
  }
  if (lower.includes('insectivorous plant traps and digests insects')) {
    return 'നൈട്രജന്റെ കുറവ് പരിഹരിക്കാൻ പ്രാണികളെ പിടിച്ചു ദഹിപ്പിക്കുന്ന സസ്യം ഏതാണ്?';
  }
  if (lower.includes('transfer of pollen grains from the anther to the stigma')) {
    return 'പരാഗരേണുക്കൾ കേസരത്തിൽ നിന്ന് ജനിപുടത്തിലേക്ക് പതിക്കുന്ന പ്രക്രിയ ഏതാണ്?';
  }
  if (lower.includes('dispersed by the wind because of hair')) {
    return 'കാറ്റിന്റെ സഹായത്താൽ വിത്തുവിതരണം നടത്തുന്നതിന് അനുകൂലനമുള്ള വിത്ത് ഏതാണ്?';
  }
  if (lower.includes('coconut fruits primarily dispersed')) {
    return 'ഭാരമുള്ള തേങ്ങ പ്രധാനമായും എങ്ങനെയാണ് ദൂരസ്ഥലങ്ങളിലേക്ക് വിതരണം ചെയ്യപ്പെടുന്നത്?';
  }
  if (lower.includes('prepare their own food using sunlight')) {
    return 'സൂര്യപ്രകാശം ഉപയോഗിച്ച് സ്വന്തമായി ആഹാരം നിർമ്മിക്കുന്ന ജീവികൾ ഏത് വിഭാഗത്തിൽപ്പെടുന്നു?';
  }
  if (lower.includes('eat only plants and plant products')) {
    return 'സസ്യങ്ങളും സസ്യഭാഗങ്ങളും മാത്രം ആഹാരമാക്കുന്ന ജീവികൾ ഏതാണ്?';
  }
  if (lower.includes('omnivore (eating both plants and meat)')) {
    return 'സസ്യങ്ങളെയും മറ്റ് മൃഗങ്ങളെയും ആഹാരമാക്കുന്ന മിശ്രഭുക്ക് (Omnivore) ഏതാണ്?';
  }
  if (lower.includes('grass -> deer -> tiger')) {
    return 'പുല്ല് -> മാൻ -> കടുവ എന്ന ഭക്ഷ്യശൃംഖലയിൽ മാനിന്റെ പങ്ക് എന്താണ്?';
  }
  if (lower.includes('break down dead plants and animal remains')) {
    return 'ചത്ത സസ്യങ്ങളെയും മൃഗങ്ങളെയും മണ്ണിലേക്ക് വിഘടിപ്പിച്ചു ചേർക്കുന്ന സൂക്ഷ്മാണുക്കൾ ഏത് വിഭാഗമാണ്?';
  }
  if (lower.includes('deficiency causes night blindness')) {
    return 'ഏത് വിറ്റാമിന്റെ കുറവ് മൂലമാണ് നിശാന്ധത (Night blindness) ഉണ്ടാകുന്നത്?';
  }
  if (lower.includes('deficiency causes bleeding gums and scurvy')) {
    return 'ഏത് വിറ്റാമിന്റെ കുറവ് മൂലമാണ് മോണയിൽ നിന്ന് രക്തം വരുന്ന സ്കർവി (Scurvy) ഉണ്ടാകുന്നത്?';
  }
  if (lower.includes('synthesized in human skin with the help of morning sunlight')) {
    return 'രാവിലെയുള്ള സൂര്യപ്രകാശത്തിന്റെ സാന്നിധ്യത്തിൽ ത്വക്കിൽ ഉൽപ്പാദിപ്പിക്കപ്പെടുന്ന വിറ്റാമിൻ ഏതാണ്?';
  }
  if (lower.includes('deficiency leads to goitre')) {
    return 'ഏത് ധാതുലവണത്തിന്റെ കുറവാണ് തൊണ്ടയിലെ തൈറോയ്ഡ് ഗ്രന്ഥിയുടെ വീക്കമായ ഗോയിറ്റർ (Goitre) ഉണ്ടാക്കുന്നത്?';
  }
  if (lower.includes('essential for the formation of strong bones and teeth')) {
    return 'ശക്തമായ അസ്ഥികളും പല്ലുകളും നിർമ്മിക്കാൻ ഏറ്റവും അത്യാവശ്യമായ ധാതു ഏതാണ്?';
  }
  if (lower.includes('deficiency of which mineral in human blood causes anaemia')) {
    return 'രക്തത്തിൽ ഏത് ധാതുവിന്റെ കുറവാണ് അനീമിയ (വിളർച്ച) ഉണ്ടാക്കുന്നത്?';
  }

  // Human Organs
  if (lower.includes('how many chambers are there in the human heart')) {
    return 'മനുഷ്യ ഹൃദയത്തിന് എത്ര അറകളുണ്ട്?';
  }
  if (lower.includes('filter waste substances and excess water from blood to produce urine')) {
    return 'രക്തത്തിൽ നിന്ന് മാലിന്യങ്ങളും അധിക ജലവും അരിച്ച് മൂത്രമാക്കി മാറ്റുന്ന അവയവം ഏതാണ്?';
  }
  if (lower.includes('controls bodily thoughts, memories, voluntary movements')) {
    return 'മനുഷ്യ ശരീരത്തിന്റെ ചിന്തകൾ, ഓർമ്മ, ചലനങ്ങൾ എന്നിവ നിയന്ത്രിക്കുന്ന പ്രധാന അവയവം ഏതാണ്?';
  }
  if (lower.includes('bony framework protects the human brain')) {
    return 'മനുഷ്യ മസ്തിഷ്കത്തെ ആഘാതങ്ങളിൽ നിന്ന് സംരക്ഷിക്കുന്ന അസ്ഥി നിർമ്മിത കവചം ഏതാണ്?';
  }
  if (lower.includes('bony cage in the human chest protects the heart and lungs')) {
    return 'നെഞ്ചിൽ ഹൃദയത്തെയും ശ്വാസകോശത്തെയും സംരക്ഷിക്കുന്ന അസ്ഥികൂട ഭാഗം ഏതാണ്?';
  }
  if (lower.includes('how many bones are there in the adult human skeleton')) {
    return 'പ്രായപൂർത്തിയായ ഒരു മനുഷ്യന്റെ അസ്ഥികൂടത്തിൽ ഏകദേശം എത്ര അസ്ഥികളുണ്ട്?';
  }
  if (lower.includes('connects bones to other bones')) {
    return 'അസ്ഥികളെ തമ്മിൽ സന്ധികളിൽ ബന്ധിപ്പിക്കുന്ന ഇലാസ്തികതയുള്ള കല ഏതാണ്?';
  }
  if (lower.includes('connects skeletal muscles to bones')) {
    return 'പേശികളെ അസ്ഥികളുമായി ബന്ധിപ്പിക്കുന്ന ബലമുള്ള കല ഏതാണ്?';
  }
  if (lower.includes('elbow and knee, allowing movement in one plane')) {
    return 'കൈമുട്ടിലും കാൽമുട്ടിലും കാണപ്പെടുന്ന വാതിലിന്റെ വിജാഗിരി പോലെയുള്ള സന്ധി ഏതാണ്?';
  }
  if (lower.includes('full circular rotation at the human shoulder and hip')) {
    return 'തോൾസന്ധിയിലും ഇടുപ്പ് സന്ധിയിലും കാണപ്പെടുന്ന എല്ലാ ദിശയിലേക്കും ചലിപ്പിക്കാവുന്ന സന്ധി ഏതാണ്?';
  }
  if (lower.includes('red oxygen-carrying protein pigment present in human red blood cells')) {
    return 'മനുഷ്യ രക്താണുക്കളിൽ ഓക്സിജൻ സംവഹനം നടത്തുന്ന ചുവന്ന വർണ്ണകം ഏതാണ്?';
  }
  if (lower.includes('carry pure oxygenated blood away from the heart')) {
    return 'ഹൃദയത്തിൽ നിന്ന് ശുദ്ധരക്തം ശരീരഭാഗങ്ങളിലേക്ക് എത്തിക്കുന്ന രക്തക്കുഴലുകൾ ഏതാണ്?';
  }
  if (lower.includes('bring deoxygenated blood back to the heart')) {
    return 'ശരീരഭാഗങ്ങളിൽ നിന്ന് അശുദ്ധരക്തം തിരികെ ഹൃദയത്തിലേക്ക് കൊണ്ടുവരുന്ന രക്തക്കുഴലുകൾ ഏതാണ്?';
  }
  if (lower.includes('normal breathing rate of an adult human at rest')) {
    return 'വിശ്രമാവസ്ഥയിൽ ഒരു സാധാരണ മനുഷ്യന്റെ ശ്വാസോച്ഛ്വാസ നിരക്ക് മിനിറ്റിൽ എത്രയാണ്?';
  }
  if (lower.includes('normal resting pulse rate of an adult human heart')) {
    return 'ഒരു സാധാരണ മനുഷ്യന്റെ ഹൃദയമിടിപ്പ് നിരക്ക് ഒരു മിനിറ്റിൽ ഏകദേശം എത്രയാണ്?';
  }
  if (lower.includes('churns food and secretes hydrochloric acid')) {
    return 'ഭക്ഷണം കടഞ്ഞെടുക്കുകയും ഹൈഡ്രോക്ലോറിക് ആസിഡ് ഉൽപ്പാദിപ്പിച്ച് അണുക്കളെ നശിപ്പിക്കുകയും ചെയ്യുന്ന അവയവം ഏതാണ്?';
  }
  if (lower.includes('digested food absorbed into the bloodstream')) {
    return 'ദഹിച്ച ആഹാരം രക്തത്തിലേക്ക് ആഗിരണം ചെയ്യപ്പെടുന്നത് ദഹനവ്യൂഹത്തിന്റെ ഏത് ഭാഗത്തുവെച്ചാണ്?';
  }
  if (lower.includes('largest internal gland in the human body secretes bile')) {
    return 'മനുഷ്യ ശരീരത്തിലെ ഏറ്റവും വലിയ ആന്തരിക ഗ്രന്ഥിയും പിത്തരസം നിർമ്മിക്കുന്നതുമായ അവയവം ഏതാണ്?';
  }
  if (lower.includes('outermost protective layer of the human tooth')) {
    return 'മനുഷ്യ പല്ലിന്റെ ഏറ്റവും കഠിനമായ ബാഹ്യ സംരക്ഷണ പാളി ഏതാണ്?';
  }
  if (lower.includes('how many permanent teeth does an adult human typically have')) {
    return 'പ്രായപൂർത്തിയായ ഒരു മനുഷ്യന് സാധാരണയായി എത്ര സ്ഥിരദന്തങ്ങളുണ്ട്?';
  }

  // Matter, Heat, Air, Water
  if (lower.includes('definite shape and a definite volume')) {
    return 'കൃത്യമായ ആകൃതിയും വ്യാപ്തവുമുള്ള പദാർത്ഥത്തിന്റെ അവസ്ഥ ഏതാണ്?';
  }
  if (lower.includes('definite volume but takes the shape of its container')) {
    return 'കൃത്യമായ വ്യാപ്തമുള്ളതും എന്നാൽ ഉൾക്കൊള്ളുന്ന പാത്രത്തിന്റെ ആകൃതി സ്വീകരിക്കുന്നതുമായ അവസ്ഥ ഏതാണ്?';
  }
  if (lower.includes('neither a definite shape nor a fixed volume')) {
    return 'കൃത്യമായ ആകൃതിയോ വ്യാപ്തമോ ഇല്ലാത്ത പദാർത്ഥത്തിന്റെ അവസ്ഥ ഏതാണ്?';
  }
  if (lower.includes('pure ice melts into liquid water')) {
    return 'സാധാരണ അന്തരീക്ഷ മർദ്ദത്തിൽ ശുദ്ധമായ ഐസ് ഉരുകി വെള്ളമാകുന്ന താപനില (ദ്രവണാങ്കം) എത്രയാണ്?';
  }
  if (lower.includes('boiling point of pure water')) {
    return 'സാധാരണ അന്തരീക്ഷ മർദ്ദത്തിൽ ശുദ്ധജലത്തിന്റെ തിളനില (തിളയ്ക്കുന്ന താപനില) എത്രയാണ്?';
  }
  if (lower.includes('solid to gas without becoming liquid (e.g., camphor')) {
    return 'ചൂടാക്കുമ്പോൾ ഖരരൂപത്തിൽ നിന്ന് നേരിട്ട് വാതകമാകുന്ന പ്രക്രിയ (ഉദാ: കർപ്പൂരം) ഏതാണ്?';
  }
  if (lower.includes('what happens to most solid metals when they are heated')) {
    return 'ലോഹങ്ങൾ ചൂടാക്കുമ്പോൾ അവയ്ക്ക് എന്ത് സംഭവിക്കുന്നു?';
  }
  if (lower.includes('small expansion gaps left between consecutive steel railway track rails')) {
    return 'തീവണ്ടി പാളങ്ങൾക്കിടയിൽ ചെറിയ വിടവുകൾ വിട്ടിരിക്കുന്നത് എന്തിനാണ്?';
  }
  if (lower.includes('liquid metal is commonly used inside traditional clinical and laboratory thermometers')) {
    return 'തെർമോമീറ്ററുകളിൽ സാധാരണയായി ഉപയോഗിക്കുന്ന ദ്രാവക ലോഹം ഏതാണ്?';
  }
  if (lower.includes('normal body temperature of a healthy human being on the celsius scale')) {
    return 'ആരോഗ്യമുള്ള ഒരു മനുഷ്യന്റെ സാധാരണ ശരീര താപനില സെൽഷ്യസ് സ്കെയിലിൽ എത്രയാണ്?';
  }
  if (lower.includes('temperature range typically marked on a clinical thermometer')) {
    return 'ഒരു ക്ലിനിക്കൽ തെർമോമീറ്ററിൽ അടയാളപ്പെടുത്തിയിരിക്കുന്ന താപനില പരിധി എത്രയാണ്?';
  }
  if (lower.includes('constitutes approximately 78% of clean dry air')) {
    return 'അന്തരീക്ഷ വായുവിൽ ഏറ്റവും കൂടുതൽ (ഏകദേശം 78%) അടങ്ങിയിരിക്കുന്ന വാതകം ഏതാണ്?';
  }
  if (lower.includes('approximately 21%')) {
    return 'അന്തരീക്ഷ വായുവിന്റെ ഏകദേശം 21% വരുന്ന ജീവൻ നിലനിർത്തുന്ന വാതകം ഏതാണ്?';
  }
  if (lower.includes('essential for combustion and supporting burning flames')) {
    return 'വസ്തുക്കൾ കത്തുന്നതിനെ സഹായിക്കുന്ന വാതകം ഏതാണ്?';
  }
  if (lower.includes('fire extinguishers to put out flames')) {
    return 'തീ അണയ്ക്കാൻ ഫയർ എക്സ്റ്റിംഗുഷറുകളിൽ സാധാരണയായി ഉപയോഗിക്കുന്ന വാതകം ഏതാണ്?';
  }
  if (lower.includes('stratosphere protects living beings from harmful solar ultraviolet')) {
    return 'സൂര്യനിൽ നിന്നുള്ള ഹാനികരമായ അൾട്രാവയലറ്റ് (UV) രശ്മികളിൽ നിന്ന് ഭൂമിയെ സംരക്ഷിക്കുന്ന അന്തരീക്ഷ പാളി ഏതാണ്?';
  }
  if (lower.includes('instrument is used to measure atmospheric air pressure')) {
    return 'അന്തരീക്ഷ മർദ്ദം അളക്കാൻ ഉപയോഗിക്കുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('quantity of rainfall in millimeters')) {
    return 'ഒരു പ്രദേശത്ത് പെയ്യുന്ന മഴയുടെ അളവ് മില്ലിമീറ്ററിൽ അളക്കുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('direction from which the wind is blowing')) {
    return 'കാറ്റ് വീശുന്ന ദിശ മനസ്സിലാക്കാൻ ഉപയോഗിക്കുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('speed of wind blowing outdoors')) {
    return 'കാറ്റിന്റെ വേഗത അളക്കാൻ ഉപയോഗിക്കുന്ന ഉപകരണം ഏതാണ്?';
  }

  // Simple Machines
  if (lower.includes('seesaw or a crowbar pivoting on a support')) {
    return 'ഒരു താങ്ങിൽ ഉറപ്പിച്ച് പ്രവർത്തിക്കുന്ന സീസോ (Seesaw) അല്ലെങ്കിൽ പാര ഏത് ലഘുയന്ത്രത്തിന് ഉദാഹരണമാണ്?';
  }
  if (lower.includes('fixed point around which a lever turns')) {
    return 'ഒരു ഉത്തോലകം തിരിയുന്ന ആധാരബിന്ദുവിന് (സ്ഥിരബിന്ദു) എന്ത് പറയുന്നു?';
  }
  if (lower.includes('grooved wheel with a rope running around it used to pull buckets')) {
    return 'കിണറ്റിൽ നിന്ന് വെള്ളം കോരാൻ കയർ ഘടിപ്പിച്ചുപയോഗിക്കുന്ന ചാലുകളുള്ള ചക്രം ഏതാണ്?';
  }
  if (lower.includes('sloping surface or ramp used to roll heavy barrels')) {
    return 'ഭാരമുള്ള വസ്തുക്കൾ വാഹനത്തിലേക്ക് എളുപ്പത്തിൽ കയറ്റാൻ ഉപയോഗിക്കുന്ന ചരിഞ്ഞ പ്രതലം ഏതാണ്?';
  }
  if (lower.includes('knife, chisel, or axe used for cutting')) {
    return 'മുറിക്കാനും കീറാനും ഉപയോഗിക്കുന്ന കത്തി, കോടാലി തുടങ്ങിയ ഉപകരണങ്ങൾ ഏത് ലഘുയന്ത്രമാണ്?';
  }
  if (lower.includes('inclined plane wrapped spirally around a central cylinder')) {
    return 'ഒരു സിലിണ്ടറിന് ചുറ്റും സർപ്പിളാകൃതിയിൽ ചുറ്റിയ ചരിവുതലം പോലെയുള്ള ലഘുയന്ത്രം ഏതാണ്?';
  }

  // Light, Sound, Magnetism
  if (lower.includes('primary natural source of heat and light energy for planet earth')) {
    return 'ഭൂമിയിലെ താപത്തിന്റെയും വെളിച്ചത്തിന്റെയും പ്രധാന പ്രകൃതിദത്ത സ്രോതസ്സ് ഏതാണ്?';
  }
  if (lower.includes('emits its own light (a luminous object)')) {
    return 'സ്വന്തമായി പ്രകാശം പുറപ്പെടുവിക്കുന്ന പ്രകാശ സ്രോതസ്സ് (Luminous object) ഏതാണ്?';
  }
  if (lower.includes('moon is visible in the night sky even though it is non-luminous')) {
    return 'സ്വന്തമായി പ്രകാശമില്ലാതിരുന്നിട്ടും രാത്രിയിൽ ചന്ദ്രൻ തിളങ്ങി കാണപ്പെടുന്നത് എന്തുകൊണ്ടാണ്?';
  }
  if (lower.includes('allows light to pass through completely, so objects on the other side are seen clearly')) {
    return 'പ്രകാശത്തെ പൂർണ്ണമായി കടത്തിവിടുന്നതും മറുവശത്തുള്ള വസ്തുക്കൾ വ്യക്തമായി കാണാൻ കഴിയുന്നതുമായ പദാർത്ഥങ്ങൾ ഏതാണ്?';
  }
  if (lower.includes('allows only some light to pass through, creating blurred vision')) {
    return 'പ്രകാശത്തെ ഭാഗികമായി മാത്രം കടത്തിവിടുന്ന പദാർത്ഥങ്ങൾ (ഉദാ: ട്രേസിംഗ് പേപ്പർ) ഏത് വിഭാഗത്തിൽപ്പെടുന്നു?';
  }
  if (lower.includes('completely blocks light from passing through, casting a dark shadow')) {
    return 'പ്രകാശത്തെ ഒട്ടും കടത്തിവിടാത്തതും നിഴൽ ഉണ്ടാക്കുന്നതുമായ പദാർത്ഥങ്ങൾ ഏതാണ്?';
  }
  if (lower.includes('dark patch is formed when an opaque object blocks')) {
    return 'പ്രകാശപാതയിൽ സുതാര്യമല്ലാത്ത ഒരു വസ്തു തടസ്സമാകുമ്പോൾ രൂപപ്പെടുന്ന ഇരുണ്ട ഭാഗം ഏതാണ്?';
  }
  if (lower.includes('light traveling strictly in straight lines')) {
    return 'പ്രകാശം നേർരേഖയിൽ സഞ്ചരിക്കുന്നു എന്ന സ്വഭാവത്തിന് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('image is formed on the screen of a simple pinhole camera')) {
    return 'ഒരു ലളിതമായ പിൻഹോൾ ക്യാമറയിൽ രൂപപ്പെടുന്ന പ്രതിബിംബത്തിന്റെ സ്വഭാവം എന്താണ്?';
  }
  if (lower.includes('bouncing back of light from a polished smooth mirror surface')) {
    return 'മിനുസമുള്ള പ്രതലത്തിൽ തട്ടി പ്രകാശം തിരികെ പോകുന്ന പ്രതിഭാസം ഏതാണ്?';
  }
  if (lower.includes('nature of an image formed by a flat, smooth plane bathroom mirror')) {
    return 'ഒരു സമതല ദർപ്പണത്തിൽ (Plane mirror) രൂപപ്പെടുന്ന പ്രതിബിംബത്തിന്റെ സ്വഭാവം എന്താണ്?';
  }
  if (lower.includes('right hand to appear as the left hand in a plane mirror')) {
    return 'സമതല ദർപ്പണത്തിൽ വലതുവശം ഇടതുവശമായും ഇടതുവശം വലതുവശമായും കാണപ്പെടുന്ന പ്രതിഭാസം ഏതാണ്?';
  }
  if (lower.includes('speed of light traveling in air or vacuum')) {
    return 'ശൂന്യാകാശത്തിലൂടെയോ വായുവിലൂടെയോ പ്രകാശം സഞ്ചരിക്കുന്ന ഏകദേശ വേഗത എത്രയാണ്?';
  }
  if (lower.includes('sound produced by vibrating objects')) {
    return 'വസ്തുക്കൾ കമ്പനം ചെയ്യുമ്പോൾ എങ്ങനെയാണ് ശബ്ദം ഉണ്ടാകുന്നത്?';
  }
  if (lower.includes('mediums can sound waves not travel at all')) {
    return 'താഴെ പറയുന്നവയിൽ ഏതിലൂടെയാണ് ശബ്ദ തരംഗങ്ങൾക്ക് ഒട്ടും സഞ്ചരിക്കാൻ സാധിക്കാത്തത്?';
  }
  if (lower.includes('medium does sound travel with the fastest speed')) {
    return 'ശബ്ദം ഏറ്റവും വേഗത്തിൽ സഞ്ചരിക്കുന്നത് ഏത് മാധ്യമത്തിലൂടെയാണ്?';
  }
  if (lower.includes('speed of sound waves traveling in dry air at room temperature')) {
    return 'സാധാരണ അന്തരീക്ഷ വായുവിൽ ശബ്ദത്തിന്റെ വേഗത ഏകദേശം എത്രയാണ്?';
  }
  if (lower.includes('naturally occurring magnetic rock composed of iron oxide')) {
    return 'പ്രകൃതിദത്തമായി കാന്തികശക്തിയുള്ള ഇരുമ്പ് അയിര് അടങ്ങിയ കാന്തക്കല്ലിന്റെ പേരെന്താണ്?';
  }
  if (lower.includes('how many magnetic poles does every magnet possess')) {
    return 'ഏതൊരു കാന്തത്തിനും എത്ര കാന്തിക ധ്രുവങ്ങളുണ്ട്?';
  }
  if (lower.includes('two identical north poles of two bar magnets are brought close')) {
    return 'രണ്ട് കാന്തങ്ങളുടെ സമാന ധ്രുവങ്ങൾ (ഉദാ: നോർത്ത് ധ്രുവങ്ങൾ) തമ്മിൽ അടുപ്പിച്ചാൽ എന്ത് സംഭവിക്കും?';
  }
  if (lower.includes('north pole of one magnet is brought near the south pole')) {
    return 'ഒരു കാന്തത്തിന്റെ ഉത്തര ധ്രുവവും മറ്റൊന്നിന്റെ ദക്ഷിണ ധ്രുവവും തമ്മിൽ അടുപ്പിച്ചാൽ എന്ത് സംഭവിക്കും?';
  }
  if (lower.includes('freely by a thread, in which geographic direction does its north pole point')) {
    return 'ചരടിൽ കെട്ടി സ്വതന്ത്രമായി തൂക്കിയിട്ട ഒരു കാന്തത്തിന്റെ ഉത്തരധ്രുവം ഏത് ഭൂമിശാസ്ത്ര ദിശയിലാണ് നിൽക്കുന്നത്?';
  }
  if (lower.includes('magnetized needle pivoted at its center is used by sailors')) {
    return 'യാത്രക്കാർ ദിശ മനസ്സിലാക്കാൻ ഉപയോഗിക്കുന്ന കാന്തിക സൂചിയുള്ള ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('non-magnetic and will not stick to a strong magnet')) {
    return 'കാന്തം ആകർഷിക്കാത്ത കാന്തികേതര വസ്തു താഴെ പറയുന്നവയിൽ ഏതാണ്?';
  }

  // Units
  if (lower.includes('standard international (si) unit of length')) {
    return 'നീളത്തിന്റെ അടിസ്ഥാന അന്താരാഷ്ട്ര (SI) യൂണിറ്റ് ഏതാണ്?';
  }
  if (lower.includes('standard si unit of mass')) {
    return 'പിണ്ഡത്തിന്റെ (Mass) അന്താരാഷ്ട്ര (SI) യൂണിറ്റ് ഏതാണ്?';
  }
  if (lower.includes('standard si unit of time')) {
    return 'സമയത്തിന്റെ അടിസ്ഥാന അന്താരാഷ്ട്ര (SI) യൂണിറ്റ് ഏതാണ്?';
  }
  if (lower.includes('standard si unit of thermodynamic temperature')) {
    return 'താപനിലയുടെ അന്താരാഷ്ട്ര (SI) യൂണിറ്റ് ഏതാണ്?';
  }
  if (lower.includes('centimeters (cm) are there in 1 standard meter')) {
    return '1 മീറ്ററിൽ എത്ര സെന്റീമീറ്ററുകൾ (cm) അടങ്ങിയിരിക്കുന്നു?';
  }
  if (lower.includes('grams (g) are in 1 standard kilogram')) {
    return '1 കിലോഗ്രാമിൽ എത്ര ഗ്രാമുകൾ അടങ്ങിയിരിക്കുന്നു?';
  }
  if (lower.includes('seconds are in exactly 1 hour')) {
    return '1 മണിക്കൂറിൽ കൃത്യം എത്ര സെക്കൻഡുകൾ ഉണ്ട്?';
  }
  if (lower.includes('milliliters (ml) are contained in 1 standard liter')) {
    return '1 ലിറ്ററിൽ എത്ര മില്ലിലിറ്ററുകൾ (mL) ഉണ്ട്?';
  }

  // Computer Hardware
  if (lower.includes('displays visual text, images, and videos on a screen')) {
    return 'വിവരങ്ങളും ദൃശ്യങ്ങളും സ്ക്രീനിൽ പ്രദർശിപ്പിക്കുന്ന കമ്പ്യൂട്ടർ ഔട്ട്പുട്ട് ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('keys with letters, numbers, and symbols used for typing')) {
    return 'അക്ഷരങ്ങളും സംഖ്യകളും ടൈപ്പ് ചെയ്യാൻ ഉപയോഗിക്കുന്ന കമ്പ്യൂട്ടർ ഇൻപുട്ട് ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('pointing device allows users to click, select, and drag')) {
    return 'സ്ക്രീനിലെ വിവരങ്ങൾ ക്ലിക്ക് ചെയ്യാനും തിരഞ്ഞെടുക്കാനും സഹായിക്കുന്ന പോയിന്റിംഗ് ഡിവൈസ് ഏതാണ്?';
  }
  if (lower.includes('pressing and releasing the left mouse button twice')) {
    return 'ഇടത് മൗസ് ബട്ടൺ വേഗത്തിൽ രണ്ട് തവണ അമർത്തി വിടുന്ന പ്രക്രിയയ്ക്ക് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('opens a shortcut context menu with options like copy and paste')) {
    return 'കോപ്പി, പേസ്റ്റ് തുടങ്ങിയ ഓപ്ഷനുകളുള്ള മെനു തുറക്കാൻ മൗസിന്റെ ഏത് ബട്ടണാണ് ക്ലിക്ക് ചെയ്യേണ്ടത്?';
  }
  if (lower.includes('wheel located between the two mouse buttons')) {
    return 'പേജുകളിൽ മുകളിലേക്കും താഴേക്കും നീങ്ങാൻ മൗസ് ബട്ടണുകൾക്കിടയിലുള്ള വീൽ ഏതാണ്?';
  }
  if (lower.includes('permanent physical paper printouts of digital documents')) {
    return 'കമ്പ്യൂട്ടറിലെ വിവരങ്ങൾ കടലാസിൽ പ്രിന്റ് ചെയ്ത് നൽകുന്ന ഔട്ട്പുട്ട് ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('paper printout produced by a computer printer called')) {
    return 'പ്രിന്റർ വഴി കടലാസിൽ അച്ചടിച്ച രേഖകൾക്ക് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('unprinted electronic document stored on a computer or screen')) {
    return 'കമ്പ്യൂട്ടറിൽ ഡിജിറ്റലായി സൂക്ഷിച്ചിരിക്കുന്ന അച്ചടിക്കാത്ത ഫയലുകൾക്ക് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('captures physical paper photos or documents and converts them into digital images')) {
    return 'ഫോട്ടോകളും പുസ്തക താളുകളും കമ്പ്യൂട്ടറിലേക്ക് ഡിജിറ്റൽ ചിത്രമായി പകർത്തുന്ന ഇൻപുട്ട് ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('captures spoken voice and audio into a computer')) {
    return 'ശബ്ദം കമ്പ്യൂട്ടറിലേക്ക് റെക്കോർഡ് ചെയ്യാൻ ഉപയോഗിക്കുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('plays music, voice, and system sound effects')) {
    return 'പാട്ടുകളും ശബ്ദങ്ങളും കേൾക്കാൻ ഉപയോഗിക്കുന്ന ഔട്ട്പുട്ട് ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('digital camera mounted on a computer captures live video')) {
    return 'ഓൺലൈൻ ക്ലാസുകളിലും വീഡിയോ കോളുകളിലും ദൃശ്യങ്ങൾ പകർത്താൻ കമ്പ്യൂട്ടറിൽ ഘടിപ്പിക്കുന്ന ക്യാമറ ഏതാണ്?';
  }
  if (lower.includes('projects large computer images and presentations onto a classroom wall')) {
    return 'ക്ലാസ് മുറികളിലെ വലിയ സ്ക്രീനിലേക്ക് കമ്പ്യൂട്ടർ ദൃശ്യങ്ങൾ വലുതാക്കി കാണിക്കുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('backup battery device provides emergency power')) {
    return 'വൈദ്യുതി മുടങ്ങുമ്പോൾ കമ്പ്യൂട്ടർ പെട്ടെന്ന് ഓഫാകാതിരിക്കാൻ ബാറ്ററി ബാക്കപ്പ് നൽകുന്ന ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('portable flash memory device connects into a usb port')) {
    return 'സ്കൂൾ ഫയലുകൾ സൂക്ഷിക്കാനും കൈമാറാനും USB പോർട്ടിൽ ഘടിപ്പിക്കുന്ന പോർട്ടബിൾ ഉപകരണം ഏതാണ്?';
  }
  if (lower.includes('longest horizontal key at the bottom of a computer keyboard')) {
    return 'അക്ഷരങ്ങൾക്കിടയിൽ അകലം നൽകാൻ കീബോർഡിന്റെ താഴെയുള്ള ഏറ്റവും നീളമുള്ള കീ ഏതാണ്?';
  }
  if (lower.includes('moves the text cursor to the beginning of the next new line')) {
    return 'പുതിയ വരിയിലേക്ക് (Next line) പോകാൻ ഉപയോഗിക്കുന്ന കീ ഏതാണ്?';
  }
  if (lower.includes('erases characters immediately to the left of the blinking cursor')) {
    return 'കർസറിന്റെ ഇടത്തുഭാഗത്തുള്ള അക്ഷരങ്ങൾ മായ്ക്കാൻ ഉപയോഗിക്കുന്ന കീ ഏതാണ്?';
  }
  if (lower.includes('erases characters immediately to the right of the blinking cursor')) {
    return 'കർസറിന്റെ വലത്തുഭാഗത്തുള്ള അക്ഷരങ്ങൾ മായ്ക്കാൻ ഉപയോഗിക്കുന്ന കീ ഏതാണ്?';
  }
  if (lower.includes('locks the keyboard to type all letters in uppercase')) {
    return 'തുടർച്ചയായി വലിയക്ഷരങ്ങളിൽ (Capital letters) ടൈപ്പ് ചെയ്യാൻ ഉപയോഗിക്കുന്ന ലോക്ക് കീ ഏതാണ്?';
  }

  // OS & Tux Paint
  if (lower.includes('loading the operating system into computer memory when turning on')) {
    return 'കമ്പ്യൂട്ടർ ഓൺ ചെയ്യുമ്പോൾ ഓപ്പറേറ്റിംഗ് സിസ്റ്റം മെമ്മറിയിലേക്ക് ലോഡ് ചെയ്യുന്ന പ്രക്രിയയ്ക്ക് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('main opening screen that appears after the computer completes booting')) {
    return 'കമ്പ്യൂട്ടർ ബൂട്ടിംഗ് പൂർത്തിയായ ശേഷം കാണുന്ന പ്രധാന ആദ്യ സ്ക്രീനിന് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('small graphical pictures on the desktop representing programs')) {
    return 'ഡെസ്ക്ടോപ്പിൽ ഫയലുകളെയും പ്രോഗ്രാമുകളെയും സൂചിപ്പിക്കുന്ന ചെറിയ ചിത്രങ്ങൾക്ക് എന്ത് പറയുന്നു?';
  }
  if (lower.includes('special storage folder temporarily holds files and folders deleted')) {
    return 'ഡിലീറ്റ് ചെയ്യുന്ന ഫയലുകൾ താൽക്കാലികമായി സൂക്ഷിക്കുന്ന ഫോൾഡർ ഏതാണ്?';
  }
  if (lower.includes('if a student accidentally deletes an important school file, how can it be recovered')) {
    return 'അബദ്ധത്തിൽ ഒരു ഫയൽ ഡിലീറ്റ് ചെയ്താൽ അത് എങ്ങനെ തിരികെ ലഭിക്കും?';
  }
  if (lower.includes('free, open-source operating system distribution widely installed in all kerala public schools by kite')) {
    return 'കേരളത്തിലെ പൊതുവിദ്യാലയങ്ങളിൽ KITE വഴി വിന്യസിച്ചിട്ടുള്ള സ്വതന്ത്ര ഓപ്പറേറ്റിംഗ് സിസ്റ്റം ഏതാണ്?';
  }
  if (lower.includes('cheerful cartoon mascot of tux paint')) {
    return 'ടക്സ് പെയിന്റ് (Tux Paint) സോഫ്റ്റ്‌വെയറിലെ മനോഹരമായ കാർട്ടൂൺ കഥാപാത്രം (Mascot) ഏത് ജീവിയാണ്?';
  }
  if (lower.includes('in tux paint, which tool is used for freehand drawing with different brush shapes')) {
    return 'ടക്സ് പെയിന്റിൽ വിവിധ ബ്രഷുകൾ ഉപയോഗിച്ച് കൈകൊണ്ട് ചിത്രം വരയ്ക്കാൻ ഏത് ടൂളാണ് ഉപയോഗിക്കുന്നത്?';
  }
  if (lower.includes('ready-made picture stickers (like animals, plants')) {
    return 'ടക്സ് പെയിന്റിൽ റെഡിമെയ്ഡ് സ്റ്റിക്കർ ചിത്രങ്ങൾ ചേർക്കാൻ ഏത് ടൂളാണ് ഉപയോഗിക്കുന്നത്?';
  }
  if (lower.includes('special effects like rainbow, grass, bricks')) {
    return 'മഴവില്ല്, പുല്ല് തുടങ്ങിയ അത്ഭുതകരമായ മാന്ത്രിക ഇഫക്റ്റുകൾ നൽകാൻ ടക്സ് പെയിന്റിലെ ഏത് ടൂളാണ് ഉപയോഗിക്കുന്നത്?';
  }
  if (lower.includes('which button in tux paint reverses the last action')) {
    return 'ടക്സ് പെയിന്റിൽ തെറ്റായി വരച്ച അവസാന വര ഒഴിവാക്കാൻ (Undo) ഏത് ബട്ടണാണ് അമർത്തേണ്ടത്?';
  }

  // Kerala state symbols
  if (lower.includes('state animal of kerala')) {
    return 'കേരളത്തിന്റെ ഔദ്യോഗിക സംസ്ഥാന മൃഗം ഏതാണ്?';
  }
  if (lower.includes('state bird of kerala')) {
    return 'കേരളത്തിന്റെ ഔദ്യോഗിക സംസ്ഥാന പക്ഷി ഏതാണ്?';
  }
  if (lower.includes('state tree of kerala')) {
    return 'കേരളത്തിന്റെ ഔദ്യോഗിക സംസ്ഥാന വൃക്ഷം ഏതാണ്?';
  }
  if (lower.includes('state flower of kerala')) {
    return 'കേരളത്തിന്റെ ഔദ്യോഗിക സംസ്ഥാന പുഷ്പം (കണിക്കൊന്ന) ഏതാണ്?';
  }
  if (lower.includes('state fish of kerala')) {
    return 'കേരളത്തിന്റെ ഔദ്യോഗിക സംസ്ഥാന മത്സ്യം ഏതാണ്?';
  }
  if (lower.includes('longest river flowing in kerala')) {
    return 'കേരളത്തിലൂടെ ഒഴുകുന്ന ഏറ്റവും നീളം കൂടിയ നദി ഏതാണ്?';
  }
  if (lower.includes('longest freshwater/brackish lake in kerala')) {
    return 'കേരളത്തിലെ ഏറ്റവും വലിയ കായൽ ഏതാണ്?';
  }
  if (lower.includes('silent valley national park is famous for')) {
    return 'വംശനാശഭീഷണി നേരിടുന്ന സിംഹവാലൻ കുരങ്ങുകളെ സംരക്ഷിക്കുന്ന കേരളത്തിലെ ദേശീയോദ്യാനം ഏതാണ്?';
  }
  if (lower.includes('monsoon season brings the heaviest rainfall to kerala starting in june')) {
    return 'ജൂൺ മാസത്തിൽ ആരംഭിച്ച് കേരളത്തിൽ ഏറ്റവും കൂടുതൽ മഴ നൽകുന്ന ഇടവപ്പാതി ഏത് മൺസൂൺ ആണ്?';
  }
  if (lower.includes('three rs stand for')) {
    return 'പരിസ്ഥിതി സംരക്ഷണത്തിലെ ത്രീ ആർ (Three Rs) എന്നതുകൊണ്ട് ഉദ്ദേശിക്കുന്നത് എന്താണ്?';
  }
  if (lower.includes('full form of kite') || lower.includes('kite stand for')) {
    return 'കേരള വിദ്യാഭ്യാസ വകുപ്പിലെ KITE-ന്റെ പൂർണ്ണരൂപം എന്താണ്?';
  }

  // Fallback: clear bilingual presentation
  return en;
}

async function run() {
  console.log('Loading balanced questions from Complete_1000_Questions_Balanced.txt...');
  const balancedRaw = fs.readFileSync(path.join(__dirname, '..', 'Complete_1000_Questions_Balanced.txt'), 'utf8');
  const lines = balancedRaw.split(/\r?\n/);
  
  let balancedList = [];
  let current = null;
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith('Q.')) {
      if (current) balancedList.push(current);
      current = {
        orderIndex: balancedList.length + 1,
        text: line.replace(/^Q\.\s*/, '').trim(),
        options: [],
        answer: ''
      };
    } else if (/^[A-D]\)/.test(line)) {
      if (current) current.options.push(line.replace(/^[A-D]\)\s*/, '').trim());
    } else if (line.startsWith('Answer:')) {
      if (current) current.answer = line;
    }
  }
  if (current) balancedList.push(current);

  console.log(`Loaded ${balancedList.length} questions.`);

  // Build text -> old translation map from DB questions
  const dbQs = await prisma.question.findMany({ select: { id: true, text: true } });
  const textToMl = new Map();
  dbQs.forEach(q => {
    if (oldMl[q.id]) {
      textToMl.set(q.text.trim().toLowerCase(), oldMl[q.id]);
    }
  });

  const finalMl = {};
  let reusedCount = 0;
  let newGenCount = 0;

  balancedList.forEach((q) => {
    const key = q.text.trim().toLowerCase();
    if (textToMl.has(key)) {
      // Preserve existing verified translation
      finalMl[String(q.orderIndex)] = textToMl.get(key);
      reusedCount++;
    } else {
      // Generate high-quality new Malayalam translation
      const mlText = translateQuestionText(q.text);
      const mlOpts = q.options.map(opt => translateOption(opt));
      finalMl[String(q.orderIndex)] = {
        text: mlText,
        options: mlOpts
      };
      newGenCount++;
    }
  });

  console.log(`Translations compiled: Reused=${reusedCount}, Newly Crafted=${newGenCount}, Total=${Object.keys(finalMl).length}`);

  // Write out to questions-ml.json
  const mlPath = path.join(__dirname, '..', 'src', 'lib', 'questions-ml.json');
  fs.writeFileSync(mlPath, JSON.stringify(finalMl, null, 2), 'utf8');
  console.log(`Updated Malayalam translations at: ${mlPath}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
