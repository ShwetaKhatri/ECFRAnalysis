import { useState, useEffect } from 'react';

interface TitleInfo {
  titleNumber: number;
  titleName: string;
}

interface AgencyDetails {
  slug: string;
  children?: { slug: string }[];
}

interface WordCountChartProps {
  agencyDetails: AgencyDetails;
}

const WordCountChart: React.FC<WordCountChartProps> = ({ agencyDetails }) => {
  const [data, setData] = useState<TitleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // POST request to your API to fetch the data based on agency details
        const response = await fetch('/api/word-count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agencyDetails }),
        });

        const result = await response.json();

        // Check if result is an array and set the data
        if (Array.isArray(result)) {
          setData(result);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching word count data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (agencyDetails?.slug) {
      fetchData();
    }
  }, [agencyDetails]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Title Number</th>
          <th>Title Name</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.titleNumber}</td>
            <td>{item.titleName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WordCountChart;

