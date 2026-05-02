import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terminal: "#0a0a0f",
        panel: "#12121a",
        card: "#16161f",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        green: "#00ff88",
        muted: "#8b8b9e",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      boxShadow: {
        cyan: "0 0 30px rgba(0, 255, 255, 0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config;
