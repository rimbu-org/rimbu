export type ExcerptTokenKind = 'Content' | 'Reference';

export interface ExcerptToken {
  kind: ExcerptTokenKind;
  text: string;
  canonicalReference?: string;
}

export interface ExcerptTokenRange {
  startIndex: number;
  endIndex: number;
}

export interface Excerpt {
  tokens: ExcerptToken[];
  tokenRange: ExcerptTokenRange;
  spannedTokens: ExcerptToken[];
  text?: string;
}

export interface ParameterOptions {
  parameterName: string;
  parameterTypeTokenRange: ExcerptTokenRange;
}

export interface TypeParameterOptions {
  typeParameterName: string;
  constraintTokenRange: ExcerptTokenRange;
  defaultTypeTokenRange: ExcerptTokenRange;
}
