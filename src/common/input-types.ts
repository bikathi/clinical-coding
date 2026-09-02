export type ICDCatalogList = ICDCatalog[]

export interface ICDCatalog {
  code: string
  title: string
  chapter: string
  synonyms: string[]
}

export type GuidelineSnippetList = GuidelineSnippet[]

export interface GuidelineSnippet {
  id: string
  title: string
  source: string
  effective: string
  text: string
}

export enum FileType {
  GUIDELINE_SNIPPET = 'GUIDELINE_SNIPPET',
  ICD_CATALOG = 'ICD_CATALOG',
}