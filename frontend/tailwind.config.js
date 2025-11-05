/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1fe",
          100: "#cce3fd",
          200: "#99c7fb",
          300: "#d4d4d8",
          400: "#338ef7",
          500: "#006FEE",
          600: "#005bc4",
          700: "#004493",
          800: "#002e62",
          900: "#001731",
        },
        default: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
        secondary: "#7828c8",
        success: "#17c964",
        warning: "#f5a524",
        danger: "#f31260",
        // Tab Bar Selection Color
        tabbar: "#0088FF",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"], // ต้อง load font Lato ใน Expo ก่อน
      },
      borderRadius: {
        button: "0.75rem", // 12px for buttons
      },
      height: {
        "screen-15": "15vh", // หรือใช้ plugin ก็ได้
      },
      fontSize: {
        // header
        "display-1": ["3rem", { lineHeight: "3.75rem", fontWeight: "700" }], // 48/60
        "display-2": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }], // 32/40
        "heading-3": ["1.375rem", { lineHeight: "2rem", fontWeight: "700" }], // 22/32
        "heading-4": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "700" }], // 18/24
        "heading-5": ["1rem", { lineHeight: "1.375rem", fontWeight: "700" }], // 16/22
        "heading-6": [
          "0.875rem",
          { lineHeight: "1.125rem", fontWeight: "700" },
        ], // 14/18

        // body
        "body-xxl": ["1.5rem", { lineHeight: "2.25rem" }], // 24/36
        "body-xl": ["1.25rem", { lineHeight: "1.875rem" }], // 20/30
        "body-l": ["1.125rem", { lineHeight: "1.625rem" }], // 18/26
        "body-m": ["1rem", { lineHeight: "1.5rem" }], // 16/24
        "body-s": ["0.875rem", { lineHeight: "1.375rem" }], // 14/22
        "body-xs": ["0.75rem", { lineHeight: "1.125rem" }], // 12/18
        "body-xxs": ["0.625rem", { lineHeight: "1rem" }], // 10/16

        // fluid
        "display-1-fluid": [
          "clamp(2rem, 1.2rem + 2.5vw, 3rem)",
          { lineHeight: "1.2", fontWeight: "700" },
        ],
        "display-2-fluid": [
          "clamp(1.5rem, 1.0rem + 2vw, 2rem)",
          { lineHeight: "1.25", fontWeight: "700" },
        ],
      },
    },
  },
  plugins: [],
};
