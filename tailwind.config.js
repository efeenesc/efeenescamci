/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	darkMode: ["selector", '[data-theme="dark"]'],
	theme: {
		extend: {
			screens: {
				xs: "450px",
			},
			colors: {
				"theme-900": "rgb(from var(--theme-900) r g b / <alpha-value>)",
				"theme-600": "rgb(from var(--theme-600) r g b / <alpha-value>)",
				"theme-300": "rgb(from var(--theme-300) r g b / <alpha-value>)",
				foreground: "var(--foreground)",
				accent1: "rgb(from var(--accent1) r g b / <alpha-value>)",
				accent2: "var(--accent2)",
				border1: "var(--border1)",
				contrast: "var(--contrast)",
				inverse: "var(--inverse)",
				highlight: "var(--highlight)",
				"highlight-solid": "var(--highlight-solid)",
				system: "var(--system)",
				"system-900": "var(--system-900)",
				"system-700": "var(--system-700)",
				"system-600": "var(--system-600)",
				"system-300": "var(--system-300)",
				"system-200": "var(--system-200)",
			},
			fontFamily: {
				"inter-tight": "Inter Tight, monospace",
			},
			backgroundImage: {
				noise: "url('assets/noise.png')",
			},
			boxShadow: {
				"sm-alt": "0 0 2px 0 rgb(0 0 0 / 0.05)",
				alt: "0 0 3px 0 rgb(0 0 0 / 0.1), 0 0 2px -1px rgb(0 0 0 / 0.1)",
				"md-alt": "0 0 6px 1px rgb(0 0 0 / 0.1), 0 0 4px 1px rgb(0 0 0 / 0.1)",
				"lg-alt": "0 0 15px 2px rgb(0 0 0 / 0.1), 0 0 6px 2px rgb(0 0 0 / 0.1)",
				"xl-alt":
					"0 0 25px 4px rgb(0 0 0 / 0.1), 0 0 10px 4px rgb(0 0 0 / 0.1)",
				"2xl-alt": "0 0 50px 6px rgb(0 0 0 / 0.25)",
				deep: "0px 22px 70px 4px rgba(0, 0, 0, 0.56)",
				light:
					"rgba(255, 255, 255, 0.3) 0px 1px 1px inset, rgba(0, 0, 0, 0.2) 0px 7px 13px -3px, rgba(0, 0, 0, 0.1) 0px -3px 0px inset",
				"light-inset":
					"rgba(255, 255, 255, 0.3) 0px 1px 1px inset, rgba(0, 0, 0, 0.1) 0px -3px 0px inset",
				"dark-inset": "rgba(0, 0, 0, 0.1) 0px 3px 3px inset",
			},
		},
	},
	plugins: [],
};
