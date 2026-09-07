const fs = require('fs');
const path = require('path');
const current = require('./data/new-easy-questions.js');

const extra73 = [
  // Kerala Environmental Science & State Symbols (Classes 4-7)
  {
    text: "What is the official State Animal of Kerala?",
    options: ["Indian Elephant", "Tiger", "Lion-tailed Macaque", "Spotted Deer"],
    answer: "A) Indian Elephant"
  },
  {
    text: "What is the official State Bird of Kerala?",
    options: ["Great Indian Hornbill", "Peacock", "Woodpecker", "Kingfisher"],
    answer: "A) Great Indian Hornbill"
  },
  {
    text: "What is the official State Tree of Kerala?",
    options: ["Coconut Tree", "Teak Tree", "Banyan Tree", "Neem Tree"],
    answer: "A) Coconut Tree"
  },
  {
    text: "What is the official State Flower of Kerala (Kanikkonna)?",
    options: ["Golden Shower (Cassia fistula)", "Lotus", "Jasmine", "Hibiscus"],
    answer: "A) Golden Shower (Cassia fistula)"
  },
  {
    text: "What is the official State Fish of Kerala?",
    options: ["Pearl Spot (Karimeen)", "Sardine (Mathi)", "Mackerel (Ayala)", "Catla"],
    answer: "A) Pearl Spot (Karimeen)"
  },
  {
    text: "Which is the longest river flowing in Kerala?",
    options: ["Periyar", "Bharathapuzha", "Pamba", "Chaliyar"],
    answer: "A) Periyar"
  },
  {
    text: "Which is the longest freshwater/brackish lake in Kerala?",
    options: ["Vembanad Lake", "Ashtamudi Lake", "Sasthamkotta Lake", "Pookode Lake"],
    answer: "A) Vembanad Lake"
  },
  {
    text: "Which National Park in Kerala is famous for conserving the endangered Lion-tailed Macaque?",
    options: ["Silent Valley National Park", "Eravikulam National Park", "Periyar National Park", "Mathikettan Shola"],
    answer: "A) Silent Valley National Park"
  },
  {
    text: "Which monsoon season brings the heaviest rainfall to Kerala starting in June (Edavappathi)?",
    options: ["Southwest Monsoon", "Northeast Monsoon", "Winter Monsoon", "Retreating Monsoon"],
    answer: "A) Southwest Monsoon"
  },
  {
    text: "Which of the following is a non-biodegradable waste material that harms the environment if not recycled?",
    options: ["Plastic carry bag", "Banana peel", "Dry leaves", "Paper scrap"],
    answer: "A) Plastic carry bag"
  },
  {
    text: "In environmental waste management, what do the Three Rs stand for?",
    options: ["Reduce, Reuse, Recycle", "Read, Revise, Remember", "Run, Rest, Repeat", "Remove, Replace, Return"],
    answer: "A) Reduce, Reuse, Recycle"
  },

  // Everyday Physics & Science Observations (Classes 4-7)
  {
    text: "Which electrical appliance converts electrical energy primarily into light energy?",
    options: ["LED Bulb", "Electric Iron", "Ceiling Fan", "Immersion Heater"],
    answer: "A) LED Bulb"
  },
  {
    text: "Which device converts electrical energy primarily into mechanical rotational energy?",
    options: ["Electric Motor (Fan)", "Electric Bulb", "Electric Heater", "Loudspeaker"],
    answer: "A) Electric Motor (Fan)"
  },
  {
    text: "Which device converts electrical energy primarily into sound waves?",
    options: ["Loudspeaker / Buzzer", "Electric Iron", "Electric Kettle", "Solar Cell"],
    answer: "A) Loudspeaker / Buzzer"
  },
  {
    text: "Which instrument is connected in an electric circuit to measure the electric current flowing through it?",
    options: ["Ammeter", "Voltmeter", "Thermometer", "Barometer"],
    answer: "A) Ammeter"
  },
  {
    text: "Which instrument is connected across two points in a circuit to measure electrical potential difference (voltage)?",
    options: ["Voltmeter", "Ammeter", "Speedometer", "Galvanometer"],
    answer: "A) Voltmeter"
  },
  {
    text: "Why do wet clothes hung outdoors dry much faster on a hot, windy day?",
    options: ["Higher temperature and wind speed increase the rate of evaporation", "Wind condenses the water droplets", "Sunlight melts the clothes fibers", "Air pressure pushes water into the ground"],
    answer: "A) Higher temperature and wind speed increase the rate of evaporation"
  },
  {
    text: "Why do tiny water droplets appear on the outer surface of a glass tumbler containing ice-cold water?",
    options: ["Water vapor in surrounding warm air condenses upon touching the cold glass", "Water leaks through the glass pores", "The cold glass creates hydrogen gas", "Ice sublimates outwards"],
    answer: "A) Water vapor in surrounding warm air condenses upon touching the cold glass"
  },
  {
    text: "Why are handles of cooking utensils like frying pans made of Bakelite plastic or wood?",
    options: ["They are poor conductors (insulators) of heat, preventing burns", "They make the pan heavier and balanced", "They absorb cooking oil", "They conduct heat faster to hands"],
    answer: "A) They are poor conductors (insulators) of heat, preventing burns"
  },
  {
    text: "Why are electric transmission wires made of metals like copper and aluminum?",
    options: ["They are excellent conductors of electricity", "They are good electrical insulators", "They prevent heat from escaping", "They are magnetic materials"],
    answer: "A) They are excellent conductors of electricity"
  },
  {
    text: "Why is a convex mirror preferred as a rear-view driver mirror in cars and buses?",
    options: ["It gives an erect, diminished image with a wider field of view", "It inverts images of overtaking vehicles", "It magnifies small objects greatly", "It produces colorful images"],
    answer: "A) It gives an erect, diminished image with a wider field of view"
  },
  {
    text: "What optical phenomenon causes the split of white sunlight into a spectrum of seven colors (VIBGYOR)?",
    options: ["Dispersion of light", "Total internal reflection", "Diffraction", "Polarization"],
    answer: "A) Dispersion of light"
  },
  {
    text: "How many distinct colors are traditionally recognized in a natural sky rainbow (VIBGYOR)?",
    options: ["7 colors", "5 colors", "3 colors", "10 colors"],
    answer: "A) 7 colors"
  },
  {
    text: "Which color in the visible light spectrum undergoes the maximum deviation (bends the most) through a glass prism?",
    options: ["Violet", "Red", "Green", "Yellow"],
    answer: "A) Violet"
  },
  {
    text: "Which color in visible light has the longest wavelength and is least scattered, making it ideal for danger signal lights?",
    options: ["Red", "Violet", "Blue", "Yellow"],
    answer: "A) Red"
  },
  {
    text: "What are the three primary additive colors of light used in computer color monitors?",
    options: ["Red, Green, Blue (RGB)", "Red, Yellow, Blue", "Cyan, Magenta, Yellow", "Black, White, Gray"],
    answer: "A) Red, Green, Blue (RGB)"
  },
  {
    text: "Why does the clear daytime sky appear blue to an observer on Earth?",
    options: ["Shorter blue wavelengths of sunlight are scattered more by atmospheric molecules", "Oceans reflect blue color up into the clouds", "The ozone layer is naturally blue", "Space dust absorbs red light"],
    answer: "A) Shorter blue wavelengths of sunlight are scattered more by atmospheric molecules"
  },
  {
    text: "What optical device uses two plane mirrors angled at 45 degrees to view objects above water from inside a submarine?",
    options: ["Periscope", "Kaleidoscope", "Microscope", "Telescope"],
    answer: "A) Periscope"
  },
  {
    text: "What tube-like toy uses multiple inclined mirrors and colored glass beads to create beautiful symmetrical patterns?",
    options: ["Kaleidoscope", "Periscope", "Pinhole camera", "Magnifying glass"],
    answer: "A) Kaleidoscope"
  },
  {
    text: "What medical instrument do doctors use to listen to sounds produced by the human heart and lungs?",
    options: ["Stethoscope", "Sphygmomanometer", "Endoscope", "Otoscope"],
    answer: "A) Stethoscope"
  },
  {
    text: "What optical instrument uses lenses to magnify tiny microscopic cells and bacteria invisible to the naked eye?",
    options: ["Microscope", "Telescope", "Binoculars", "Periscope"],
    answer: "A) Microscope"
  },
  {
    text: "What astronomical instrument is used to observe distant planets, the Moon craters, and distant stars?",
    options: ["Telescope", "Microscope", "Periscope", "Stethoscope"],
    answer: "A) Telescope"
  },

  // Abbreviations & Fundamentals in ICT (Classes 5-8)
  {
    text: "What does PC stand for in computing?",
    options: ["Personal Computer", "Public Computer", "Programmed Calculator", "Pocket Chip"],
    answer: "A) Personal Computer"
  },
  {
    text: "What does OS stand for in computer systems?",
    options: ["Operating System", "Online Software", "Optical Storage", "Output System"],
    answer: "A) Operating System"
  },
  {
    text: "What does GUI stand for in user interfaces?",
    options: ["Graphical User Interface", "General User Internet", "Global Unit Identifier", "Graphic Universal Input"],
    answer: "A) Graphical User Interface"
  },
  {
    text: "What does ICT stand for in the school curriculum?",
    options: ["Information and Communication Technology", "Indian Computer Terminal", "Internet Communication Tool", "Integrated Circuit Transmission"],
    answer: "A) Information and Communication Technology"
  },
  {
    text: "What does KITE stand for in the Kerala education department?",
    options: ["Kerala Infrastructure and Technology for Education", "Kerala Information Technology for Engineering", "Kerala Institute of Technical Education", "Kerala Internet Telecom Enterprise"],
    answer: "A) Kerala Infrastructure and Technology for Education"
  },
  {
    text: "What does CD stand for in optical storage discs?",
    options: ["Compact Disc", "Computer Data", "Core Drive", "Central Disk"],
    answer: "A) Compact Disc"
  },
  {
    text: "What does DVD stand for in optical video discs?",
    options: ["Digital Versatile Disc", "Dynamic Video Drive", "Direct Virtual Data", "Digital Voice Device"],
    answer: "A) Digital Versatile Disc"
  },
  {
    text: "What does USB stand for in computer port connectors?",
    options: ["Universal Serial Bus", "Unified System Base", "Universal Storage Bank", "Unit Serial Board"],
    answer: "A) Universal Serial Bus"
  },
  {
    text: "What does LED stand for in display and lighting technology?",
    options: ["Light Emitting Diode", "Liquid Electronic Display", "Laser Energy Device", "Linear Emission Detector"],
    answer: "A) Light Emitting Diode"
  },
  {
    text: "What does LCD stand for in flat-panel monitors?",
    options: ["Liquid Crystal Display", "Light Cathode Diode", "Linear Crystal Device", "Low Current Drive"],
    answer: "A) Liquid Crystal Display"
  },

  // Keyboard Navigation & Shortcuts (Classes 5-8)
  {
    text: "Which key on the keyboard jumps the text cursor immediately to the beginning of the current line?",
    options: ["Home key", "End key", "Page Up key", "Insert key"],
    answer: "A) Home key"
  },
  {
    text: "Which key moves the text cursor immediately to the end of the current line?",
    options: ["End key", "Home key", "Page Down key", "Tab key"],
    answer: "A) End key"
  },
  {
    text: "Which key combination captures a screenshot of the entire computer screen to the clipboard or Pictures folder?",
    options: ["Print Screen (PrtSc)", "Ctrl + P", "Alt + F4", "Ctrl + S"],
    answer: "A) Print Screen (PrtSc)"
  },
  {
    text: "Which keyboard shortcut closes the currently active application window immediately?",
    options: ["Alt + F4", "Ctrl + S", "Ctrl + Z", "F1"],
    answer: "A) Alt + F4"
  },
  {
    text: "Which function key is universally used to open the Help menu in most applications?",
    options: ["F1", "F2", "F5", "F12"],
    answer: "A) F1"
  },
  {
    text: "Which key on the keyboard reloads or refreshes the active web page in a browser?",
    options: ["F5 (or Ctrl + R)", "F1", "F3", "Esc"],
    answer: "A) F5 (or Ctrl + R)"
  },
  {
    text: "What keyboard shortcut is used to search and Find words inside a document or web page?",
    options: ["Ctrl + F", "Ctrl + S", "Ctrl + P", "Ctrl + N"],
    answer: "A) Ctrl + F"
  },
  {
    text: "What keyboard shortcut opens the Find and Replace dialog in LibreOffice Writer?",
    options: ["Ctrl + H", "Ctrl + F", "Ctrl + R", "Ctrl + G"],
    answer: "A) Ctrl + H"
  },

  // Spreadsheet Formulas & Presentation (LibreOffice Calc & Impress)
  {
    text: "In LibreOffice Calc, which formula correctly adds the values of cells from A1 to A5?",
    options: ["=SUM(A1:A5)", "=ADD(A1:A5)", "=TOTAL(A1:A5)", "=PLUS(A1:A5)"],
    answer: "A) =SUM(A1:A5)"
  },
  {
    text: "In LibreOffice Calc, which formula calculates the mathematical average of cells B1 through B10?",
    options: ["=AVERAGE(B1:B10)", "=MEAN(B1:B10)", "=AVG(B1:B10)", "=DIVIDE(B1:B10)"],
    answer: "A) =AVERAGE(B1:B10)"
  },
  {
    text: "In LibreOffice Calc, which formula finds the largest numeric value in the cell range C1 to C20?",
    options: ["=MAX(C1:C20)", "=HIGHEST(C1:C20)", "=TOP(C1:C20)", "=LARGE(C1:C20)"],
    answer: "A) =MAX(C1:C20)"
  },
  {
    text: "In LibreOffice Calc, which formula finds the smallest numeric value in the cell range D1 to D15?",
    options: ["=MIN(D1:D15)", "=LOWEST(D1:D15)", "=BOTTOM(D1:D15)", "=SMALL(D1:D15)"],
    answer: "A) =MIN(D1:D15)"
  },
  {
    text: "In LibreOffice Calc, what symbol is used as the arithmetic operator for multiplication in formulas?",
    options: ["* (Asterisk)", "x (Letter x)", "# (Hash)", "^ (Caret)"],
    answer: "A) * (Asterisk)"
  },
  {
    text: "In LibreOffice Calc, what symbol is used as the operator for division in formulas?",
    options: ["/ (Forward slash)", "\\ (Backslash)", "÷ (Division symbol)", "% (Percent)"],
    answer: "A) / (Forward slash)"
  },
  {
    text: "In LibreOffice Impress, what is each individual page of a presentation containing text and pictures called?",
    options: ["Slide", "Sheet", "Document", "Canvas"],
    answer: "A) Slide"
  },
  {
    text: "In LibreOffice Impress, what visual effect occurs when transitioning smoothly from one slide to the next?",
    options: ["Slide Transition", "Formula", "Hyperlink", "Sorting"],
    answer: "A) Slide Transition"
  },

  // Scratch Programming Mechanics (Classes 6-8)
  {
    text: "In Scratch, which event block triggers code when the user presses the spacebar on the keyboard?",
    options: ["when [space] key pressed", "when green flag clicked", "when this sprite clicked", "when stage clicked"],
    answer: "A) when [space] key pressed"
  },
  {
    text: "In Scratch, which block makes a sprite display a speech bubble containing text for a specific number of seconds?",
    options: ["say [Hello!] for [2] seconds", "think [Hmm] for [2] seconds", "shout [Hello!]", "broadcast [Hello!]"],
    answer: "A) say [Hello!] for [2] seconds"
  },
  {
    text: "In Scratch, which Control block halts script execution for a specified duration before continuing to the next block?",
    options: ["wait [1] seconds", "stop all", "repeat until", "pause script"],
    answer: "A) wait [1] seconds"
  },
  {
    text: "In Scratch, which block in Looks switches the sprite to its next animation frame in the list?",
    options: ["next costume", "switch backdrop", "change size by 10", "show"],
    answer: "A) next costume"
  },
  {
    text: "In Scratch, which block makes a hidden sprite become visible on the Stage?",
    options: ["show", "hide", "switch costume", "clear graphic effects"],
    answer: "A) show"
  },
  {
    text: "In Scratch, which block makes a visible sprite disappear from the Stage canvas without deleting it?",
    options: ["hide", "show", "delete sprite", "stop script"],
    answer: "A) hide"
  },
  {
    text: "In Scratch, what block resets all pen drawings drawn on the Stage?",
    options: ["erase all", "pen up", "pen down", "set pen color to"],
    answer: "A) erase all"
  },
  {
    text: "In Scratch, which block lowers the pen onto the stage so the sprite leaves a drawing trail as it moves?",
    options: ["pen down", "pen up", "erase all", "set pen size to 1"],
    answer: "A) pen down"
  },
  {
    text: "In Scratch, which block lifts the pen off the stage so moving the sprite leaves no line trail?",
    options: ["pen up", "pen down", "erase all", "hide"],
    answer: "A) pen up"
  },

  // Everyday Internet & Online Resources
  {
    text: "What free, multilingual online encyclopedia is widely accessed for school project research?",
    options: ["Wikipedia", "Google Chrome", "VLC", "LibreOffice"],
    answer: "A) Wikipedia"
  },
  {
    text: "What prefix protocol at the beginning of a web address indicates that data between browser and website is securely encrypted?",
    options: ["https://", "http://", "ftp://", "file://"],
    answer: "A) https://"
  },
  {
    text: "What symbol shown next to the website address in a browser indicates an authentic and encrypted SSL connection?",
    options: ["Padlock (Lock) icon", "Question mark", "Red warning triangle", "Star icon"],
    answer: "A) Padlock (Lock) icon"
  },
  {
    text: "What feature in web browsers allows users to save and quickly revisit their favorite educational websites?",
    options: ["Bookmarks (Favorites)", "History", "Downloads", "Extensions"],
    answer: "A) Bookmarks (Favorites)"
  },
  {
    text: "Why is it important to regularly save work (Ctrl+S) while writing an assignment on a desktop computer?",
    options: ["To avoid losing typed text in case of sudden power cuts or system shutdown", "To make the text look bolder", "To speed up internet connection", "To delete temporary files"],
    answer: "A) To avoid losing typed text in case of sudden power cuts or system shutdown"
  },
  {
    text: "What does clicking the Log Out or Sign Out button after checking email on a school computer ensure?",
    options: ["Prevents unauthorized people from accessing your personal account", "Deletes all received emails", "Turns off the internet connection", "Uninstalls the web browser"],
    answer: "A) Prevents unauthorized people from accessing your personal account"
  }
];

const combined = current.concat(extra73);
console.log('Combined new easy questions count:', combined.length);
const targetPath = path.join(__dirname, 'data', 'new-easy-questions.js');
fs.writeFileSync(targetPath, 'module.exports = ' + JSON.stringify(combined, null, 2) + ';\n');
console.log('Successfully updated scripts/data/new-easy-questions.js!');
