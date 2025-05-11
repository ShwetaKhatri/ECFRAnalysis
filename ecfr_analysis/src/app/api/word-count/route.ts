import { NextRequest, NextResponse } from 'next/server';

type EcfrTitle = {
  number: number;
  name: string;
  latest_amended_on: string;
  latest_issue_date: string;
  up_to_date_as_of: string;
  reserved: boolean;
};

type SearchResult = {
  hierarchy_headings: {
    title: string;
  };
};

type AgencyDetails = {
  slug: string;
  children?: { slug: string }[];
};

// Fetch ECFR Titles once
async function fetchEcfrTitles(): Promise<EcfrTitle[]> {
  const response = await fetch('https://www.ecfr.gov/api/versioner/v1/titles');
  if (!response.ok) {
    throw new Error(`Failed to fetch titles: ${response.status}`);
  }

  const data: { titles: EcfrTitle[] } = await response.json();
  return data.titles;
}

export async function POST(req: NextRequest) {
  try {
    const { agencyDetails }: { agencyDetails: AgencyDetails } = await req.json();
    if (!agencyDetails?.slug) {
      return NextResponse.json({ error: 'Missing agency slug' }, { status: 400 });
    }

    const titles = await fetchEcfrTitles();

    const slugs: string[] = [agencyDetails.slug, ...(agencyDetails.children?.map((c) => c.slug) || [])];
    const foundTitles = new Set<string>();

    for (const slug of slugs) {
      const res = await fetch(`https://www.ecfr.gov/api/search/v1/results?agency_slugs[]=${slug}&per_page=100&page=1&order=relevance&paginate_by=results`);
      if (!res.ok) continue;

      const result: { results: SearchResult[] } = await res.json();
      for (const item of result.results) {
        if (item.hierarchy_headings?.title) {
          foundTitles.add(item.hierarchy_headings.title.replace('Title ', '').trim());
        }
      }
    }

    const matched = titles
      .filter((title) => foundTitles.has(title.number.toString()))
      .map((title) => ({
        titleNumber: title.number,
        titleName: title.name,
      }));

    return NextResponse.json(matched);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}