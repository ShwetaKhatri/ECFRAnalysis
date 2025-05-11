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

export interface HistoryVersion {
  effective_date: string;
  title_versions: unknown[]; // or a more specific type if known
}

export interface HistoryResponse {
  versions: HistoryVersion[];
}

export interface CfrReference {
  title: number;
  chapter: string;
}

export interface ChildAgency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  cfr_references: CfrReference[];  // List of CFR references
}

export interface Agency {
  name: string;
  short_name: string;
  display_name: string;
  slug: string;
  children: ChildAgency[];  // Array of child agencies
  cfr_references: CfrReference[];
}

export interface AgencyDetails {
  short_name: string;
  name: string;
  sortable_name: string;
  slug: string;
  children: { slug: string; name: string }[]; // En
  cfr_references: CfrReference[];
}

export interface WordCountData {
  title: string; // Example field
  wordCount: number; // Example field
}

export interface TitleData {
  number: 1,
  name: string,
  latest_amended_on: string,
  latest_issue_date: string,
  up_to_date_as_of: string,
  reserved: boolean
}


// src/types/index.ts

export interface Hierarchy {
  title: string;
  subtitle: string | null;
  chapter: string | null;
  subchapter: string | null;
  part: string | null;
  subpart: string | null;
  subject_group: string | null;
  section: string | null;
  appendix: string | null;
}

export interface HierarchyHeadings {
  title: string;
  subtitle: string | null;
  chapter: string | null;
  subchapter: string | null;
  part: string | null;
  subpart: string | null;
  subject_group: string | null;
  section: string | null;
  appendix: string | null;
}

export interface Headings {
  title: string;
  subtitle: string | null;
  chapter: string | null;
  subchapter: string | null;
  part: string | null;
  subpart: string | null;
  subject_group: string | null;
  section: string | null;
  appendix: string | null;
}

export interface SearchResult {
  starts_on: string;
  ends_on: string | null;
  type: string;
  hierarchy: Hierarchy;
  hierarchy_headings: HierarchyHeadings;
  headings: Headings;
  full_text_excerpt: string | null;
  score: number;
  structure_index: number;
  reserved: boolean;
  removed: boolean;
  change_types: string[];
}


export interface WordCountApiResponse {
  agency_slug: string;
  titles: TitleData[];
}