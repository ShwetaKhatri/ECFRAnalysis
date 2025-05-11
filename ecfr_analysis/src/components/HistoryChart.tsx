// components/HistoryChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgencyMetrics, TransformedData } from '@/types';

interface Props {
  data: AgencyMetrics[];
}

// Transform history data for charting multiple agencies
const transformData = (metrics: AgencyMetrics[]): TransformedData[] => {
  const dateMap: Record<string, TransformedData> = {}; // Keyed by date

  metrics.forEach(({ agency, history }) => {
    history.forEach(({ date, wordCount }) => {
      // If the date entry does not exist in dateMap, initialize it with the `date` property
      if (!dateMap[date]) {
        dateMap[date] = { date, [agency]: 0 } as TransformedData; // Initialize with the `date` field and agency as key
      }
      dateMap[date][agency] = wordCount; // Store word count under the agency name
    });
  });

  return Object.values(dateMap); // Return an array of date-wise data
};

export const HistoryChart: React.FC<Props> = ({ data }) => {
  const chartData = transformData(data);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Word Count History Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.map(({ agency }) => (
            <Line
              key={agency}
              type="monotone"
              dataKey={agency}
              stroke={agency === 'EPA' ? '#2b6cb0' : '#38a169'}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
