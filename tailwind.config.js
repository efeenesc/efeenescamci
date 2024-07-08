/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}",],
  theme: {
    extend: {
      colors: {
        "darkest": "var(--darkest)",
        "darker": "var(--darker)",
        "dark": "var(--dark)",
        "foreground": "var(--foreground)",
        "accent1": "var(--accent1)",
        "border1": "var(--border1)",
        "contrast": "var(--contrast)"
      },
      fontFamily: {
        "fantasque": "Fantasque Sans Mono, monospace"
      }
    },
  },
  plugins: [],
}

