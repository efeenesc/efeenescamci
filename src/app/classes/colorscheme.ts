export type ThemeType = 'dark' | 'light';

export interface ThemeColors {
	theme900?: string;
	theme600?: string;
	theme300?: string;

	text?: string;
	accent1?: string;
	accent2?: string;

	contrast?: string;
	inverse?: string;
	highlight?: string;

	border1?: string;
	system?: string;

	[key: string]: unknown;
}

export class ColorScheme implements ThemeColors {
	name!: string;
	theme: ThemeType;

	theme900: string;
	theme600: string;
	theme300: string;

	text: string;
	accent1: string;
	accent2: string;

	contrast: string;
	inverse: string;
	highlight: string;
	highlight_solid: string;

	border1: string;
	system: string;

	[key: string]: unknown;

	// Constructor configures fallbacks and essential colors based on light/dark theme
	constructor(theme: ThemeType) {
		this.theme = theme;
		const isDark = theme === 'dark';

		this.theme300 = isDark ? '#1e1e1e' : '#ffffff';
		this.theme600 = this.theme300;
		this.theme900 = isDark ? '#252526' : '#f3f3f3';

		this.text = isDark ? '#e1e4e8' : '#1f2328';
		this.accent1 = '#4fc1ff';
		this.accent2 = '#ce9178';

		this.contrast = isDark ? '#fff' : '#000';
		this.inverse = isDark ? '#000' : '#fff';
		this.highlight = '';
		this.highlight_solid = '';

		this.border1 = isDark ? '#30363d' : '#d3d3d3';
		this.system = isDark ? '#0d0d0d' : '#1c1c1e';
	}

	/**
	 * Extracts R, G, B, A values from HEX string
	 * @param color HEX color string (full form - 6 characters not including # if non-transparent, 8 if transparent)
	 */
	private extractRGBAFromHEX(
		color: string,
	): { R: number; G: number; B: number; A?: number } | null {
		if (color.startsWith('#')) {
			color = color.substring(1);
		}

		if (color.length < 6) return null;

		const R = parseInt(color.substring(0, 2), 16);
		const G = parseInt(color.substring(2, 4), 16);
		const B = parseInt(color.substring(4, 6), 16);
		let A;

		if (color.length === 8) A = parseInt(color.substring(6, 8), 16);

		return { R, G, B, A };
	}

	/**
	 * Shamelessly taken from stackoverflow
	 * @param color HEX color to brighten/darken
	 * @param percent Percent to brighten color by. Brighten if positive, darken if negative
	 * @returns
	 */
	private lightenColorHEX(color: string, percent: number) {
		let { R, G, B } = this.extractRGBAFromHEX(color)!;

		R *= (100 + percent) / 100;
		G *= (100 + percent) / 100;
		B *= (100 + percent) / 100;

		// clamp for max brightness
		R = R < 255 ? R : 255;
		G = G < 255 ? G : 255;
		B = B < 255 ? B : 255;

		R = Math.round(R);
		G = Math.round(G);
		B = Math.round(B);

		const RR =
			R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
		const GG =
			G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
		const BB =
			B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

		return '#' + RR + GG + BB;
	}

	/**
	 * Renders alpha of transparentHEX onto backgroundHEX, returning a solid color from a combination of the two colors
	 * @param transparentHEX Transparent, full HEX string to overlay on top of backgroundHEX
	 * @param backgroundHEX Non-transparent, full HEX string acting as a background color
	 * @returns string - Solid color created from combination of the two colors
	 */
	private renderAlpha(
		transparentHEX: string,
		backgroundHEX: string,
	): string | null {
		const { R: R1, G: G1, B: B1 } = this.extractRGBAFromHEX(backgroundHEX)!;
		const {
			R: R2,
			G: G2,
			B: B2,
			A: _A2,
		} = this.extractRGBAFromHEX(transparentHEX)!;

		if (!_A2) return null;
		const A2 = _A2 / 255; // Convert alpha from 0-255 to 0-1

		const R = Math.round(R2 * A2 + R1 * (1 - A2));
		const G = Math.round(G2 * A2 + G1 * (1 - A2));
		const B = Math.round(B2 * A2 + B1 * (1 - A2));

		const result = `#${R.toString(16).padStart(2, '0')}${G.toString(
			16,
		).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;

		return result;
	}

	/**
	 * Normalize HEX strings from shortened forms to full forms
	 * @param color HEX string to expand
	 * @returns Expanded HEX string
	 */
	private expandHEX(color: string) {
		if (color.length === 4) {
			// #RGB → #RRGGBB
			return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
		} else if (color.length === 5) {
			// #RGBA → #RRGGBBAA
			return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}${color[4]}${color[4]}`;
		}
		return color; // Already full-length
	}

	assignColorsSafe(colors: ThemeColors): void {
		if (!colors.highlight) {
			colors.highlight = this.lightenColorHEX(
				this.expandHEX(colors.theme600 || colors.theme300 || colors.theme900!),
				this.theme == 'dark' ? 200 : -200,
			);
		}

		if (this.expandHEX(colors.highlight).length === 9) {
			this.highlight_solid = this.renderAlpha(
				this.expandHEX(colors.highlight),
				this.expandHEX(colors.theme600 || colors.theme300 || colors.theme900!),
			)!;
		} else {
			this.highlight_solid = colors.highlight;
		}

		for (const key in colors) {
			if (colors[key as keyof ThemeColors] !== undefined) {
				(this as ThemeColors)[key] = this.expandHEX(
					colors[key as keyof ThemeColors] as string,
				);
			}
		}
	}
}
