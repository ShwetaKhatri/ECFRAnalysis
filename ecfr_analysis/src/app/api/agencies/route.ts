import { NextResponse } from 'next/server';
import { Agency } from '@/types'; // Import the Agency type

export async function GET() {
  try {
    // Fetch agencies
    const res = await fetch('https://www.ecfr.gov/api/admin/v1/agencies.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch agencies. Status: ${res.status}`);
    }
    const data = await res.json();

    const agencies = data.agencies.map((agency: Agency) => ({
      name: agency.display_name,
      slug: agency.slug,
    }));

    return NextResponse.json(agencies);
  } catch (error) {
    console.error('Failed to fetch agencies:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}
