"use client";

import { useEffect, useState, useMemo } from "react";

interface CustomerRow {
  id: string;
  name: string | null;
  email: string;
  recencyDays: number | null;
  frequency: number;
  monetary: number;
  campaignStatus: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface BestSeller {
  name: string;
  quantitySold: number;
}

type SortKey = "recencyDays" | "frequency" | "monetary";

function pulseColor(days: number | null) {
  if (days === null) return "var(--text-soft)";
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
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recencyDays");
  const [sortDesc, setSortDesc] = useState(true);
  const [inventory, setInventory] = useState<{ lowStock: Product[]; bestSellers: BestSeller[] }>({
    lowStock: [],
    bestSellers: [],
  });

  function loadCustomers() {
    setLoading(true);
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCustomers();
    fetch("/api/inventory")
      .then((res) => res.json())
      .then(setInventory);
  }, []);

  async function runAnalysis() {
    setAnalyzing(true);
    await fetch("/api/analyze", { method: "POST" });
    loadCustomers();
    setAnalyzing(false);
  }

  const visibleRows = useMemo(() => {
    const filtered = customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
  }, [customers, search, sortKey, sortDesc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[var(--text-soft)]">
        Loading customers...
      </div>
    );

  const flagged = customers.filter((c) => c.campaignStatus !== "none");
  const revenueAtStake = flagged.reduce((sum, c) => sum + c.monetary, 0);

  return (
    <main className="min-h-screen px-8 py-12 max-w-4xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="var(--accent)" fillOpacity="0.15" />
            <path d="M6 15h3l2-6 4 12 2-8 2 4h3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Menoly</h1>
            <p className="text-sm text-[var(--text-soft)]">Customer retention & win-back tracking</p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-white disabled:opacity-50 transition-opacity"
        >
          {analyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-soft)] mb-1">Customers</p>
          <p className="text-2xl font-semibold">{customers.length}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-soft)] mb-1">Flagged for win-back</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--risk)" }}>{flagged.length}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-soft)] mb-1">Revenue at stake</p>
          <p className="text-2xl font-semibold">${revenueAtStake}</p>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full mb-4 px-3 py-2 text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] outline-none focus:border-[var(--accent)] transition-colors"
      />

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-3 px-4 text-xs text-[var(--text-soft)] font-medium">Customer</th>
              <th className="py-3 px-4 text-xs text-[var(--text-soft)] font-medium cursor-pointer select-none" onClick={() => toggleSort("recencyDays")}>
                Recency {sortKey === "recencyDays" && (sortDesc ? "↓" : "↑")}
              </th>
              <th className="py-3 px-4 text-xs text-[var(--text-soft)] font-medium cursor-pointer select-none" onClick={() => toggleSort("frequency")}>
                Orders {sortKey === "frequency" && (sortDesc ? "↓" : "↑")}
              </th>
              <th className="py-3 px-4 text-xs text-[var(--text-soft)] font-medium cursor-pointer select-none" onClick={() => toggleSort("monetary")}>
                Spent {sortKey === "monetary" && (sortDesc ? "↓" : "↑")}
              </th>
              <th className="py-3 px-4 text-xs text-[var(--text-soft)] font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--text-soft)]">{c.email}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="pulse-track">
                      <div className="pulse-dot" style={{ left: `${pulsePosition(c.recencyDays)}%`, background: pulseColor(c.recencyDays), color: pulseColor(c.recencyDays) }} />
                    </div>
                    <span className="font-mono text-xs text-[var(--text-soft)]">{c.recencyDays !== null ? `${c.recencyDays}d` : "—"}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono">{c.frequency}</td>
                <td className="py-3 px-4 font-mono">${c.monetary}</td>
                <td className="py-3 px-4">
                  {c.campaignStatus === "pending" && <span className="badge badge-risk">pending</span>}
                  {c.campaignStatus === "sent" && <span className="badge badge-sent">sent</span>}
                  {c.campaignStatus === "failed" && <span className="badge badge-risk">failed</span>}
                  {c.campaignStatus === "none" && <span className="badge badge-healthy">healthy</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-soft)] mb-3">Low Stock</p>
          {inventory.lowStock.map((p) => (
            <div key={p.id} className="flex justify-between py-1.5 text-sm">
              <span>{p.name}</span>
              <span style={{ color: "var(--risk)" }}>{p.stock} left</span>
            </div>
          ))}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-soft)] mb-3">Best Sellers</p>
          {inventory.bestSellers.slice(0, 5).map((p, i) => (
            <div key={i} className="flex justify-between py-1.5 text-sm">
              <span>{p.name}</span>
              <span style={{ color: "var(--healthy)" }}>{p.quantitySold} sold</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
