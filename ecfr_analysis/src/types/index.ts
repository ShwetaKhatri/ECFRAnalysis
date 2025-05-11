// types.ts
export interface AgencyMetrics {
    agency: string;
    wordCount: number;
    checksum: string;
    history: { date: string; wordCount: number }[];
    redundancyScore: number;
  }

  // Define a type for the data structure we want to create
export type TransformedData = {
  date: string; // The date
} & {
  [agency: string]: number; // Dynamic property for each agency's word count
};

export interface Props {
  data: AgencyMetrics[];
}