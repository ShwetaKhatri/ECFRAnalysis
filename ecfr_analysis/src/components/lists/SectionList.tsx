import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Section {
  sectionId: string;
  name: string;
}

const SectionList = () => {
  const router = useRouter();
  const { partId } = router.query;
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (partId) {
      const fetchSections = async () => {
        const response = await fetch(`/api/eCFR/sections?partId=${partId}`);
        const data = await response.json();
        setSections(data);
      };
      fetchSections();
    }
  }, [partId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Sections for Part {partId}</h2>
      <ul>
        {sections.map(({ sectionId, name }) => (
          <li key={sectionId}>
            <a href={`/section?sectionId=${sectionId}`} className="text-blue-600">{name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SectionList;
