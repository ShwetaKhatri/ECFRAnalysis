// components/MetricsTable.tsx
import { AgencyMetrics } from '../types';

interface Props {
  data: AgencyMetrics[];
}

export const MetricsTable: React.FC<Props> = ({ data }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Agency Metrics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Agency</th>
              <th className="px-4 py-2">Checksum</th>
              <th className="px-4 py-2">Redundancy Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ agency, checksum, redundancyScore }) => (
              <tr key={agency} className="border-t">
                <td className="px-4 py-2 font-medium">{agency}</td>
                <td className="px-4 py-2">{checksum}</td>
                <td className="px-4 py-2">{redundancyScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
