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
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"], // ต้อง load font Lato ใน Expo ก่อน
      },
      fontSize: {
        // store numeric px values so we can scale them at runtime via a utility
        h1: [48, { lineHeight: 60, fontWeight: "700" }],
        h2: [32, { lineHeight: 40, fontWeight: "700" }],
        h3: [22, { lineHeight: 32, fontWeight: "700" }],
        h4: [18, { lineHeight: 24, fontWeight: "700" }],
        h5: [16, { lineHeight: 22, fontWeight: "700" }],
        h6: [14, { lineHeight: 18, fontWeight: "700" }],

        xxl: [24, { lineHeight: 36 }],
        xl: [20, { lineHeight: 30 }],
        l: [18, { lineHeight: 26 }],
        m: [16, { lineHeight: 24 }],
        s: [14, { lineHeight: 22 }],
        xs: [12, { lineHeight: 18 }],
        xxs: [10, { lineHeight: 16 }],
      },
    },
  },
  plugins: [],
};
