import React from "react";

// Microcontroller / Chip Graphic with circuit pins and pulsing core
export function MicrochipGraphic({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circuit board traces */}
      <path
        d="M10 25H30M10 50H30M10 75H30M90 25H70M90 50H70M90 75H70M25 10V30M50 10V30M75 10V30M25 90V70M50 90V70M75 90V70"
        stroke="#38BDF8"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Solder connection pads */}
      <circle cx="10" cy="25" r="3" fill="#38BDF8" />
      <circle cx="10" cy="50" r="3" fill="#38BDF8" />
      <circle cx="10" cy="75" r="3" fill="#38BDF8" />
      <circle cx="90" cy="25" r="3" fill="#38BDF8" />
      <circle cx="90" cy="50" r="3" fill="#38BDF8" />
      <circle cx="90" cy="75" r="3" fill="#38BDF8" />
      <circle cx="25" cy="10" r="3" fill="#38BDF8" />
      <circle cx="50" cy="10" r="3" fill="#38BDF8" />
      <circle cx="75" cy="10" r="3" fill="#38BDF8" />
      <circle cx="25" cy="90" r="3" fill="#38BDF8" />
      <circle cx="50" cy="90" r="3" fill="#38BDF8" />
      <circle cx="75" cy="90" r="3" fill="#38BDF8" />

      {/* Main Chip Body */}
      <rect
        x="30"
        y="30"
        width="40"
        height="40"
        rx="8"
        fill="#0F172A"
        stroke="#60A5FA"
        strokeWidth="2"
      />
      {/* Internal Silicon Core */}
      <rect
        x="38"
        y="38"
        width="24"
        height="24"
        rx="4"
        fill="#1E3A8A"
        stroke="#38BDF8"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="50" r="5" fill="#38BDF8" className="animate-pulse" />
      {/* Corner notch */}
      <circle cx="36" cy="36" r="2" fill="#93C5FD" />
    </svg>
  );
}

// Background PCB Circuit Board Lines SVG
export function CircuitBoardBg({ className = "absolute inset-0 w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <g stroke="#38BDF8" strokeWidth="1.5" opacity="0.15">
        <path d="M0 50 H200 L250 100 H450 L500 150 H800" />
        <path d="M0 200 H150 L200 250 H550 L600 300 H800" />
        <path d="M100 0 V120 L150 170 V400" />
        <path d="M400 0 V80 L450 130 V280 L500 330 V400" />
        <path d="M700 0 V150 L650 200 V400" />
      </g>
      <g fill="#38BDF8" opacity="0.25">
        <circle cx="200" cy="50" r="4" />
        <circle cx="250" cy="100" r="4" />
        <circle cx="450" cy="100" r="4" />
        <circle cx="500" cy="150" r="4" />
        <circle cx="150" cy="200" r="4" />
        <circle cx="200" cy="250" r="4" />
        <circle cx="550" cy="250" r="4" />
        <circle cx="600" cy="300" r="4" />
        <circle cx="100" cy="120" r="4" />
        <circle cx="150" cy="170" r="4" />
        <circle cx="450" cy="130" r="4" />
        <circle cx="500" cy="330" r="4" />
        <circle cx="700" cy="150" r="4" />
        <circle cx="650" cy="200" r="4" />
      </g>
    </svg>
  );
}

// Hardware Hackathon Sensor & IoT Node SVG Icon
export function HardwareSensorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M7 7l-1.5-1.5M17 17l1.5 1.5M17 7l1.5-1.5M7 17l-1.5 1.5" />
    </svg>
  );
}

// Robotics & Hardware Hackathon Gear Icon
export function HardwareRoboticsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4M12 20v-4M8 12H4M20 12h-4" />
      <rect x="8" y="8" width="8" height="8" rx="2" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

// Official Hackathon Trophy SVG Icon
export function TrophyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M4 5h16v4a7 7 0 0 1-7 7 7 7 0 0 1-7-7V5z" />
      <path d="M12 16v4" />
      <path d="M8 20h8" />
    </svg>
  );
}

// Target / Stage Icon
export function TargetIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// Stage Step Badge Icon (1, 2, 3)
export function StageStepIcon({ step, className = "w-7 h-7" }: { step: 1 | 2 | 3; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="15" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="currentColor"
        fontSize="15"
        fontWeight="900"
        fontFamily="sans-serif"
      >
        {step}
      </text>
    </svg>
  );
}

// Pin / Location Point SVG Icon
export function PinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
