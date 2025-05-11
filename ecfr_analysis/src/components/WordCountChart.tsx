// components/WordCountChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AgencyMetrics } from '../types';

interface Props {
  data: AgencyMetrics[];
}

export const WordCountChart: React.FC<Props> = ({ data }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Word Count per Agency</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="agency" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="wordCount" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
