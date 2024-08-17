export type ColorTheme = 'dark' | 'light';

export class ColorScheme {

  // Constructor configures fallbacks and essential colors based on light/dark theme
  constructor(theme: ColorTheme) {
    this.theme = theme;
    this.contrast = this.theme === 'dark' ? "#fff" : "#000";
    this.inverse = this.theme === 'dark' ? "#000" : "#fff"

    this.text = this.theme === 'dark' ? "#e1e4e8" : "#1f2328";
    this.border1 = this.theme === 'dark' ? "#30363d" : "#d3d3d3";
    this.system = this.theme === 'dark' ? "#0d0d0d" : "#1c1c1e";
  }
  
  name!: string;

  theme!: ColorTheme;
  darkest!: string;
  darker!: string;
  dark!: string;
  text!: string;
  accent1!: string;
  accent2!: string;

  contrast: string;
  inverse: string;
  highlight!: string;
  // Default border colors in the GitHub default Dark and Light themes
  border1: string;
  system: string;
}