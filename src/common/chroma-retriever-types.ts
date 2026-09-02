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
