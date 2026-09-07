import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["'Baloo Chettan 2'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        malayalam: ["'Baloo Chettan 2'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
