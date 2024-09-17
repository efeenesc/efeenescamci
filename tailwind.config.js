/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./src/**/*.{html,ts}",],
  theme: {
    extend: {
      colors: {
        "theme-900": "var(--theme-900)",
        "theme-600": "var(--theme-600)",
        "theme-300": "var(--theme-300)",
        "foreground": "var(--foreground)",
        "accent1": "var(--accent1)",
        "accent2": "var(--accent2",
        "border1": "var(--border1)",
        "contrast": "var(--contrast)",
        "inverse": "var(--inverse)",
        "highlight": "var(--highlight)",
        "system": "var(--system)",
        "system-900": "var(--system-900)",
        "system-700": "var(--system-700)",
        "system-600": "var(--system-600)",
        "system-300": "var(--system-300)",
        "system-200": "var(--system-200)"
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
        "2xl-alt": "0 0 50px 6px rgb(0 0 0 / 0.25)",
        "deep": "0px 22px 70px 4px rgba(0, 0, 0, 0.56)"
      }
    },
  },
  plugins: [],
}

