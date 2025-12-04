export interface StyleConfig {
  fontFamily: string;
  fontSize: number; // in pt
  color: string; // hex
  bold: boolean;
  italic: boolean;
  alignment: 'left' | 'center' | 'right' | 'justify';
  marginTop: number; // in pt
  marginBottom: number; // in pt
  underline?: boolean;
}

export interface DocumentConfig {
  h1: StyleConfig;
  h2: StyleConfig;
  h3: StyleConfig;
  p: StyleConfig;
  quote: StyleConfig;
  code: StyleConfig;
  link: { color: string; underline: boolean };
}

export type ViewMode = 'editor' | 'preview' | 'split';

export const FONTS = [
  { label: 'Sans Serif (Inter)', value: 'Inter' },
  { label: 'Serif (Merriweather)', value: 'Merriweather' },
  { label: 'Monospace (JetBrains)', value: 'JetBrains Mono' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
];