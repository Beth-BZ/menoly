"use client";

import { useEffect, useState } from "react";

interface CustomerRow {
  id: string;
  name: string | null;
  email: string;
  recencyDays: number | null;
  frequency: number;
  monetary: number;
  campaignStatus: string;
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  const atRiskCount = customers.filter(
    (c) => c.campaignStatus !== "none"
  ).length;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Menoly Dashboard</h1>
      <p className="text-gray-500 mb-6">
        {customers.length} customers · {atRiskCount} flagged for win-back
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Recency</th>
            <th className="py-2">Frequency</th>
            <th className="py-2">Monetary</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td className="py-2">{c.email}</td>
              <td className="py-2">
                {c.recencyDays !== null ? `${c.recencyDays}d` : "—"}
              </td>
              <td className="py-2">{c.frequency}</td>
              <td className="py-2">${c.monetary}</td>
              <td className="py-2">
                {c.campaignStatus === "pending" && (
                  <span className="text-orange-600">⚠️ Win-back pending</span>
                )}
                {c.campaignStatus === "sent" && (
                  <span className="text-blue-600">✉️ Sent</span>
                )}
                {c.campaignStatus === "none" && (
                  <span className="text-gray-400">Healthy</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
