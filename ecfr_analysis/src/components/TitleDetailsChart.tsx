import { useState, useEffect } from 'react';
import { HistoricalChange } from '@/types';

// Define the types
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

interface TitleDetailsChartProps {
  agencyDetails: AgencyDetails;
}

const TitleDetailsChart: React.FC<TitleDetailsChartProps> = ({ agencyDetails }) => {
  const [titleData, setTitleData] = useState<TitleWithDetails[]>([]);
  const [changeFrequency, setChangeFrequency] = useState<{ titleNumber: number; changeCount: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyDetails?.slug) return;

      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyDetails }),
      });

      const { data, checksum } = await response.json();
      // Calculate the Change Frequency Metric
      const frequencyData = data.map((title: TitleWithDetails) => {
        return {
          titleNumber: title.titleNumber,
          changeCount: title.historicalChanges.length,
        };
      });

      setTitleData(data);
      setChangeFrequency(frequencyData);

      console.log('Checksum:', checksum);
    };

    fetchData();
  }, [agencyDetails]);

  return (
    <div>
      <h2>ECFR Title Details</h2>
      {titleData.length === 0 ? (
        <p>No data available for the selected agency.</p>
      ) : (
        <div>
          {titleData.map((title) => {
            const freq = changeFrequency.find((item) => item.titleNumber === title.titleNumber)?.changeCount || 0;

            return (
              <div key={title.titleNumber} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>{title.titleName}</h3>
                <p><strong>Title Number:</strong> {title.titleNumber}</p>
                <p><strong>Word Count:</strong> {title.wordCount}</p>
                <p><strong>Change Frequency:</strong> {freq} changes</p>

                <div style={{ overflowY: 'scroll', maxHeight: '200px' }}>
                  {title.historicalChanges.length === 0 ? (
                    <p>No historical changes available.</p>
                  ) : (
                    <ul>
                      {title.historicalChanges.map((change, index) => (
                        <li key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ddd', padding: '5px' }}>
                          <p><strong>{change.name}</strong></p>
                          <p><em>Amendment Date:</em> {change.amendment_date}</p>
                          <p>ID: {change.identifier}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TitleDetailsChart;
