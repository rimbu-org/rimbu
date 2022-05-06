export type DocBlock = [string, string];

export interface DocComment {
  brief: string;
  summary: string;
  returns?: string;
  params: Map<string, string>;
  typeParams: Map<string, string>;
  other: DocBlock[];
}
