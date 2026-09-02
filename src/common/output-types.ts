export interface FormatterOutput {
  status: 'ok' | 'uncertain';
  probableCodes: {
    code: string;
    title: string;
    confidence: number;
    rationale: string;
  }[];
  probableGuidelines: {
    title: string;
    confidence: number;
    rationale: string;
  }[];
}
