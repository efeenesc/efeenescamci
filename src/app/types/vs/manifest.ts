export interface ThemeRepository {
  type: string;
  url: string;
}

export interface ThemeMetadata {
  label: string;
  uiTheme: string;
  path: string;
}

export interface ThemePackage {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  version: string;
  repository: ThemeRepository;
  publisher: string;
  keywords: string[];
  engines: {
    vscode: string;
  };
  categories: string[];
  contributes: {
    themes: ThemeMetadata[];
  };
}