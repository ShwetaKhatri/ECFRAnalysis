// src/app/api/metrics/route.ts
// src/app/api/eCFR/sections/route.ts
import { NextResponse } from 'next/server';

const ECFR_API_URL = 'https://www.ecfr.gov/api/v1/sections'; // eCFR API URL

export async function GET() {
  try {
    const response = await fetch(ECFR_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch data from eCFR API');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching data from eCFR API' }, { status: 500 });
  }
}

