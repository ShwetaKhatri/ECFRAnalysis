import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { HistoricalChange } from '@/types';

interface AgencyDetails {
  slug: string;
  children?: { slug: string }[];
}

interface TitleWithDetails {
  titleNumber: number;
  titleName: string;
  wordCount: number;
  historicalChanges: HistoricalChange[];
}

interface AgencyDataAnalysisProps {
  agencyDetails: AgencyDetails;
}

const AgencyDataAnalysis: React.FC<AgencyDataAnalysisProps> = ({ agencyDetails }) => {
  const [titleData, setTitleData] = useState<TitleWithDetails[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyDetails?.slug) return;

      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyDetails }),
      });

      const { data, checksum } = await response.json();
      console.log('Checksum:', checksum);
      setTitleData(data);
    };

    fetchData();
  }, [agencyDetails]);

  // Prepare data for the charts
  const changeFrequencyData = titleData.map((title) => ({
    titleNumber: title.titleNumber,
    changeCount: title.historicalChanges.length,
  }));

  const wordCountData = titleData.map((title) => ({
    titleNumber: title.titleNumber,
    wordCount: title.wordCount,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">ECFR Title Details</h2>

      {titleData.length === 0 ? (
        <p>No data available for the selected agency.</p>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">Change Frequency by Title</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={changeFrequencyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="titleNumber" label={{ value: 'Title Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Changes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="changeCount" fill="#8884d8">
                  <LabelList dataKey="changeCount" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 border rounded bg-white shadow-md">
            <h3 className="text-lg font-semibold mb-2">Word Count by Title</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wordCountData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="titleNumber" label={{ value: 'Title Number', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Word Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="wordCount" fill="#82ca9d">
                  <LabelList dataKey="wordCount" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {titleData.map((title) => (
              <div key={title.titleNumber} className="p-4 border rounded bg-gray-50 shadow">
                <h4 className="font-semibold text-lg mb-2">
                  Title {title.titleNumber}: {title.titleName}
                </h4>
                <p className="mb-2">Word Count: {title.wordCount.toLocaleString()}</p>
                <div className="max-h-60 overflow-y-auto border p-2 rounded bg-white">
                  {title.historicalChanges.length === 0 ? (
                    <p className="text-sm text-gray-500">No historical changes available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {title.historicalChanges.map((change, index) => (
                        <li key={index} className="border p-2 rounded bg-gray-100">
                          <p>
                            <span className="font-semibold">Name:</span> {change.name}
                          </p>
                          <p>
                            <span className="font-semibold">Part:</span> {change.part}
                          </p>
                          <p>
                            <span className="font-semibold">Amendment Date:</span> {change.amendment_date}
                          </p>
                          <p className="text-xs text-gray-600">
                            ID: {change.identifier}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyDataAnalysis;
