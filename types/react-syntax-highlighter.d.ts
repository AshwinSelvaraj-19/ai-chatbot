declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, unknown>;
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLAttributes<HTMLElement>;
    [key: string]: unknown;
  }

  export class Prism extends React.Component<SyntaxHighlighterProps> {}
  export class PrismLight extends React.Component<SyntaxHighlighterProps> {}
  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {}
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  const styles: Record<string, Record<string, unknown>>;
  export const oneDark: Record<string, Record<string, unknown>>;
  export const oneLight: Record<string, Record<string, unknown>>;
  export const vscDarkPlus: Record<string, Record<string, unknown>>;
  export default styles;
}
