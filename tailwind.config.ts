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
        sans: ["'Manjari'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        baloo: ["'Baloo Chettan 2'", "sans-serif"],
        manjari: ["'Manjari'", "sans-serif"],
        title: ["'Baloo Chettan 2'", "sans-serif"],
        malayalam: ["'Manjari'", "'Baloo Chettan 2'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
