// components/ClientDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import TitleDetailsChart from '@/components/TitleDetailsChart';

import { AgencyDetails } from '@/types';

export default function ClientDashboard() {
  const [agencies, setAgencies] = useState<AgencyDetails[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<AgencyDetails | null>(null);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        const res = await fetch('/api/agencies');
        const data = await res.json();
        setAgencies(data);
      } catch (error) {
        console.error('Failed to fetch agencies:', error);
      }
    }

    fetchAgencies();
  }, []);

  const handleAgencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = event.target.value;
    const agency = agencies.find((a) => a.slug === selectedSlug);
    if (agency) {
      setSelectedAgency(agency);
    }
  };

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">eCFR Analysis Dashboard</h1>

      <div className="mb-4">
        <label htmlFor="agency-select" className="block mb-2 text-lg font-medium">
          Select an Agency:
        </label>
        <select
          id="agency-select"
          onChange={handleAgencyChange}
          className="p-2 border rounded"
          value={selectedAgency?.slug || ''}
        >
          <option value="" disabled>
            -- Choose an Agency --
          </option>
          {agencies.map((agency) => (
            <option key={agency.slug} value={agency.slug}>
              {agency.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAgency && (
        <>
          <TitleDetailsChart agencyDetails={selectedAgency} />
        </>
      )}
    </main>
  );
}
