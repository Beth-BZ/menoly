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

function pulseColor(days: number | null) {
  if (days === null) return "var(--ink-soft)";
  if (days <= 14) return "var(--healthy)";
  if (days <= 45) return "var(--warn)";
  return "var(--risk)";
}

function pulsePosition(days: number | null) {
  if (days === null) return 0;
  return Math.min(days / 120, 1) * 100;
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[var(--ink-soft)]">
        Loading customers...
      </div>
    );

  const flagged = customers.filter((c) => c.campaignStatus !== "none");
  const revenueAtStake = flagged.reduce((sum, c) => sum + c.monetary, 0);

  return (
    <main className="min-h-screen px-8 py-12 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-soft)] mb-2">
          Menoly · Retention Dashboard
        </p>
        <h1 className="font-display text-4xl mb-1">Who's drifting away</h1>
        <p className="text-[var(--ink-soft)]">
          Customers ranked by how long it's been since their last order.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4">
          <p className="font-mono text-xs text-[var(--ink-soft)] mb-1">CUSTOMERS</p>
          <p className="font-display text-2xl">{customers.length}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4">
          <p className="font-mono text-xs text-[var(--ink-soft)] mb-1">FLAGGED FOR WIN-BACK</p>
          <p className="font-display text-2xl" style={{ color: "var(--risk)" }}>
            {flagged.length}
          </p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4">
          <p className="font-mono text-xs text-[var(--ink-soft)] mb-1">REVENUE AT STAKE</p>
          <p className="font-display text-2xl">${revenueAtStake}</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line)] text-left">
              <th className="py-3 px-4 font-mono text-xs text-[var(--ink-soft)] font-normal">CUSTOMER</th>
              <th className="py-3 px-4 font-mono text-xs text-[var(--ink-soft)] font-normal">RECENCY</th>
              <th className="py-3 px-4 font-mono text-xs text-[var(--ink-soft)] font-normal">ORDERS</th>
              <th className="py-3 px-4 font-mono text-xs text-[var(--ink-soft)] font-normal">SPENT</th>
              <th className="py-3 px-4 font-mono text-xs text-[var(--ink-soft)] font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-[var(--line)] last:border-0">
                <td className="py-3 px-4">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--ink-soft)]">{c.email}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="pulse-track">
                      <div
                        className="pulse-dot"
                        style={{
                          left: `${pulsePosition(c.recencyDays)}%`,
                          background: pulseColor(c.recencyDays),
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-[var(--ink-soft)]">
                      {c.recencyDays !== null ? `${c.recencyDays}d` : "—"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-sm">{c.frequency}</td>
                <td className="py-3 px-4 font-mono text-sm">${c.monetary}</td>
                <td className="py-3 px-4">
                  {c.campaignStatus === "pending" && (
                    <span className="badge badge-risk">win-back pending</span>
                  )}
                  {c.campaignStatus === "sent" && (
                    <span className="badge badge-sent">sent</span>
                  )}
                  {c.campaignStatus === "none" && (
                    <span className="badge badge-healthy">healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
