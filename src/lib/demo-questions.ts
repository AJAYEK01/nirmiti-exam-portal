// 25 Bilingual Benchmark Questions for Demo Exam (Hardware, Electronics & Robotics)
export interface DemoQuestion {
  id: number;
  en: {
    question: string;
    options: string[];
    explanation: string;
  };
  ml: {
    question: string;
    options: string[];
    explanation: string;
  };
  correctAnswer: number; // 0-indexed
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: 1,
    en: {
      question: "Which electronic component is primarily used to restrict or oppose the flow of electric current in a circuit?",
      options: ["Resistor", "Capacitor", "Inductor", "Diode"],
      explanation: "A resistor opposes the flow of electric current according to Ohm's Law (V = IR).",
    },
    ml: {
      question: "ഒരു സർക്യൂട്ടിലൂടെയുള്ള വൈദ്യുത പ്രവാഹത്തെ തടസ്സപ്പെടുത്തുന്നതിനോ നിയന്ത്രിക്കുന്നതിനോ ഉപയോഗിക്കുന്ന ഇലക്ട്രോണിക് ഘടകം ഏതാണ്?",
      options: ["റെസിസ്റ്റർ (Resistor)", "കപ്പാസിറ്റർ (Capacitor)", "ഇൻഡക്റ്റർ (Inductor)", "ഡയോഡ് (Diode)"],
      explanation: "ഓം നിയമപ്രകാരം (V = IR) വൈദ്യുത പ്രവാഹത്തെ നിയന്ത്രിക്കാൻ റെസിസ്റ്റർ ഉപയോഗിക്കുന്നു.",
    },
    correctAnswer: 0,
  },
  {
    id: 2,
    en: {
      question: "What is the standard operating logic voltage of an Arduino Uno board's ATmega328P microcontroller?",
      options: ["3.3 V", "5.0 V", "9.0 V", "12.0 V"],
      explanation: "Arduino Uno operates at a logic level of 5V DC.",
    },
    ml: {
      question: "ആർഡുയിനോ യുനോ (Arduino Uno) ബോർഡിന്റെ പ്രധാന മൈക്രോകൺട്രോളർ പ്രവർത്തിക്കുന്ന ലോജിക് വോൾട്ടേജ് എത്രയാണ്?",
      options: ["3.3 V", "5.0 V", "9.0 V", "12.0 V"],
      explanation: "ആർഡുയിനോ യുനോ 5V ഡിസി വോൾട്ടേജിലാണ് പ്രവർത്തിക്കുന്നത്.",
    },
    correctAnswer: 1,
  },
  {
    id: 3,
    en: {
      question: "Which semiconductor device allows electric current to flow in only one forward direction?",
      options: ["Transistor", "Diode", "Transformer", "Potentiometer"],
      explanation: "A PN-junction diode allows current flow in forward bias and blocks current in reverse bias.",
    },
    ml: {
      question: "വൈദ്യുത പ്രവാഹത്തെ ഒരൊറ്റ ദിശയിലേക്ക് മാത്രം കടത്തിവിടുന്ന അർദ്ധചാലക ഉപകരണം (Semiconductor device) ഏതാണ്?",
      options: ["ട്രാൻസിസ്റ്റർ (Transistor)", "ഡയോഡ് (Diode)", "ട്രാൻസ്ഫോർമർ (Transformer)", "പൊട്ടൻഷ്യോമീറ്റർ (Potentiometer)"],
      explanation: "ഡയോഡ് ഫോർവേഡ് ബയാസിൽ മാത്രം വൈദ്യുതി കടത്തിവിടുകയും റിവേഴ്സ് ബയാസിൽ തടയുകയും ചെയ്യുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 4,
    en: {
      question: "Which sensor is commonly utilized for non-contact distance measurement using high-frequency sound waves?",
      options: ["LDR Sensor", "Ultrasonic HC-SR04", "DHT11", "PIR Motion Sensor"],
      explanation: "Ultrasonic sensor HC-SR04 emits 40 kHz sound waves and measures echo time to calculate distance.",
    },
    ml: {
      question: "ഉയർന്ന ആവൃത്തിയിലുള്ള ശബ്ദതരംഗങ്ങൾ ഉപയോഗിച്ച് ദൂരം അളക്കാൻ സാധാരണയായി ഉപയോഗിക്കുന്ന സെൻസർ ഏതാണ്?",
      options: ["എൽ.ഡി.ആർ സെൻസർ (LDR)", "അൾട്രാസോണിക് HC-SR04", "ഡി.എച്ച്.ടി 11 (DHT11)", "പി.ഐ.ആർ മോഷൻ സെൻസർ (PIR)"],
      explanation: "അൾട്രാസോണിക് സെൻസർ 40 kHz ശബ്ദതരംഗങ്ങളുടെ എക്കോ സമയം കണക്കാക്കി ദൂരം നിർണ്ണയിക്കുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 5,
    en: {
      question: "What does the abbreviation 'LED' stand for in electronics?",
      options: ["Light Emitting Diode", "Low Energy Detector", "Laser Emission Device", "Linear Electric Driver"],
      explanation: "LED stands for Light Emitting Diode.",
    },
    ml: {
      question: "ഇലക്ട്രോണിക്സിൽ 'LED' എന്നതിന്റെ പൂർണ്ണരൂപം എന്താണ്?",
      options: ["ലൈറ്റ് എമിറ്റിംഗ് ഡയോഡ് (Light Emitting Diode)", "ലോ എനർജി ഡിറ്റക്ടർ", "ലേസർ എമിഷൻ ഡിവൈസ്", "ലീനിയർ ഇലക്ട്രിക് ഡ്രൈവർ"],
      explanation: "LED എന്നാൽ ലൈറ്റ് എമിറ്റിംഗ് ഡയോഡ് ആണ്.",
    },
    correctAnswer: 0,
  },
  {
    id: 6,
    en: {
      question: "According to Ohm's Law, what is the mathematical formula connecting Voltage (V), Current (I), and Resistance (R)?",
      options: ["V = I / R", "V = I × R", "V = I + R", "V = R / I"],
      explanation: "Ohm's Law states V = I × R.",
    },
    ml: {
      question: "ഓം നിയമപ്രകാരം (Ohm's Law) വോൾട്ടേജ് (V), കറന്റ് (I), പ്രതിരോധം (R) എന്നിവ തമ്മിലുള്ള ഗണിത സമവാക്യം ഏതാണ്?",
      options: ["V = I / R", "V = I × R", "V = I + R", "V = R / I"],
      explanation: "ഓം നിയമപ്രകാരം (Ohm's Law) V = I × R ആണ്.",
    },
    correctAnswer: 1,
  },
  {
    id: 7,
    en: {
      question: "Which sensor is specifically designed to measure ambient temperature and relative humidity?",
      options: ["PIR Sensor", "DHT11 / DHT22", "MQ-2 Sensor", "IR Obstacle Sensor"],
      explanation: "DHT11/DHT22 sensors measure both ambient temperature and relative humidity.",
    },
    ml: {
      question: "അന്തരീക്ഷ താപനിലയും ഈർപ്പവും (Humidity) അളക്കാൻ പ്രത്യേകം രൂപകൽപ്പന ചെയ്ത സെൻസർ ഏതാണ്?",
      options: ["പി.ഐ.ആർ സെൻസർ (PIR)", "ഡി.എച്ച്.ടി 11 / 22 (DHT11/22)", "എം.ക്യു-2 സെൻസർ (MQ-2)", "ഐ.ആർ സെൻസർ (IR Sensor)"],
      explanation: "DHT11 അന്തരീക്ഷ താപനിലയും ആർദ്രതയും കൃത്യമായി അളക്കുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 8,
    en: {
      question: "In digital electronics, what output does an AND gate produce when both of its inputs are logic HIGH (1)?",
      options: ["0 (LOW)", "1 (HIGH)", "High Impedance", "Undefined"],
      explanation: "An AND gate outputs 1 only when all inputs are 1 (1 AND 1 = 1).",
    },
    ml: {
      question: "ഡിജിറ്റൽ ഇലക്ട്രോണിക്സിൽ, രണ്ട് ഇൻപുട്ടുകളും 1 (HIGH) ആകുമ്പോൾ ഒരു AND ഗേറ്റിന്റെ ഔട്ട്പുട്ട് എന്തായിരിക്കും?",
      options: ["0 (LOW)", "1 (HIGH)", "ഹൈ ഇംപെഡൻസ്", "നിർവ്വചിക്കപ്പെട്ടിട്ടില്ല"],
      explanation: "AND ഗേറ്റിൽ രണ്ട് ഇൻപുട്ടുകളും 1 ആകുമ്പോൾ മാത്രമേ ഔട്ട്പുട്ട് 1 ആകുകയുള്ളൂ.",
    },
    correctAnswer: 1,
  },
  {
    id: 9,
    en: {
      question: "Which motor type is best suited for precise angular position control in robotic arms and steering mechanisms?",
      options: ["DC Motor", "Stepper Motor", "Servo Motor", "AC Induction Motor"],
      explanation: "Servo motors use closed-loop feedback for precise angular positioning (typically 0° to 180°).",
    },
    ml: {
      question: "റോബോട്ടിക് കൈകളിലും സ്റ്റിയറിംഗ് സംവിധാനങ്ങളിലും കൃത്യമായ ആംഗിൾ നിയന്ത്രണത്തിന് ഏറ്റവും അനുയോജ്യമായ മോട്ടോർ ഏതാണ്?",
      options: ["സാധാരണ ഡിസി മോട്ടോർ", "സ്റ്റെപ്പർ മോട്ടോർ", "സെർവോ മോട്ടോർ (Servo Motor)", "എസി മോട്ടോർ"],
      explanation: "സെർവോ മോട്ടോറുകൾ ഫീഡ്ബാക്ക് ഉപയോഗിച്ച് കൃത്യമായ കോണുകളിൽ (0° - 180°) തിരിയാൻ സഹായിക്കുന്നു.",
    },
    correctAnswer: 2,
  },
  {
    id: 10,
    en: {
      question: "What is the function of a pull-up resistor connected to a microcontroller digital input pin?",
      options: [
        "To amplify input signal voltage",
        "To ensure a stable HIGH logic state when no input button is pressed",
        "To limit current through an LED",
        "To store electric charge",
      ],
      explanation: "Pull-up resistors prevent floating input pins by holding the voltage at logic HIGH until grounded.",
    },
    ml: {
      question: "മൈക്രോകൺട്രോളറിന്റെ ഇൻപുട്ട് പിന്നിൽ ഒരു പുൾ-അപ്പ് (Pull-up) റെസിസ്റ്റർ ഘടിപ്പിക്കുന്നതിന്റെ പ്രധാന ധർമ്മം എന്താണ്?",
      options: [
        "സിഗ്നൽ വർദ്ധിപ്പിക്കാൻ",
        "ബട്ടൺ അമർത്താത്തപ്പോൾ പിൻ സ്ഥിരമായി HIGH (1) അവസ്ഥയിൽ നിലനിർത്താൻ",
        "എൽ.ഇ.ഡിയിലെ കറന്റ് കുറയ്ക്കാൻ",
        "ചാർജ്ജ് സംഭരിക്കാൻ",
      ],
      explanation: "ഫ്ലോട്ടിംഗ് പിൻ അവസ്ഥ ഒഴിവാക്കി സ്ഥിരമായ HIGH ലോജിക് നൽകാനാണ് പുൾ-അപ്പ് റെസിസ്റ്റർ ഉപയോഗിക്കുന്നത്.",
    },
    correctAnswer: 1,
  },
  {
    id: 11,
    en: {
      question: "Which wireless communication protocol is built directly into the ESP32 microcontroller module?",
      options: ["Wi-Fi and Bluetooth", "Zigbee only", "NFC only", "Infrared only"],
      explanation: "The ESP32 SoC features integrated 2.4 GHz Wi-Fi (802.11 b/g/n) and dual-mode Bluetooth.",
    },
    ml: {
      question: "ഇ.എസ്.പി32 (ESP32) മൈക്രോകൺട്രോളറിൽ ഇൻബിൽറ്റായി അടങ്ങിയിരിക്കുന്ന വയർലെസ്സ് സാങ്കേതികവിദ്യകൾ ഏവ?",
      options: ["വൈഫൈയും ബ്ലൂടൂത്തും (Wi-Fi & Bluetooth)", "സിഗ്ബീ മാത്രം", "എൻ.എഫ്.സി മാത്രം", "ഇൻഫ്രാറെഡ് മാത്രം"],
      explanation: "ESP32-ൽ വൈഫൈയും ഡ്യുവൽ മോഡ് ബ്ലൂടൂത്തും ഉൾപ്പെടുത്തിയിട്ടുണ്ട്.",
    },
    correctAnswer: 0,
  },
  {
    id: 12,
    en: {
      question: "What type of electrical signal does a Pulse Width Modulation (PWM) pin generate?",
      options: [
        "True analog continuous voltage",
        "Digital square wave with variable duty cycle to simulate analog levels",
        "Pure sinusoidal alternating current",
        "Random noise signal",
      ],
      explanation: "PWM generates digital square waves with varying duty cycles to simulate variable voltage.",
    },
    ml: {
      question: "പൾസ് വിഡ്ത് മോഡുലേഷൻ (PWM) പിൻ ഉത്പാദിപ്പിക്കുന്ന വൈദ്യുത സിഗ്നൽ എങ്ങനെയുള്ളതാണ്?",
      options: [
        "തുടർച്ചയായ അനലോഗ് വോൾട്ടേജ്",
        "ഡ്യൂട്ടി സൈക്കിൾ മാറ്റി അനലോഗ് അനുഭവം നൽകുന്ന ഡിജിറ്റൽ സ്ക്വയർ വേവ്",
        "സൈൻ വേവ് എ.സി കറന്റ്",
        "റാൻഡം നോയ്സ് സിഗ്നൽ",
      ],
      explanation: "PWM സ്ക്വയർ തരംഗങ്ങളുടെ ഓൺ/ഓഫ് സമയം (Duty Cycle) വ്യത്യാസപ്പെടുത്തി വേഗതയും തെളിച്ചവും നിയന്ത്രിക്കുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 13,
    en: {
      question: "Which electronic component stores electrical energy in an electrostatic field between conductive plates?",
      options: ["Inductor", "Resistor", "Capacitor", "Thermistor"],
      explanation: "Capacitors store electrical potential energy across dielectric plates in an electric field.",
    },
    ml: {
      question: "വൈദ്യുതോർജ്ജത്തെ രണ്ട് പ്ലേറ്റുകൾക്കിടയിലെ ഇലക്ട്രോസ്റ്റാറ്റിക് ഫീൽഡിൽ സംഭരിച്ചു വെക്കുന്ന ഘടകം ഏതാണ്?",
      options: ["ഇൻഡക്റ്റർ", "റെസിസ്റ്റർ", "കപ്പാസിറ്റർ (Capacitor)", "തെർമിസ്റ്റർ"],
      explanation: "കപ്പാസിറ്ററുകൾ ഇലക്ട്രോസ്റ്റാറ്റിക് ചാർജ്ജ് സംഭരിക്കുന്നു.",
    },
    correctAnswer: 2,
  },
  {
    id: 14,
    en: {
      question: "In a circuit with a 12V battery and a 4 Ohm resistor, what is the current flowing according to Ohm's Law?",
      options: ["3 Amperes", "48 Amperes", "8 Amperes", "0.33 Amperes"],
      explanation: "I = V / R = 12 / 4 = 3 Amperes.",
    },
    ml: {
      question: "12V ബാറ്ററിയും 4 Ohm റെസിസ്റ്ററും ഉള്ള ഒരു സർക്യൂട്ടിലൂടെ ഒഴുകുന്ന കറന്റ് എത്രയായിരിക്കും?",
      options: ["3 ആമ്പിയർ (Amperes)", "48 ആമ്പിയർ", "8 ആമ്പിയർ", "0.33 ആമ്പിയർ"],
      explanation: "I = V / R = 12 / 4 = 3 ആമ്പിയർ.",
    },
    correctAnswer: 0,
  },
  {
    id: 15,
    en: {
      question: "Which communication bus uses only two signal wires called SDA (Data) and SCL (Clock)?",
      options: ["SPI", "I2C (Inter-Integrated Circuit)", "UART", "USB"],
      explanation: "I2C uses two bidirectional lines: Serial Data (SDA) and Serial Clock (SCL).",
    },
    ml: {
      question: "എസ്.ഡി.എ (SDA), എസ്.സി.എൽ (SCL) എന്നീ രണ്ട് വയറുകൾ മാത്രം ആശയവിനിമയത്തിനായി ഉപയോഗിക്കുന്ന പ്രോട്ടോക്കോൾ ഏതാണ്?",
      options: ["എസ്.പി.ഐ (SPI)", "ഐ.ടു.സി (I2C)", "യു.എ.ആർ.ടി (UART)", "യു.എസ്.ബി (USB)"],
      explanation: "I2C പ്രോട്ടോക്കോൾ ഡാറ്റാ (SDA), ക്ലോക്ക് (SCL) എന്നീ 2 വയറുകൾ ഉപയോഗിക്കുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 16,
    en: {
      question: "What is the primary function of an H-Bridge integrated circuit (like L293D or L298N)?",
      options: [
        "To measure battery temperature",
        "To drive and reverse the rotational direction of DC motors",
        "To amplify radio frequencies",
        "To convert DC voltage to AC mains",
      ],
      explanation: "An H-Bridge circuit enables voltage polarity reversal to spin DC motors forward or backward.",
    },
    ml: {
      question: "ഒരു എച്ച്-ബ്രിഡ്ജ് (L293D / L298N) ഐ.സിയുടെ പ്രധാന ധർമ്മം എന്താണ്?",
      options: [
        "ബാറ്ററിയുടെ ചൂട് അളക്കാൻ",
        "ഡിസി മോട്ടോറുകളെ നിയന്ത്രിക്കാനും അവയുടെ കറങ്ങുന്ന ദിശ മാറ്റാനും",
        "റേഡിയോ തരംഗങ്ങൾ വർദ്ധിപ്പിക്കാൻ",
        "ഡി.സി കറന്റിനെ എ.സി ആക്കാൻ",
      ],
      explanation: "മോട്ടോർ ഡ്രൈവർ ഐസികൾ മോട്ടോറുകൾക്ക് ആവശ്യമായ കറന്റ് നൽകാനും ദിശ നിയന്ത്രിക്കാനും സഹായിക്കുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 17,
    en: {
      question: "Which sensor detects human presence by measuring changes in infrared thermal radiation emitted by warm bodies?",
      options: ["PIR (Passive Infrared) Sensor", "LDR Sensor", "Hall Effect Sensor", "Gyroscope Sensor"],
      explanation: "PIR sensors detect infrared radiation emitted by warm moving objects such as humans.",
    },
    ml: {
      question: "മനുഷ്യ ശരീരത്തിൽ നിന്നുള്ള ഇൻഫ്രാറെഡ് താപ വികിരണങ്ങൾ തിരിച്ചറിഞ്ഞ് ചലനം കണ്ടെത്തുന്ന സെൻസർ ഏതാണ്?",
      options: ["പി.ഐ.ആർ സെൻസർ (PIR Sensor)", "എൽ.ഡി.ആർ (LDR)", "ഹാൾ ഇഫക്റ്റ് സെൻസർ", "ഗൈറോസ്കോപ്പ് സെൻസർ"],
      explanation: "PIR സെൻസർ ചലിക്കുന്ന ശരീരങ്ങളിൽ നിന്നുള്ള ഇൻഫ്രാറെഡ് വികിരണങ്ങൾ തിരിച്ചറിയുന്നു.",
    },
    correctAnswer: 0,
  },
  {
    id: 18,
    en: {
      question: "What is the basic unit of electrical capacitance?",
      options: ["Henry", "Farad", "Ohm", "Watt"],
      explanation: "The standard SI unit of capacitance is the Farad (F), commonly used in microfarads (uF).",
    },
    ml: {
      question: "വൈദ്യുത കപ്പാസിറ്റൻസിന്റെ (Capacitance) അടിസ്ഥാന യൂണിറ്റ് ഏതാണ്?",
      options: ["ഹെൻട്രി (Henry)", "ഫാരഡ് (Farad)", "ഓം (Ohm)", "വാട്ട് (Watt)"],
      explanation: "കപ്പാസിറ്റൻസിന്റെ യൂണിറ്റ് ഫാരഡ് (Farad) ആണ്.",
    },
    correctAnswer: 1,
  },
  {
    id: 19,
    en: {
      question: "Which device is used to step up or step down alternating current (AC) voltages using electromagnetic induction?",
      options: ["Transformer", "Rectifier", "Inverter", "Oscillator"],
      explanation: "Transformers transfer AC electrical energy between circuits through mutual induction.",
    },
    ml: {
      question: "വൈദ്യുതകാന്തിക പ്രേരണ വഴി എ.സി വോൾട്ടേജ് കൂട്ടുവാനോ കുറയ്ക്കുവാനോ ഉപയോഗിക്കുന്ന ഉപകരണം ഏതാണ്?",
      options: ["ട്രാൻസ്ഫോർമർ (Transformer)", "റെക്റ്റിഫയർ (Rectifier)", "ഇൻവെർട്ടർ", "ഓസിലേറ്റർ"],
      explanation: "മ്യൂച്വൽ ഇൻഡക്ഷൻ വഴി എ.സി വോൾട്ടേജ് കൂട്ടാനും കുറയ്ക്കാനും ട്രാൻസ്ഫോർമർ ഉപയോഗിക്കുന്നു.",
    },
    correctAnswer: 0,
  },
  {
    id: 20,
    en: {
      question: "What is the resistance of an ideal ammeter connected in series to measure electrical current?",
      options: ["Zero Ohms", "Infinite Ohms", "1000 Ohms", "1 Megohm"],
      explanation: "An ideal ammeter has zero internal resistance so it does not alter circuit current.",
    },
    ml: {
      question: "കറന്റ് അളക്കുന്നതിനായി സർക്യൂട്ടിൽ ശ്രേണിരീതിയിൽ ഘടിപ്പിക്കുന്ന ഒരു ആദർശ അമ്മീറ്ററിന്റെ (Ideal Ammeter) പ്രതിരോധം എത്രയായിരിക്കണം?",
      options: ["പൂജ്യം (Zero Ohms)", "അനന്തം (Infinite)", "1000 Ohms", "1 Megohm"],
      explanation: "സർക്യൂട്ടിലെ യഥാർത്ഥ കറന്റിന് മാറ്റം വരാതിരിക്കാൻ ആദർശ അമ്മീറ്ററിന്റെ പ്രതിരോധം പൂജ്യമായിരിക്കണം.",
    },
    correctAnswer: 0,
  },
  {
    id: 21,
    en: {
      question: "Which sensor's electrical resistance decreases significantly when ambient light intensity increases?",
      options: ["Thermistor", "LDR (Light Dependent Resistor)", "Strain Gauge", "Thermocouple"],
      explanation: "An LDR (photoresistor) decreases its resistance as incident light intensity increases.",
    },
    ml: {
      question: "വെളിച്ചത്തിന്റെ തീവ്രത കൂടുമ്പോൾ പ്രതിരോധം ഗണ്യമായി കുറയുന്ന സെൻസർ ഏതാണ്?",
      options: ["തെർമിസ്റ്റർ", "എൽ.ഡി.ആർ (Light Dependent Resistor)", "സ്ട്രെയിൻ ഗേജ്", "തെർമോകപ്പിൾ"],
      explanation: "LDR-ൽ പ്രകാശം പതിക്കുമ്പോൾ അതിന്റെ ഇലക്ട്രിക്കൽ പ്രതിരോധം കുറയുന്നു.",
    },
    correctAnswer: 1,
  },
  {
    id: 22,
    en: {
      question: "What is the primary function of a capacitor placed in parallel across a power supply rail (decoupling capacitor)?",
      options: [
        "To filter high-frequency noise and stabilize supply voltage",
        "To boost supply voltage to double its value",
        "To invert the polarity of current",
        "To emit indicator light",
      ],
      explanation: "Decoupling/bypass capacitors filter AC ripple and stabilize DC voltage rails.",
    },
    ml: {
      question: "പവർ സപ്ലൈ ലൈനിൽ സമാന്തരമായി ഒരു കപ്പാസിറ്റർ ഘടിപ്പിക്കുന്നതിന്റെ (Decoupling) പ്രധാന ഉപയോഗം എന്താണ്?",
      options: [
        "വോൾട്ടേജ് ഫ്ലക്ചുവേഷൻ തടഞ്ഞ് വോൾട്ടേജ് സുസ്ഥിരമാക്കാൻ (Filter noise)",
        "വോൾട്ടേജ് ഇരട്ടിയാക്കാൻ",
        "കറന്റിന്റെ ദിശ തിരിക്കാൻ",
        "വെളിച്ചം നൽകാൻ",
      ],
      explanation: "നോയ്സ് ഫിൽട്ടർ ചെയ്യാനും സ്ഥിരതയുള്ള വോൾട്ടേജ് നൽകാനും ഡീകപ്ലിംഗ് കപ്പാസിറ്റർ സഹായിക്കുന്നു.",
    },
    correctAnswer: 0,
  },
  {
    id: 23,
    en: {
      question: "In robotics, what is the term for the maximum weight a robotic arm can safely lift at full reach?",
      options: ["Payload", "Tare Weight", "Torque Limit", "Deadband"],
      explanation: "Payload is the maximum carrying capacity of a robotic manipulator.",
    },
    ml: {
      question: "റോബോട്ടിക്സിൽ, ഒരു റോബോട്ടിക് കൈക്ക് സുരക്ഷിതമായി ഉയർത്താൻ കഴിയുന്ന പരമാവധി ഭാരത്തെ എന്ത് വിളിക്കുന്നു?",
      options: ["പേലോഡ് (Payload)", "ടെയർ വെയ്റ്റ്", "ടോർക്ക് ലിമിറ്റ്", "ഡെഡ്ബാൻഡ്"],
      explanation: "ഒരു റോബോട്ടിന് വഹിക്കാൻ സാധിക്കുന്ന പരമാവധി ഭാരമാണ് പേലോഡ്.",
    },
    correctAnswer: 0,
  },
  {
    id: 24,
    en: {
      question: "Which component protects sensitive electronic circuits from sudden high-voltage spikes and surges?",
      options: ["Zener Diode / TVS Diode", "Electrolytic Capacitor", "Inductor", "Relay"],
      explanation: "Zener and Transient Voltage Suppression (TVS) diodes clamp destructive voltage spikes.",
    },
    ml: {
      question: "പെട്ടെന്നുണ്ടാകുന്ന ഉയർന്ന വോൾട്ടേജ് വ്യതിയാനങ്ങളിൽ നിന്ന് (Spikes) ഇലക്ട്രോണിക് സർക്യൂട്ടുകളെ സംരക്ഷിക്കുന്ന ഘടകം ഏതാണ്?",
      options: ["സെനർ ഡയോഡ് / ടി.വി.എസ് ഡയോഡ് (Zener/TVS Diode)", "ഇലക്ട്രോലൈറ്റിക് കപ്പാസിറ്റർ", "ഇൻഡക്റ്റർ", "റിലേ"],
      explanation: "സെനർ ഡയോഡ് നിശ്ചിത വോൾട്ടേജിൽ ക്ലാംപ് ചെയ്ത് ഉപകരണങ്ങളെ അമിത വോൾട്ടേജിൽ നിന്ന് സംരക്ഷിക്കുന്നു.",
    },
    correctAnswer: 0,
  },
  {
    id: 25,
    en: {
      question: "What is the function of a relay module when controlled by a 5V microcontroller pin?",
      options: [
        "To allow a low-power digital signal to safely switch high-power AC or DC loads",
        "To measure current flow digitally",
        "To generate audio sound waves",
        "To convert solar energy into electricity",
      ],
      explanation: "Relays use electromagnetic coils to provide isolated switching of heavy electrical loads.",
    },
    ml: {
      question: "ഒരു 5V മൈക്രോകൺട്രോളർ പിൻ ഉപയോഗിച്ച് ഉയർന്ന വോൾട്ടേജിലുള്ള ഉപകരണങ്ങളെ പ്രവർത്തിപ്പിക്കാൻ സഹായിക്കുന്ന ഘടകം ഏതാണ്?",
      options: [
        "റിലേ മൊഡ്യൂൾ (Relay Module)",
        "അമ്മീറ്റർ",
        "ബസർ",
        "സോളാർ സെൽ",
      ],
      explanation: "കുറഞ്ഞ വോൾട്ടേജ് ഉപയോഗിച്ച് ഉയർന്ന കറന്റും വോൾട്ടേജും ഉള്ള ഉപകരണങ്ങളെ സുരക്ഷിതമായി ഓൺ/ഓഫ് ചെയ്യാൻ റിലേ ഉപയോഗിക്കുന്നു.",
    },
    correctAnswer: 0,
  },
];
