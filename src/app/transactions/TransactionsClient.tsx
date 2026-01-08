"use client";

import { useEffect, useMemo, useState } from "react";
import TransactionsList from "../components/TransactionsList";
import { Transaction } from "../utils/aggregateTransactions";

type SortOption = "date-new" | "date-old" | "amount-high" | "amount-low" | "";

const PAGE_SIZE = 50;
const NAV_HEIGHT = 64;

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-new");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset to page 1 when search OR sort changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [searchTerm, sortOption]);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    const fetchTransactions = async () => {
      setLoading(true);

      try {
        const sort = sortOption || "date-new";

        const res = await fetch(
          `/api/transactions?limit=${PAGE_SIZE}&page=${page}&sort=${encodeURIComponent(
            sort
          )}&q=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          console.error("Fetch failed:", res.status, await res.text());
          if (alive) {
            setTransactions([]);
            setTotalPages(1);
          }
          return;
        }

        const data = await res.json();

        const parsed: Transaction[] = (data.rows ?? []).map((d: any) => ({
          id: d.id,
          description: d.description,
          transaction_date: d.transaction_date,
          category: d.category,
          amount: d.amount == null ? 0 : Number(d.amount),
        }));

        if (alive) {
          setTransactions(parsed);
          setTotalPages(Number(data.totalPages ?? 1));
        }
      } catch (err: any) {
        // ✅ expected during quick typing / page changes / React strict mode
        if (err?.name === "AbortError") return;
        console.error("Fetch crashed:", err);
        if (alive) {
          setTransactions([]);
          setTotalPages(1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [page, searchTerm, sortOption]);

  const isAmountSort = sortOption === "amount-high" || sortOption === "amount-low";

  // Group by month-year WITHOUT re-sorting (preserve API order)
  const { groupedTransactions, monthKeys } = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const keys: string[] = [];

    for (const t of transactions) {
      const d = new Date(t.transaction_date);
      const monthYear = d.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) {
        groups[monthYear] = [];
        keys.push(monthYear);
      }
      groups[monthYear].push(t);
    }

    return { groupedTransactions: groups, monthKeys: keys };
  }, [transactions]);

  // Pagination window buttons
  const pagesToShow = useMemo(() => {
    const windowSize = 5;
    const start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let p = adjustedStart; p <= end; p++) pages.push(p);
    return pages;
  }, [page, totalPages]);

  const styles = {
    container: {
      maxWidth: "900px",
      marginLeft: "auto",
      marginRight: "auto",
    } as React.CSSProperties,
    input: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      background: "var(--surface)",
      color: "var(--foreground)",
      marginBottom: "1rem",
      fontSize: "1rem",
      outline: "none",
    } as React.CSSProperties,
    button: (disabled?: boolean) =>
      ({
        padding: "0.5rem 0.9rem",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        background: disabled ? "var(--surface-muted)" : "var(--surface)",
        color: "var(--foreground)",
        cursor: disabled ? "not-allowed" : "pointer",
      }) as React.CSSProperties,
    menu: {
      position: "absolute",
      right: 0,
      top: "2.75rem",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      zIndex: 10,
      overflow: "hidden",
      minWidth: "220px",
    } as React.CSSProperties,
    menuItem: (active: boolean) =>
      ({
        padding: "0.6rem 0.9rem",
        cursor: "pointer",
        background: active ? "var(--surface-muted)" : "var(--surface)",
        color: "var(--foreground)",
        borderBottom: "1px solid var(--border)",
      }) as React.CSSProperties,
    monthHeaderWrap: {
      background: "var(--surface)",
      padding: "0.75rem 1rem",
      borderRadius: "12px",
      marginBottom: "1rem",
      border: "1px solid var(--border)",
    } as React.CSSProperties,
    subtleText: { color: "var(--text-muted)" } as React.CSSProperties,
    dividerTop: {
      borderTop: "1px solid var(--border)",
      marginTop: "1rem",
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.input}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowSortMenu((v) => !v)} style={styles.button()}>
            Sort
          </button>

          {showSortMenu && (
            <div style={styles.menu}>
              {[
                { label: "Date (New to Old)", value: "date-new" },
                { label: "Date (Old to New)", value: "date-old" },
                { label: "Amount (High to Low)", value: "amount-high" },
                { label: "Amount (Low to High)", value: "amount-low" },
              ].map((opt, idx, arr) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setSortOption(opt.value as SortOption);
                    setShowSortMenu(false);
                  }}
                  style={{
                    ...styles.menuItem(sortOption === opt.value),
                    borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--border)",
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <p style={styles.subtleText}>Loading transactions...</p>
        </div>
      ) : (
        <>
          {isAmountSort ? (
            <TransactionsList transactions={transactions} />
          ) : (
            monthKeys.map((month) => (
              <div key={month} style={{ marginBottom: "2rem" }}>
                <div style={styles.monthHeaderWrap}>
                  <h2 className="text-2xl font-semibold" style={{ margin: 0 }}>
                    {month}
                  </h2>
                </div>
                <TransactionsList transactions={groupedTransactions[month]} />
              </div>
            ))
          )}

          <div
            style={{
              ...styles.dividerTop,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1.5rem 0 2rem",
              marginBottom: NAV_HEIGHT,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.button(page === 1)}
            >
              Prev
            </button>

            {page > 3 && totalPages > 6 && (
              <>
                <button onClick={() => setPage(1)} style={styles.button()}>
                  1
                </button>
                <span style={styles.subtleText}>…</span>
              </>
            )}

            {pagesToShow.map((p) => {
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    ...styles.button(),
                    background: isActive ? "var(--primary)" : "var(--surface)",
                    color: isActive ? "#fff" : "var(--foreground)",
                    borderColor: isActive ? "transparent" : "var(--border)",
                  }}
                >
                  {p}
                </button>
              );
            })}

            {page < totalPages - 2 && totalPages > 6 && (
              <>
                <span style={styles.subtleText}>…</span>
                <button onClick={() => setPage(totalPages)} style={styles.button()}>
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={styles.button(page >= totalPages)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}