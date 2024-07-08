export type ColorTheme = 'dark' | 'light';

export class ColorScheme {
  constructor(theme: ColorTheme) {
    this.theme = theme;
    this.contrast = this.theme === 'dark' ? "#ffffff" : "#000000";
    this.text = this.theme === 'dark' ? "#e1e4e8" : "#1f2328";
    this.border1 = this.theme === 'dark' ? "#30363d" : "#d3d3d3";
  }
  // Required to configure fallbacks
  theme!: ColorTheme;
  darkest!: string;
  darker!: string;
  dark!: string;
  text!: string;
  accent1!: string;
  accent2!: string;
  contrast: string;
  highlight!: string;
  // Default border colors in the GitHub default Dark and Light themes
  border1: string;
}