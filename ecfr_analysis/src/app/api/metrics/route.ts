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

// In-memory cache for word counts
const wordCountCache: Record<string, number> = {};

// Function to fetch or retrieve cached word count for a title
async function getCachedWordCount(agencySlug: string, titleNumber: number): Promise<number> {
  const cacheKey = `${agencySlug}-title-${titleNumber}`;

  // Check if the word count is already in the cache
  if (wordCountCache[cacheKey] !== undefined) {
    console.log(`Cache hit for ${cacheKey}`);
    return wordCountCache[cacheKey];
  }

  // If not in the cache, fetch the word count
  console.log(`Cache miss for ${cacheKey}`);
  const wordCount = await fetchWordCountForTitle(titleNumber);

  // Store the word count in the cache
  wordCountCache[cacheKey] = wordCount;

  return wordCount;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to extract agency details
    const { agencyDetails }: { agencyDetails: AgencyDetails } = await req.json();
    if (!agencyDetails?.slug) {
      // Return a 400 response if the agency slug is missing
      return NextResponse.json({ error: 'Missing agency slug' }, { status: 400 });
    }

    // Fetch all ECFR titles from the external API
    const titles = await fetchEcfrTitles();

    // Combine the agency slug with its children's slugs (if any)
    const slugs: string[] = [agencyDetails.slug, ...(agencyDetails.children?.map((c) => c.slug) || [])];
    const foundTitles = new Set<string>();

    console.log('Agency Slugs:', slugs);

    // For each slug, fetch search results from the external API
    for (const slug of slugs) {
      const res = await fetch(`https://www.ecfr.gov/api/search/v1/results?agency_slugs[]=${slug}&per_page=100&page=1&order=relevance&paginate_by=results`);
      if (!res.ok) continue; // Skip if the response is not OK

      // Parse the search results and extract title numbers
      const result: { results: SearchResult[] } = await res.json();
      for (const item of result.results) {
        if (item.hierarchy_headings?.title) {
          const numStr = item.hierarchy_headings.title.replace('Title ', '').trim();
          foundTitles.add(numStr); // Add the title number to the set
        }
      }
    }

    console.log('Found Titles:', Array.from(foundTitles));

    // Filter ECFR titles to include only those found in the search results
    const relevantTitles = titles.filter((title) =>
      foundTitles.has(title.number.toString())
    );

    // Fetch historical changes and word counts for each relevant title
    const matched = await Promise.all(
      relevantTitles.map(async (title) => {
        // Fetch historical changes for the title on or before '2025-01-01'
        const historicalChanges = await fetchHistoricalChanges(title.number, '2025-01-01');
        // Fetch or retrieve cached word count for the title
        const wordCount = await getCachedWordCount(agencyDetails.slug, title.number);
        // Construct the matched result with the fetched data
        return {
          titleNumber: title.number,
          titleName: title.name,
          wordCount: wordCount,
          historicalChanges,
        };
      })
    );

    // Prepare the payload for checksum generation
    const checksumPayload = matched.map((title) => ({
      titleNumber: title.titleNumber,
      wordCount: title.wordCount,
      historicalChangeIds: title.historicalChanges.map((hc) => hc.identifier),
    }));

    // Generate a checksum for the payload
    const checksum = generateChecksum({
      agencySlug: agencyDetails.slug,
      payload: checksumPayload,
    });

    // Return the response with the checksum and matched data
    return NextResponse.json({ checksum, data: matched });
  } catch (error) {
    // Log the error and return a 500 response if something goes wrong
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
