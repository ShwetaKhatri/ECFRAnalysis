import { useEffect, useState } from 'react';

interface Title {
  titleId: string;
  name: string;
}

const TitleList = () => {
  const [titles, setTitles] = useState<Title[]>([]);

  useEffect(() => {
    const fetchTitles = async () => {
      const response = await fetch('/api/eCFR/titles');
      const data = await response.json();
      setTitles(data);
    };
    fetchTitles();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">eCFR Titles</h2>
      <ul>
        {titles.map(({ titleId, name }) => (
          <li key={titleId}>
            <a href={`/parts?titleId=${titleId}`} className="text-blue-600">{name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TitleList;
