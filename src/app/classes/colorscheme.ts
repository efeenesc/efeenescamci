export type ThemeType = 'dark' | 'light';

export class ColorScheme {

  // Constructor configures fallbacks and essential colors based on light/dark theme
  constructor(theme: ThemeType) {
    this.theme = theme;
    this.theme300 = theme === 'dark' ? '#d3d3d3' : '#ffffff';
    this.theme600 = theme === 'dark' ? '#a3a3a3' : '#f6f8fa';
    this.theme900 = theme === 'dark' ? '#212121' : '#e1e4e8';
    
    this.text = theme === 'dark' ? "#e1e4e8" : "#1f2328";
    this.accent1 = '#4fc1ff';
    this.accent2 = '#ce9178';

    this.contrast = theme === 'dark' ? "#fff" : "#000";
    this.inverse = theme === 'dark' ? "#000" : "#fff";
    this.highlight = '';

    this.border1 = theme === 'dark' ? "#30363d" : "#d3d3d3";
    this.system = theme === 'dark' ? "#0d0d0d" : "#1c1c1e";
  }
  
  name!: string;

  theme!: ThemeType;
  theme900!: string;
  theme600!: string;
  theme300!: string;

  text!: string;
  accent1!: string;
  accent2!: string;

  contrast: string;
  inverse: string;
  highlight: string;

  border1: string;
  system: string;
}