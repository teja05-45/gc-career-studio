"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Search, Inbox, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, LEAD_STATUS_LABELS, CAREER_STAGE_LABELS } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  careerStage: string;
  currentRole?: string | null;
  status: string;
  createdAt: Date | string;
  service?: { title: string } | null;
};

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  NEW: "default",
  CONTACTED: "warning",
  QUALIFIED: "success",
  CONVERTED: "success",
  CLOSED: "destructive",
};

export function AdminLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce the search input so filtering doesn't fire a fetch per keystroke.
  // The ~300ms window lets a rapid typist settle before the first request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  async function fetchLeads() {
    setLoading(true);
    setError(false);
    try {
      const query = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/leads?${query}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setTotal(data.total);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <EmptyState
          icon={SearchX}
          title="Unable to load leads"
          description="Something went wrong fetching leads. Please try again."
          action={
            <Button variant="outline" onClick={fetchLeads}>
              Try again
            </Button>
          }
        />
      )}

      {!error && loading && (
        <LeadsTableSkeleton />
      )}

      {!error && !loading && total === 0 && (
        <EmptyState
          icon={Inbox}
          title="No leads yet"
          description="Contact-form inquiries will appear here once submitted."
        />
      )}

      {!error && !loading && total > 0 && leads.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No leads match your search"
          description="Try adjusting your search term or status filter."
        />
      )}

      {!error && !loading && leads.length > 0 && (
        <div>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Career stage</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors duration-150 hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lead.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{CAREER_STAGE_LABELS[lead.careerStage] || lead.careerStage}</td>
                    <td className="px-6 py-4 text-muted-foreground">{lead.service?.title || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusColors[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(lead.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/leads/${lead.id}`}>
                          View <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {leads.map((lead) => (
              <li key={lead.id} className="flex items-start justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {CAREER_STAGE_LABELS[lead.careerStage] || lead.careerStage}
                    {lead.service?.title ? ` · ${lead.service.title}` : ""}
                  </p>
                  <Badge variant={statusColors[lead.status]} className="mt-2">
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                  <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(lead.createdAt)}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" asChild>
                  <Link href={`/admin/leads/${lead.id}`} aria-label={`View lead ${lead.name}`}>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Skeleton placeholders shown while the first leads request is in flight. */
function LeadsTableSkeleton() {
  return (
    <div>
      {/* Desktop skeleton rows */}
      <div className="hidden md:block">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Mobile skeleton cards */}
      <div className="space-y-4 p-2 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 px-6 py-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}