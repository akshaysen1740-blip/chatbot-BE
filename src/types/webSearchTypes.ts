// types.ts

export interface WebSearchInput {
  query: string;
}

export interface WebSearchResult {
  answer: string;
  sources?: string[];
}