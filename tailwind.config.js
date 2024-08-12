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
        "accent2": "var(--accent2",
        "border1": "var(--border1)",
        "contrast": "var(--contrast)",
        "inverse": "var(--inverse)",
        "highlight": "var(--highlight)",
        "system": "var(--system)"
      },
      fontFamily: {
        "fantasque": "Fantasque Sans Mono, monospace",
        "inter": "Inter, monospace",
      },
      backgroundImage: {
        "noise": "url('assets/noise.png')"
      },
      boxShadow: {
        "sm-alt": "0 0 2px 0 rgb(0 0 0 / 0.05)",
        "alt": "0 0 3px 0 rgb(0 0 0 / 0.1), 0 0 2px -1px rgb(0 0 0 / 0.1)",
        "md-alt": "0 0 6px 1px rgb(0 0 0 / 0.1), 0 0 4px 1px rgb(0 0 0 / 0.1)",
        "lg-alt": "0 0 15px 2px rgb(0 0 0 / 0.1), 0 0 6px 2px rgb(0 0 0 / 0.1)",
        "xl-alt": "0 0 25px 4px rgb(0 0 0 / 0.1), 0 0 10px 4px rgb(0 0 0 / 0.1)",
        "2xl-alt": "0 0 50px 6px rgb(0 0 0 / 0.25)"
      }
    },
  },
  plugins: [],
}

