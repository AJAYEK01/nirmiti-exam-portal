// 83 new challenging questions tailored for Kerala State Syllabus Class 8-10 students
// Topics: Physics calculations (Ohm's law, circuits, power, Joule's law, transformers, lenses, motion),
// Computing (Python loop tracing, logic gates, binary numbers), and Mathematics problem solving.

module.exports = [
  // --- Physics Circuit & Ohm's Law Calculations ---
  {
    text: "Two resistors of 6 ohms and 3 ohms are connected in parallel. What is their effective equivalent resistance?",
    options: ["2 ohms", "9 ohms", "18 ohms", "4.5 ohms"],
    answer: "A) 2 ohms",
  },
  {
    text: "Three resistors of 5 ohms, 10 ohms, and 15 ohms are connected in series. What is the total equivalent resistance of the circuit?",
    options: ["30 ohms", "15 ohms", "2.7 ohms", "50 ohms"],
    answer: "A) 30 ohms",
  },
  {
    text: "If three identical resistors of 30 ohms each are connected in parallel, what is the equivalent resistance of the combination?",
    options: ["10 ohms", "90 ohms", "15 ohms", "5 ohms"],
    answer: "A) 10 ohms",
  },
  {
    text: "A potential difference of 24 V is applied across an 8-ohm resistor. What is the electric current flowing through it?",
    options: ["3 A", "192 A", "0.33 A", "16 A"],
    answer: "A) 3 A",
  },
  {
    text: "An electric heater draws a current of 5 A from a 230 V power supply. What is the electrical resistance of the heating element?",
    options: ["46 ohms", "1150 ohms", "225 ohms", "50 ohms"],
    answer: "A) 46 ohms",
  },
  {
    text: "What voltage is required to produce a current of 0.5 A through a lamp of resistance 200 ohms?",
    options: ["100 V", "400 V", "50 V", "200.5 V"],
    answer: "A) 100 V",
  },
  {
    text: "Two identical 10-ohm resistors are first connected in series and then in parallel. What is the ratio of their series resistance to parallel resistance?",
    options: ["4 : 1", "2 : 1", "1 : 4", "1 : 1"],
    answer: "A) 4 : 1",
  },
  {
    text: "A 12 V battery is connected across two resistors of 4 ohms and 2 ohms connected in series. What is the potential difference across the 4-ohm resistor?",
    options: ["8 V", "4 V", "6 V", "12 V"],
    answer: "A) 8 V",
  },
  {
    text: "In a parallel circuit with two branches of 12 ohms each connected to a 12 V supply, what is the current flowing through each individual branch?",
    options: ["1 A", "2 A", "0.5 A", "12 A"],
    answer: "A) 1 A",
  },
  {
    text: "Four 100-ohm resistors are connected in parallel across a 50 V source. What is the total current drawn from the source?",
    options: ["2 A", "0.5 A", "4 A", "0.25 A"],
    answer: "A) 2 A",
  },

  // --- Electrical Power & Joule's Heating Calculations ---
  {
    text: "An electric bulb is rated 100 W, 220 V. What is the electrical current drawn by the bulb when operated at 220 V?",
    options: ["0.45 A", "2.2 A", "22 A", "1.5 A"],
    answer: "A) 0.45 A",
  },
  {
    text: "According to Joule's Law of Heating (H = I^2 * R * t), if the current passing through a fixed resistor is doubled, how many times will the heat generated increase in the same time?",
    options: ["4 times", "2 times", "8 times", "Half"],
    answer: "A) 4 times",
  },
  {
    text: "An electric iron rated 750 W is used for 2 hours daily. What is the electrical energy consumed in kilowatt-hours (kWh) per day?",
    options: ["1.5 kWh", "1500 kWh", "0.375 kWh", "3 kWh"],
    answer: "A) 1.5 kWh",
  },
  {
    text: "A 1000 W electric geyser runs for 3 hours. How many units (kWh) of commercial electricity are consumed?",
    options: ["3 units", "300 units", "3000 units", "0.3 units"],
    answer: "A) 3 units",
  },
  {
    text: "A current of 2 A flows through a resistor of 10 ohms for 5 seconds. What is the total heat energy generated in Joules (H = I^2 * R * t)?",
    options: ["200 J", "100 J", "400 J", "50 J"],
    answer: "A) 200 J",
  },
  {
    text: "An electric appliance rated 2 kW operates on a 200 V circuit. What is the current drawn by this appliance?",
    options: ["10 A", "1 A", "100 A", "4 A"],
    answer: "A) 10 A",
  },
  {
    text: "Which of the following consumes more electrical energy: a 250 W TV set operated for 1 hour or a 1200 W toaster operated for 10 minutes (1/6 hour)?",
    options: ["The 250 W TV set consumes more energy", "The 1200 W toaster consumes more energy", "Both consume exactly the same energy", "Cannot be determined without voltage"],
    answer: "A) The 250 W TV set consumes more energy",
  },
  {
    text: "A fuse wire rated 5 A is connected in a domestic 230 V line. What is the maximum power of an appliance that can safely run without blowing the fuse?",
    options: ["1150 W", "2300 W", "500 W", "46 W"],
    answer: "A) 1150 W",
  },

  // --- Transformer Calculations (SCERT Class 10 Physics) ---
  {
    text: "A step-down transformer has 1000 turns in the primary coil and 100 turns in the secondary coil. If the primary voltage is 220 V, what is the secondary output voltage?",
    options: ["22 V", "2200 V", "110 V", "44 V"],
    answer: "A) 22 V",
  },
  {
    text: "In a transformer, the primary coil has 200 turns and the secondary coil has 800 turns. If the input AC voltage is 12 V, what is the output voltage (Vs = Vp * Ns / Np)?",
    options: ["48 V", "3 V", "24 V", "96 V"],
    answer: "A) 48 V",
  },
  {
    text: "In an ideal step-up transformer, the secondary voltage is 5 times the primary voltage. What will be the secondary current compared to the primary current (assuming 100% efficiency)?",
    options: ["1/5 of the primary current", "5 times the primary current", "Equal to primary current", "25 times the primary current"],
    answer: "A) 1/5 of the primary current",
  },
  {
    text: "A step-up transformer converts 10 V to 200 V. What is the turns ratio (Ns / Np) of this transformer?",
    options: ["20 : 1", "1 : 20", "10 : 1", "2 : 1"],
    answer: "A) 20 : 1",
  },

  // --- Optics & Lens Calculations (SCERT Class 10 Physics) ---
  {
    text: "A convex lens has a focal length of +0.5 meters. What is the optical power of this lens in Dioptres (P = 1 / f)?",
    options: ["+2 D", "+0.5 D", "-2 D", "+5 D"],
    answer: "A) +2 D",
  },
  {
    text: "A doctor prescribes a corrective lens of power -2.5 D for a student. What is the focal length and type of this lens?",
    options: ["-0.4 m, Concave lens", "+0.4 m, Convex lens", "-2.5 m, Concave lens", "+2.5 m, Convex lens"],
    answer: "A) -0.4 m, Concave lens",
  },
  {
    text: "A convex lens has a focal length of +25 cm. What is its power in Dioptres (P = 100 / f_in_cm)?",
    options: ["+4 D", "+0.25 D", "+2.5 D", "+25 D"],
    answer: "A) +4 D",
  },
  {
    text: "An object is placed at 2F (twice the focal length) in front of a convex lens. What is the nature and size of the image formed?",
    options: ["Real, inverted, and same size as object", "Virtual, erect, and magnified", "Real, inverted, and diminished", "Real, inverted, and highly enlarged"],
    answer: "A) Real, inverted, and same size as object",
  },
  {
    text: "If a ray of light traveling from air enters water at an angle, which of the following is true about its speed and direction?",
    options: ["Speed decreases and ray bends towards the normal", "Speed increases and ray bends away from normal", "Speed decreases and ray bends away from normal", "Speed and direction remain unchanged"],
    answer: "A) Speed decreases and ray bends towards the normal",
  },

  // --- Motion, Forces & Wave Calculations (SCERT Class 8-9 Physics) ---
  {
    text: "A car accelerates uniformly from rest to a speed of 20 m/s in 5 seconds. What is the acceleration of the car (a = (v - u) / t)?",
    options: ["4 m/s^2", "100 m/s^2", "0.25 m/s^2", "5 m/s^2"],
    answer: "A) 4 m/s^2",
  },
  {
    text: "A stone dropped freely from the top of a building reaches the ground in 3 seconds. Taking g = 9.8 m/s^2, what is the final velocity of the stone on reaching the ground (v = u + gt)?",
    options: ["29.4 m/s", "9.8 m/s", "14.7 m/s", "44.1 m/s"],
    answer: "A) 29.4 m/s",
  },
  {
    text: "What is the kinetic energy of a body of mass 2 kg moving with a uniform velocity of 4 m/s (KE = 0.5 * m * v^2)?",
    options: ["16 J", "8 J", "32 J", "4 J"],
    answer: "A) 16 J",
  },
  {
    text: "If the speed of a moving car is tripled (3 times), how many times will its kinetic energy increase?",
    options: ["9 times", "3 times", "6 times", "27 times"],
    answer: "A) 9 times",
  },
  {
    text: "A constant force of 20 N moves a box across a smooth floor through a distance of 5 meters in the direction of the force. What is the work done (W = F * s)?",
    options: ["100 J", "4 J", "25 J", "500 J"],
    answer: "A) 100 J",
  },
  {
    text: "A sound wave has a frequency of 500 Hz and travels at a speed of 340 m/s in air. What is the wavelength of the sound wave (lambda = v / f)?",
    options: ["0.68 m", "1.47 m", "170 m", "0.34 m"],
    answer: "A) 0.68 m",
  },
  {
    text: "A student claps near a cliff and hears the echo after 2 seconds. If the speed of sound in air is 340 m/s, what is the distance to the cliff (d = (v * t) / 2)?",
    options: ["340 m", "680 m", "170 m", "1360 m"],
    answer: "A) 340 m",
  },
  {
    text: "A body of mass 5 kg is raised to a vertical height of 4 meters above the ground. Taking g = 10 m/s^2, what is its gravitational potential energy (PE = m * g * h)?",
    options: ["200 J", "20 J", "50 J", "100 J"],
    answer: "A) 200 J",
  },
  {
    text: "A vehicle covers 180 kilometers in 3 hours. What is its speed in standard SI units (m/s)?",
    options: ["16.67 m/s", "60 m/s", "25 m/s", "50 m/s"],
    answer: "A) 16.67 m/s",
  },
  {
    text: "What net unbalanced force is required to impart an acceleration of 2 m/s^2 to a cart of mass 15 kg (F = m * a)?",
    options: ["30 N", "7.5 N", "17 N", "13 N"],
    answer: "A) 30 N",
  },

  // --- Python Programming Output Tracing ---
  {
    text: "What is the output of the following Python code?\\n\\ncount = 0\\nfor i in range(1, 4):\\n    count += i\\nprint(count)",
    options: ["6", "10", "4", "3"],
    answer: "A) 6",
  },
  {
    text: "What will be printed by this Python snippet?\\n\\nx = 10\\ny = 3\\nprint(x % y)",
    options: ["1", "3", "3.33", "0"],
    answer: "A) 1",
  },
  {
    text: "What is the output of the following Python statement?\\n\\nprint(17 // 5)",
    options: ["3", "3.4", "2", "3.0"],
    answer: "A) 3",
  },
  {
    text: "What will the following Python code display on the screen?\\n\\na = 5\\nb = 10\\nif a > 3 and b < 15:\\n    print('MATCH')\\nelse:\\n    print('NO')",
    options: ["MATCH", "NO", "Error", "None"],
    answer: "A) MATCH",
  },
  {
    text: "What is the output of the following Python code?\\n\\nnumbers = [10, 20, 30, 40, 50]\\nprint(numbers[2])",
    options: ["30", "20", "40", "10"],
    answer: "A) 30",
  },
  {
    text: "What is the output of the following Python code?\\n\\ns = 'KERALA'\\nprint(len(s))",
    options: ["6", "5", "7", "Error"],
    answer: "A) 6",
  },
  {
    text: "What will be the final output of this Python code?\\n\\nx = 2\\nwhile x < 8:\\n    x += 3\\nprint(x)",
    options: ["8", "7", "5", "11"],
    answer: "A) 8",
  },
  {
    text: "What is the output of the following Python expression?\\n\\nprint(2 ** 3)",
    options: ["8", "6", "5", "9"],
    answer: "A) 8",
  },
  {
    text: "What is the output of this Python program?\\n\\ntotal = 0\\nfor n in [2, 5, 3]:\\n    total += n\\nprint(total)",
    options: ["10", "30", "5", "15"],
    answer: "A) 10",
  },
  {
    text: "What will be the result of executing this Python code?\\n\\ntext = 'ROBOT'\\nprint(text[0] + text[-1])",
    options: ["RT", "ROBOT", "RO", "R T"],
    answer: "A) RT",
  },
  {
    text: "What is the output of the following code in Python?\\n\\nx = 15\\nif x % 2 == 0:\\n    print('EVEN')\\nelse:\\n    print('ODD')",
    options: ["ODD", "EVEN", "1", "Error"],
    answer: "A) ODD",
  },
  {
    text: "What will be printed by the following Python program?\\n\\nitems = ['LED', 'Buzzer', 'LDR']\\nitems.append('Sensor')\\nprint(len(items))",
    options: ["4", "3", "5", "Error"],
    answer: "A) 4",
  },

  // --- Logic Gates Truth Tables ---
  {
    text: "In digital electronics, what is the output of an AND gate when inputs are A = 1 and B = 0?",
    options: ["0", "1", "Floating", "High impedance"],
    answer: "A) 0",
  },
  {
    text: "What is the output of an OR gate when the inputs are A = 0 and B = 1?",
    options: ["1", "0", "Undefined", "Null"],
    answer: "A) 1",
  },
  {
    text: "What logic gate gives an output of 1 ONLY when both of its inputs are 1?",
    options: ["AND gate", "OR gate", "XOR gate", "NOR gate"],
    answer: "A) AND gate",
  },
  {
    text: "What is the output of a NAND gate when both inputs are 1 (A = 1, B = 1)?",
    options: ["0", "1", "High", "Oscillating"],
    answer: "A) 0",
  },
  {
    text: "What is the output of a NOR gate when both inputs are 0 (A = 0, B = 0)?",
    options: ["1", "0", "Low", "Infinity"],
    answer: "A) 1",
  },
  {
    text: "If a NOT gate has an input of binary 0, what is its output?",
    options: ["1", "0", "-1", "Indeterminate"],
    answer: "A) 1",
  },
  {
    text: "Which logic gate produces an output of 1 when its two inputs are different (e.g. 0 and 1, or 1 and 0), and 0 when they are identical?",
    options: ["XOR gate", "XNOR gate", "AND gate", "OR gate"],
    answer: "A) XOR gate",
  },
  {
    text: "What logic gate is formed by connecting an inverter (NOT gate) directly to the output of an AND gate?",
    options: ["NAND gate", "NOR gate", "XOR gate", "Buffer"],
    answer: "A) NAND gate",
  },

  // --- Binary & Number System Conversions ---
  {
    text: "What is the decimal equivalent of the binary number 1010?",
    options: ["10", "12", "8", "6"],
    answer: "A) 10",
  },
  {
    text: "What is the decimal value of the binary number 1111?",
    options: ["15", "16", "14", "8"],
    answer: "A) 15",
  },
  {
    text: "What is the binary representation of the decimal number 8?",
    options: ["1000", "0111", "1001", "1010"],
    answer: "A) 1000",
  },
  {
    text: "What is the decimal equivalent of the binary number 1100?",
    options: ["12", "14", "6", "10"],
    answer: "A) 12",
  },
  {
    text: "How many bits are in exactly 2 Bytes of computer storage?",
    options: ["16 bits", "8 bits", "32 bits", "64 bits"],
    answer: "A) 16 bits",
  },
  {
    text: "How many Kilobytes (KB) are equivalent to 1 Megabyte (MB) in standard binary computing?",
    options: ["1024 KB", "1000 KB", "512 KB", "2048 KB"],
    answer: "A) 1024 KB",
  },
  {
    text: "What is the binary addition of 1 + 1 in digital arithmetic?",
    options: ["10 (sum 0 with carry 1)", "2", "11", "01"],
    answer: "A) 10 (sum 0 with carry 1)",
  },

  // --- Mathematics Calculations & Word Problems (SCERT Class 8-10) ---
  {
    text: "In a right-angled triangle, the lengths of the two perpendicular sides are 6 cm and 8 cm. What is the length of the hypotenuse according to Pythagoras theorem?",
    options: ["10 cm", "14 cm", "12 cm", "48 cm"],
    answer: "A) 10 cm",
  },
  {
    text: "In a right-angled triangle, the hypotenuse is 13 cm and one side is 5 cm. What is the length of the other side?",
    options: ["12 cm", "8 cm", "18 cm", "11 cm"],
    answer: "A) 12 cm",
  },
  {
    text: "What is the area of a circle with a radius of 7 cm (Take pi = 22/7)?",
    options: ["154 sq cm", "44 sq cm", "88 sq cm", "308 sq cm"],
    answer: "A) 154 sq cm",
  },
  {
    text: "What is the circumference of a circular wheel of diameter 14 cm (Take pi = 22/7)?",
    options: ["44 cm", "88 cm", "154 cm", "28 cm"],
    answer: "A) 44 cm",
  },
  {
    text: "A rectangular classroom has a length of 12 meters and a width of 8 meters. What is the perimeter of the classroom?",
    options: ["40 meters", "96 sq meters", "20 meters", "48 meters"],
    answer: "A) 40 meters",
  },
  {
    text: "A student scores 40 marks out of 50 in an exam. What is the percentage of marks obtained?",
    options: ["80%", "75%", "85%", "90%"],
    answer: "A) 80%",
  },
  {
    text: "An article bought for Rs. 200 is sold for Rs. 250. What is the profit percentage earned?",
    options: ["25%", "20%", "50%", "15%"],
    answer: "A) 25%",
  },
  {
    text: "The three angles of a triangle are in the ratio 1 : 2 : 3. What is the measure of the largest angle?",
    options: ["90 degrees", "60 degrees", "120 degrees", "45 degrees"],
    answer: "A) 90 degrees",
  },
  {
    text: "Two angles are supplementary. If one angle is 75 degrees, what is the measure of the other angle?",
    options: ["105 degrees", "15 degrees", "285 degrees", "90 degrees"],
    answer: "A) 105 degrees",
  },
  {
    text: "Two angles are complementary. If one angle is 35 degrees, what is the measure of the other angle?",
    options: ["55 degrees", "145 degrees", "65 degrees", "45 degrees"],
    answer: "A) 55 degrees",
  },
  {
    text: "If 5x - 7 = 18, what is the value of x?",
    options: ["5", "4", "6", "25"],
    answer: "A) 5",
  },
  {
    text: "What is the average (mean) of the numbers 12, 16, 20, 24, and 28?",
    options: ["20", "18", "22", "24"],
    answer: "A) 20",
  },
  {
    text: "A train travels a distance of 300 km in 5 hours. What is the average speed of the train?",
    options: ["60 km/h", "50 km/h", "75 km/h", "1500 km/h"],
    answer: "A) 60 km/h",
  },
  {
    text: "What is the value of 3^4 (3 raised to the power 4)?",
    options: ["81", "12", "27", "64"],
    answer: "A) 81",
  },
  {
    text: "What is the square root of 625?",
    options: ["25", "15", "35", "20"],
    answer: "A) 25",
  },
  {
    text: "What is the Least Common Multiple (LCM) of 12 and 18?",
    options: ["36", "6", "72", "216"],
    answer: "A) 36",
  },
  {
    text: "What is the Highest Common Factor (HCF) of 24 and 36?",
    options: ["12", "6", "4", "72"],
    answer: "A) 12",
  },
  {
    text: "A man deposits Rs. 1000 in a bank at 5% simple interest per year. What is the total interest earned after 3 years (I = P * N * R / 100)?",
    options: ["Rs. 150", "Rs. 50", "Rs. 300", "Rs. 1150"],
    answer: "A) Rs. 150",
  },
  {
    text: "A rectangular field has a length of 20 meters and a width of 15 meters. What is the total area of the field?",
    options: ["300 sq meters", "70 sq meters", "35 sq meters", "600 sq meters"],
    answer: "A) 300 sq meters",
  },
];
