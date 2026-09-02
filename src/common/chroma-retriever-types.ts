export interface ICDMatch {
  id: string;
  code: string;
  title: string;
  chapter: string;
  synonyms: string[];
  distance: number | null;
}

export interface GuidelineMatch {
  id: string;
  title: string;
  source: string;
  effective: string;
  text: string;
  distance: number | null;
}

export interface RetrievalResults {
  icdMatches: ICDMatch[];
  guidelineMatches: GuidelineMatch[];
}

export interface ReasonerOutput {
  codes: {
    id: string;
    code: string;
    title: string;
    confidence: number;
    rationale: string;
  }[];
  guidelines: {
    id: string;
    title: string;
    confidence: number;
    rationale: string;
  }[];
}
