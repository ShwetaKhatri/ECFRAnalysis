import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Part {
  partId: string;
  name: string;
}

const PartList = () => {
  const router = useRouter();
  const { titleId } = router.query;
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    if (titleId) {
      const fetchParts = async () => {
        const response = await fetch(`/api/eCFR/parts?titleId=${titleId}`);
        const data = await response.json();
        setParts(data);
      };
      fetchParts();
    }
  }, [titleId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Parts for Title {titleId}</h2>
      <ul>
        {parts.map(({ partId, name }) => (
          <li key={partId}>
            <a href={`/sections?partId=${partId}`} className="text-blue-600">{name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PartList;
