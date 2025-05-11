// src/app/page.tsx (Server Component)
import ClientDashboard from '@/dasboard/ClientDashboard';

export default function Page() {
  return (
    <main className="p-4 space-y-8">
      <h1 className="text-3xl font-bold">Federal Regulation Analysis Dashboard</h1>
      <ClientDashboard />
    </main>
  );
}
