/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseStringPromise } from 'xml2js';

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

type ContentVersion = {
  date: string;
  amendment_date: string;
  issue_date: string;
  identifier: string;
  name: string;
  part: string;
  subpart: string | null;
  title: string;
  type: string;
}

function generateChecksum(data: any): string {
  const json = JSON.stringify(data);
  return crypto.createHash('sha256').update(json).digest('hex');
}

// Fetch ECFR Titles once
async function fetchEcfrTitles(): Promise<EcfrTitle[]> {
  const response = await fetch('https://www.ecfr.gov/api/versioner/v1/titles');
  if (!response.ok) {
    throw new Error(`Failed to fetch titles: ${response.status}`);
  }

  const data: { titles: EcfrTitle[] } = await response.json();
  return data.titles;
}

// Download XML for a title and count words
async function fetchWordCountForTitle(titleNumber: number): Promise<number> {
  const url = `https://www.ecfr.gov/api/versioner/v1/full/2025-01-01/title-${titleNumber}.xml`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch XML for title ${titleNumber}`);
      return 0;
    }

    const xml = await response.text();
    const parsed = await parseStringPromise(xml, { trim: true, explicitArray: false });
    const textContent = JSON.stringify(parsed);
    const wordCount = textContent.split(/\s+/).length;
    console.log(`Word count for title ${titleNumber}: ${wordCount}`);
    return wordCount;
  } catch (error) {
    console.error(`Error processing title ${titleNumber}:`, error);
    return 0;
  }
}

// Fetch historical changes for a title
async function fetchHistoricalChanges(titleNumber: number, date: string): Promise<ContentVersion[]> {
  const url = `https://www.ecfr.gov/api/versioner/v1/versions/title-${titleNumber}.json?issue_date%5Blte%5D=${date}`;

  try {
    const response = await fetch(url);
    console.log(`Fetching historical changes for title ${titleNumber}...`);
    if (!response.ok) {
      console.warn(`Failed to fetch historical changes for title ${titleNumber}`);
      return [];
    }
    const data = await response.json();
    return data.content_versions || [];
  } catch (error) {
    console.error(`Error fetching historical changes for title ${titleNumber}:`, error);
    return [];
  }
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

    console.log('Agency Slugs:', slugs);
    for (const slug of slugs) {
      const res = await fetch(`https://www.ecfr.gov/api/search/v1/results?agency_slugs[]=${slug}&per_page=100&page=1&order=relevance&paginate_by=results`);
      if (!res.ok) continue;

      const result: { results: SearchResult[] } = await res.json();
      for (const item of result.results) {
        if (item.hierarchy_headings?.title) {
          const numStr = item.hierarchy_headings.title.replace('Title ', '').trim();
          foundTitles.add(numStr);
        }
      }
    }

    console.log('Found Titles:', Array.from(foundTitles));

    const relevantTitles = titles.filter((title) =>
      foundTitles.has(title.number.toString())
    );
    
    const matched = await Promise.all(
      relevantTitles.map(async (title) => {
        // Fetch historical changes for the title on or before the date '2025-01-01'
        const historicalChanges = await fetchHistoricalChanges(title.number, '2025-01-01');
        const wordCount = await fetchWordCountForTitle(title.number);
        // Construct the matched result with the fetched data
        return {
          titleNumber: title.number,
          titleName: title.name,
          wordCount: wordCount,
          historicalChanges,  
        };
      })
    );
    
    const checksumPayload = matched.map((title) => ({
      titleNumber: title.titleNumber,
      wordCount: title.wordCount,
      historicalChangeIds: title.historicalChanges.map((hc) => hc.identifier),
    }));
    
    const checksum = generateChecksum({
      agencySlug: agencyDetails.slug,
      payload: checksumPayload,
    });

    return NextResponse.json({ checksum, data: matched });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}