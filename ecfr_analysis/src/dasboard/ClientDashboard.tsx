// src/components/ClientDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { WordCountChart } from '../components/WordCountChart';
import { HistoryChart } from '../components/HistoryChart';
import { MetricsTable } from '../components/MetricsTable';
import { AgencyMetrics } from '../types';

const mockData: AgencyMetrics[] = [
  {
    agency: 'EPA',
    wordCount: 120000,
    checksum: 'abcd1234',
    history: [
      { date: '2024-01-01', wordCount: 118000 },
      { date: '2024-06-01', wordCount: 119500 },
      { date: '2025-01-01', wordCount: 120000 },
    ],
    redundancyScore: 78,
  },
  {
    agency: 'FDA',
    wordCount: 95000,
    checksum: 'efgh5678',
    history: [
      { date: '2024-01-01', wordCount: 94000 },
      { date: '2024-06-01', wordCount: 94500 },
      { date: '2025-01-01', wordCount: 95000 },
    ],
    redundancyScore: 66,
  },
];

export default function ClientDashboard() {
  const [data, setData] = useState<AgencyMetrics[]>([]);

  useEffect(() => {
    setData(mockData);
  }, []);

  return (
    <>
      <WordCountChart data={data} />
      <HistoryChart data={data} />
      <MetricsTable data={data} />
    </>
  );
}
