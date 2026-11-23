import { Bell, BellRing, Megaphone, Settings2 } from "../common/icons";
import { getOrg } from "../../data/organizations";
import { useBarangayAlerts } from "../../hooks/useBarangayAlerts";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import { useReports } from "../../context/ReportsContext";
import { getCategory } from "../../data/categories";
import { local } from "../../services/storageService";
import { cn } from "../../lib/cn";
import { alertFeed, formatRelative, severityColor, severityOf } from "../../lib/reportUtils";

const SEEN_KEY = "kadaan:seen-alerts";

/** In-app notification feed (simulated). No push notifications are sent anywhere. */
export function NotificationCenter() {
  const { scope, openReport, openModal, alertPrefs } = useApp();
  const { reports } = useReports();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(
    () => new Set(local.read<string[]>(SEEN_KEY, [])),
  );
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // On phones the panel is fixed to the screen. It is moved to <body> because a blurred (glass) parent
  // would otherwise become the containing block and push the panel off-screen.
  const [phone, setPhone] = useState(
    () => !window.matchMedia("(min-width: 640px)").matches,
  );
  const portal = (node: React.ReactNode) =>
    phone ? createPortal(node, document.body) : node;
  const followed = alertPrefs.barangays;
  const feed = useMemo(
    () => alertFeed(reports, scope, followed).slice(0, 8),
    [reports, scope, followed],
  );
  const allOfficial = useBarangayAlerts();
  const official = useMemo(
    () =>
      allOfficial
        .filter(
          (a) =>
            followed.length === 0 ||
            a.barangays.some((b) => followed.includes(b)),
        )
        .slice(0, 5),
    [allOfficial, followed],
  );
  const unread =
    feed.filter((r) => !seen.has(r.id)).length +
    official.filter((a) => !seen.has(`a:${a.id}`)).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) &&
      !panelRef.current?.contains(e.target as Node) &&
      setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllSeen = () => {
    const next = new Set([
      ...seen,
      ...feed.map((r) => r.id),
      ...official.map((a) => `a:${a.id}`),
    ]);
    setSeen(next);
    local.write(SEEN_KEY, [...next]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setPhone(!window.matchMedia("(min-width: 640px)").matches);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={`Road alerts${unread ? `, ${unread} unread` : ""}`}
        className="relative grid size-11 cursor-pointer place-items-center rounded-xl text-ink transition hover:bg-ink/5"
      >
        {unread ? <BellRing className="size-5" /> : <Bell className="size-5" />}
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
      {open &&
        portal(
          <div
            ref={panelRef}
            className="fixed inset-x-3 top-[68px] z-[900] animate-fade-in rounded-2xl border border-line bg-surface shadow-lift sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="font-display font-bold">Road alerts</p>
                <p className="text-xs text-muted">
                  {followed.length === 0
                    ? "All of Iligan City"
                    : followed.length <= 2
                      ? `Brgy. ${followed.join(", ")}`
                      : `${followed.length} barangays you follow`}
                </p>
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllSeen}
                  className="min-h-11 cursor-pointer px-1 text-xs font-semibold text-forest hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-[min(60vh,420px)] divide-y divide-line overflow-y-auto">
              {feed.length === 0 && official.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  No active alerts in this area.
                </li>
              )}
              {official.map((a) => (
                <li key={`a:${a.id}`}>
                  <button
                    onClick={() => {
                      const next = new Set(seen).add(`a:${a.id}`);
                      setSeen(next);
                      local.write(SEEN_KEY, [...next]);
                      if (a.report_id) {
                        setOpen(false);
                        openReport(a.report_id);
                      }
                    }}
                    className={cn(
                      "flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition hover:bg-canvas",
                      !seen.has(`a:${a.id}`) && "bg-mint/25",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl text-white",
                        a.severity === "high"
                          ? "bg-red-600"
                          : a.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-slate-500",
                      )}
                    >
                      <Megaphone className="size-4" weight="fill" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {a.message}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        Official alert ·{" "}
                        {getOrg(a.office_id)?.short ??
                          a.office_id.toUpperCase()}{" "}
                        · {a.barangays.slice(0, 2).join(", ")}
                        {a.barangays.length > 2
                          ? ` +${a.barangays.length - 2}`
                          : ""}{" "}
                        · {formatRelative(a.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {feed.map((r) => {
                const c = getCategory(r.category);
                const Icon = c.icon;
                const sev = severityOf(r);
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        const next = new Set(seen).add(r.id);
                        setSeen(next);
                        local.write(SEEN_KEY, [...next]);
                        openReport(r.id);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition hover:bg-canvas",
                        !seen.has(r.id) && "bg-mint/25",
                      )}
                    >
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-xl"
                        style={{ background: severityColor(r).bg, color: severityColor(r).fg }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink">
                            {r.title}
                          </span>
                          {sev === "high" && (
                            <span className="shrink-0 rounded bg-red-50 px-1.5 text-[10px] font-bold text-red-700 uppercase">
                              High
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {r.location}
                          {r.barangay ? ` · ${r.barangay}` : ""} ·{" "}
                          {formatRelative(r.createdAt)}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-semibold tracking-wide text-muted/80 uppercase">
                          {r.roadStatus?.kind === "closed"
                            ? "Officially closed · "
                            : ""}
                          {r.source === "demo"
                            ? "Sample data"
                            : r.source === "user"
                              ? "Your report"
                              : "Community report"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openModal("alerts");
              }}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-t border-line px-4 py-2.5 text-left text-xs font-semibold text-forest hover:bg-canvas"
            >
              <Settings2 className="size-4" />
              {followed.length
                ? "Change barangays & SMS alerts"
                : "Follow your barangays for targeted & SMS alerts"}
            </button>
          </div>,
        )}
    </div>
  );
}
