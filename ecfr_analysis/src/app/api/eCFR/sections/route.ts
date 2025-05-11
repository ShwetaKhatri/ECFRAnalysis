// src/app/api/eCFR/sections/route.ts
import { NextResponse } from 'next/server';

const ECFR_API_URL = 'https://www.ecfr.gov/api/v1/sections'; // eCFR API URL for sections

/**
 * This route expects a partId query parameter and fetches the corresponding sections for that part.
 * @param req   partId query parameter
 * @returns     corresponding sections for that part
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const partId = url.searchParams.get('partId');

  if (!partId) {
    return NextResponse.json({ message: 'Missing partId query parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(`${ECFR_API_URL}?part=${partId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sections from eCFR API');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching sections from eCFR API' }, { status: 500 });
  }
}
