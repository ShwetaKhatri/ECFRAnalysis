// src/app/api/eCFR/parts/route.ts
import { NextResponse } from 'next/server';

const ECFR_API_URL = 'https://www.ecfr.gov/api/v1/parts'; // eCFR API URL for parts

/**
 * This API route expects a titleId parameter in the query string and uses it to fetch the corresponding parts for that title.
 * @param req itleId parameter in the query string
 * @returns corresponding parts for that title
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const titleId = url.searchParams.get('titleId');

  if (!titleId) {
    return NextResponse.json({ message: 'Missing titleId query parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(`${ECFR_API_URL}?title=${titleId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch parts from eCFR API');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching parts from eCFR API' }, { status: 500 });
  }
}
