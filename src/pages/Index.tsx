import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mockDocuments } from "@/data/documents";
import { isDocumentApproved } from "@/data/documentStore";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Filter,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import FilterPanel from "@/components/FilterPanel";
import Header from "@/components/Header";
import fetchMockUser from "@/data/user";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatusTab = "to_be_processed" | "processed" | "exception";

const eventTypes = ["Distribution", "Re-org", "Redemption"];

const statusConfig: Record<
  StatusTab,
  { label: string; colorDot: string; textColor: string; bgActive: string }
> = {
  to_be_processed: {
    label: "To Be Processed",
    colorDot: "bg-column-pending",
    textColor: "text-primary",
    bgActive: "bg-primary/5 border-primary/25 ring-1 ring-primary/15",
  },
  processed: {
    label: "Processed",
    colorDot: "bg-column-processed",
    textColor: "text-success",
    bgActive: "bg-success/5 border-success/25 ring-1 ring-success/15",
  },
  exception: {
    label: "Exceptions",
    colorDot: "bg-column-exception",
    textColor: "text-destructive",
    bgActive:
      "bg-destructive/5 border-destructive/25 ring-1 ring-destructive/15",
  },
};

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<StatusTab | "all">(
    "to_be_processed",
  );
  // uploadedBy filter removed per spec

  // resizable left filter panel
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  // mobile filters open state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // unique uploaders removed - uploaded-by filter not used anymore

  const location = useLocation();

  useEffect(() => {
    // If navigation provided a tab in location state, switch to it (e.g., from DocumentViewer)
    const state: any = (location && (location as any).state) || {};
    const tab = state?.tab;
    if (
      tab &&
      (tab === "all" ||
        tab === "to_be_processed" ||
        tab === "processed" ||
        tab === "exception")
    ) {
      setActiveTab(tab);
    }
  }, [location]);

  const fileTypes = useMemo(() => {
    const set = new Set(
      mockDocuments.map((d) => {
        const parts = d.fileName.split(".");
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
      }),
    );
    return Array.from(set).filter(Boolean).sort();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return mockDocuments.filter((doc) => {
      // derive file type
      const parts = doc.fileName.split(".");
      const fileType =
        parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

      // search should match anywhere (file name, date, type, fileType, size)
      const matchesSearch =
        !s ||
        doc.fileName.toLowerCase().includes(s) ||
        doc.uploadDate.toLowerCase().includes(s) ||
        doc.type.toLowerCase().includes(s) ||
        fileType.includes(s) ||
        doc.fileSize.toLowerCase().includes(s);

      const matchesType =
        typeFilter.length === 0 || typeFilter.includes(doc.type);
      // file type filtering handled by column header; left panel no longer includes it
      const matchesFileType =
        fileTypeFilter.length === 0 || fileTypeFilter.includes(fileType);

      const docDate = new Date(doc.uploadDate);
      const matchesDateFrom = !dateFrom || docDate >= dateFrom;
      const matchesDateTo = !dateTo || docDate <= dateTo;

      // Status filter applies only when viewing processed tab
      let matchesStatus = true;
      if (activeTab === "processed" && statusFilter.length > 0) {
        const approved = isDocumentApproved(doc.id);
        const wantApproved = statusFilter.includes("approved");
        const wantPending = statusFilter.includes("pending");
        if (wantApproved && !wantPending) {
          matchesStatus = approved;
        } else if (!wantApproved && wantPending) {
          matchesStatus = !approved;
        } else {
          // both selected -> include both
          matchesStatus = true;
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesFileType &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesStatus &&
        true
      );
    });
  }, [
    search,
    typeFilter,
    fileTypeFilter,
    dateFrom,
    dateTo,
    statusFilter,
    activeTab,
  ]);

  // counts should reflect the overall dataset regardless of active filters
  const counts: Record<StatusTab, number> = {
    to_be_processed: mockDocuments.filter((d) => d.status === "to_be_processed")
      .length,
    processed: mockDocuments.filter((d) => d.status === "processed").length,
    exception: mockDocuments.filter((d) => d.status === "exception").length,
  };

  const activeDocuments =
    activeTab === "all"
      ? filtered
      : filtered.filter((d) => d.status === activeTab);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      // cycle: asc -> desc -> none
      if (sortDir === "asc") {
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const parseFileSize = (s: string) => {
    // e.g. "1.2 MB", "850 KB", "45 KB"
    if (!s) return 0;
    const parts = s.trim().split(/\s+/);
    if (parts.length === 0) return 0;
    const num = parseFloat(parts[0].replace(/,/g, "")) || 0;
    const unit = (parts[1] || "").toUpperCase();
    if (unit.startsWith("KB")) return num * 1024;
    if (unit.startsWith("MB")) return num * 1024 * 1024;
    if (unit.startsWith("GB")) return num * 1024 * 1024 * 1024;
    return num; // bytes or unknown
  };

  const sortedDocuments = useMemo(() => {
    if (!sortKey) return activeDocuments;
    const docs = [...activeDocuments];
    docs.sort((a, b) => {
      let av: any = (a as any)[sortKey];
      let bv: any = (b as any)[sortKey];
      if (sortKey === "uploadDate") {
        av = new Date(a.uploadDate).getTime();
        bv = new Date(b.uploadDate).getTime();
      }
      if (sortKey === "pages") {
        av = a.pages;
        bv = b.pages;
      }
      if (sortKey === "fileSize") {
        av = parseFileSize(a.fileSize || "");
        bv = parseFileSize(b.fileSize || "");
      }
      if (typeof av === "string" && typeof bv === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return docs;
  }, [activeDocuments, sortKey, sortDir]);

  const hasActiveFilters =
    typeFilter.length > 0 ||
    fileTypeFilter.length > 0 ||
    !!dateFrom ||
    !!dateTo ||
    (activeTab === "processed" && statusFilter.length > 0);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter([]);
    setFileTypeFilter([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatusFilter([]);
  };

  const dateLabel = useMemo(() => {
    if (dateFrom && dateTo)
      return `${format(dateFrom, "MMM dd")} — ${format(dateTo, "MMM dd")}`;
    if (dateFrom) return `From ${format(dateFrom, "MMM dd")}`;
    if (dateTo) return `To ${format(dateTo, "MMM dd")}`;
    return null;
  }, [dateFrom, dateTo]);

  return (
    <div className="flex w-full overflow-hidden bg-background h-screen flex-col">
      {/* Top header - full width branding */}
      <Header fetchUser={fetchMockUser} />

      {/* Main two-column area below header */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* desktop sidebar */}
        <div
          style={{ width: leftWidth }}
          className="shrink-0 border-r border-border flex flex-col hidden md:flex"
        >
          <FilterPanel
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onReset={resetFilters}
          />
        </div>
        {/* mobile overlay filters */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-background p-4 md:hidden">
            <div className="flex justify-end mb-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterPanel
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onReset={resetFilters}
            />
          </div>
        )}

        <div
          role="separator"
          onMouseDown={(e) => {
            e.preventDefault();
            startX.current = e.clientX;
            startWidth.current = leftWidth;

            const onMouseMove = (ev: MouseEvent) => {
              const dx = ev.clientX - startX.current;
              const newWidth = Math.min(
                Math.max(startWidth.current + dx, 260),
                520,
              );
              setLeftWidth(newWidth);
            };

            const onMouseUp = () => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
          className="w-1 cursor-col-resize bg-border h-full"
        />

        <div className="flex-1 min-h-0 flex flex-col px-6 pb-5">
          {/* Status cards */}
          <div className="shrink-0 px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total documents card */}
              <button
                key="total"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-all duration-150",
                  activeTab === "all"
                    ? statusConfig.to_be_processed.bgActive
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    All Documents
                  </span>
                </div>
                <p className={cn("text-2xl font-bold text-foreground")}>
                  {mockDocuments.length}
                </p>
              </button>

              {(Object.keys(statusConfig) as StatusTab[]).map((key) => {
                const cfg = statusConfig[key];
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left transition-all duration-150",
                      isActive
                        ? cfg.bgActive
                        : "border-border bg-card hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {/* meaningful icons per status */}
                      {key === "to_be_processed" && (
                        <Eye className="h-4 w-4 text-primary" />
                      )}
                      {key === "processed" && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {key === "exception" && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {cfg.label}
                      </span>
                    </div>
                    <p className={cn("text-2xl font-bold", cfg.textColor)}>
                      {counts[key]}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {activeTab === "to_be_processed" && (
                <div>Documents to be processed</div>
              )}
              {activeTab === "processed" && <div>Processed Documents</div>}
              {activeTab === "exception" && <div>Exceptions</div>}
            </div>
          </div>
          {/* Search + filter badges */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            {/* mobile filter button */}
            <button
              className="md:hidden p-1"
              onClick={() => setMobileFiltersOpen(true)}
              aria-label="Open filters"
            >
              <Filter className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="relative w-full max-w-[24rem]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files or uploaders…"
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {typeFilter.length > 0 &&
                  typeFilter.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="gap-1 text-[11px] h-6 px-2"
                    >
                      {t}
                      <X
                        className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() =>
                          setTypeFilter(typeFilter.filter((x) => x !== t))
                        }
                      />
                    </Badge>
                  ))}
                {activeTab === "processed" &&
                  statusFilter.length > 0 &&
                  statusFilter.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="gap-1 text-[11px] h-6 px-2"
                    >
                      {s === "approved" ? "Approved" : "Pending"}
                      <X
                        className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() =>
                          setStatusFilter(statusFilter.filter((x) => x !== s))
                        }
                      />
                    </Badge>
                  ))}
                {fileTypeFilter.length > 0 &&
                  fileTypeFilter.map((ft) => (
                    <Badge
                      key={ft}
                      variant="secondary"
                      className="gap-1 text-[11px] h-6 px-2"
                    >
                      {ft}
                      <X
                        className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() =>
                          setFileTypeFilter(
                            fileTypeFilter.filter((x) => x !== ft),
                          )
                        }
                      />
                    </Badge>
                  ))}
                {/* uploadedBy filter chip removed per spec */}
                {dateLabel && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[11px] h-6 px-2"
                  >
                    {dateLabel}
                    <X
                      className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                      onClick={() => {
                        setDateFrom(undefined);
                        setDateTo(undefined);
                      }}
                    />
                  </Badge>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border bg-card flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="overflow-auto flex-1 scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("fileName")}
                        className="flex items-center gap-1"
                      >
                        FILE NAME
                        <span className="text-[10px] ml-1 text-muted-foreground">
                          {sortKey === "fileName"
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : "⇅"}
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3 hidden sm:table-cell">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="h-auto text-[11px] border-none bg-transparent shadow-none p-0 gap-1 font-semibold text-muted-foreground uppercase tracking-wider w-auto min-h-0 flex items-center">
                            <Filter className="h-2.5 w-2.5 opacity-50" />
                            <span className="ml-1">Event Type</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3">
                          <div className="space-y-2">
                            {eventTypes.map((type) => (
                              <label
                                key={type}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={typeFilter.includes(type)}
                                  onCheckedChange={() => {
                                    if (typeFilter.includes(type)) {
                                      setTypeFilter(
                                        typeFilter.filter((t) => t !== type),
                                      );
                                    } else {
                                      setTypeFilter([...typeFilter, type]);
                                    }
                                  }}
                                  className="border-border"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {type}
                                </span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableHead>

                    {/* Uploaded By column removed per spec */}
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                              <Calendar className="h-2.5 w-2.5 opacity-50" />
                              {dateLabel || "Date"}
                            </button>
                          </PopoverTrigger>
                        </Popover>
                        <button
                          type="button"
                          onClick={() => toggleSort("uploadDate")}
                          className="text-[11px] text-muted-foreground"
                          aria-label="Sort by date"
                        >
                          {sortKey === "uploadDate"
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : "⇅"}
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="h-auto text-[11px] border-none bg-transparent shadow-none p-0 gap-1 font-semibold text-muted-foreground uppercase tracking-wider w-auto min-h-0 flex items-center">
                            <Filter className="h-2.5 w-2.5 opacity-50" />
                            <span className="ml-1">File Type</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3">
                          <div className="space-y-2">
                            {fileTypes.map((ft) => (
                              <label
                                key={ft}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={fileTypeFilter.includes(ft)}
                                  onCheckedChange={() => {
                                    if (fileTypeFilter.includes(ft)) {
                                      setFileTypeFilter(
                                        fileTypeFilter.filter((x) => x !== ft),
                                      );
                                    } else {
                                      setFileTypeFilter([
                                        ...fileTypeFilter,
                                        ft,
                                      ]);
                                    }
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {ft}
                                </span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3 hidden sm:table-cell">
                      <button
                        type="button"
                        onClick={() => toggleSort("fileSize")}
                        className="flex items-center gap-1"
                      >
                        SIZE
                        <span className="text-[10px] ml-1 text-muted-foreground">
                          {sortKey === "fileSize"
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : "⇅"}
                        </span>
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3 hidden sm:table-cell">
                      <button
                        type="button"
                        onClick={() => toggleSort("pages")}
                        className="flex items-center gap-1"
                      >
                        PAGES
                        <span className="text-[10px] ml-1 text-muted-foreground">
                          {sortKey === "pages"
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : "⇅"}
                        </span>
                      </button>
                    </TableHead>
                    {activeTab === "processed" && (
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="h-auto text-[11px] border-none bg-transparent shadow-none p-0 gap-1 font-semibold text-muted-foreground uppercase tracking-wider w-auto min-h-0 flex items-center">
                              <Filter className="h-2.5 w-2.5 opacity-50" />
                              <span className="ml-1">Status</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-3">
                            <div className="space-y-2">
                              {[
                                { key: "approved", label: "Approved" },
                                { key: "pending", label: "Pending" },
                              ].map((s) => (
                                <label
                                  key={s.key}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Checkbox
                                    checked={statusFilter.includes(s.key)}
                                    onCheckedChange={() => {
                                      if (statusFilter.includes(s.key)) {
                                        setStatusFilter(
                                          statusFilter.filter(
                                            (x) => x !== s.key,
                                          ),
                                        );
                                      } else {
                                        setStatusFilter([
                                          ...statusFilter,
                                          s.key,
                                        ]);
                                      }
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {s.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>
                    )}
                    {activeTab !== "to_be_processed" &&
                      activeTab !== "exception" && (
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider h-9 px-3 w-20">
                          ACTION
                        </TableHead>
                      )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((doc) => {
                    const docApproved = isDocumentApproved(doc.id);
                    const parts = doc.fileName.split(".");
                    const fileType =
                      parts.length > 1
                        ? parts[parts.length - 1].toLowerCase()
                        : "";
                    const isDocProcessed = doc.status === "processed";
                    return (
                      <TableRow
                        key={doc.id}
                        className={cn(
                          (isDocProcessed
                            ? "cursor-pointer"
                            : "cursor-default") + " transition-colors",
                          docApproved
                            ? "bg-success/[0.03] hover:bg-success/[0.07]"
                            : "hover:bg-muted/30",
                        )}
                        onClick={() => {
                          if (isDocProcessed) navigate(`/document/${doc.id}`);
                        }}
                      >
                        <TableCell className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <FileText
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                docApproved ? "text-success" : "text-primary",
                              )}
                            />
                            <span className="text-[13px] font-medium text-foreground truncate max-w-[220px]">
                              {doc.fileName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <span className="text-xs text-muted-foreground">
                            {doc.type}
                          </span>
                        </TableCell>

                        {/* Uploaded By column removed per spec */}
                        <TableCell className="py-2.5 px-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {doc.uploadDate}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {fileType}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {doc.fileSize}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {doc.pages}
                          </span>
                        </TableCell>
                        {activeTab === "processed" && (
                          <TableCell className="py-2.5 px-3">
                            {docApproved ? (
                              <Badge className="bg-success/15 text-success border-success/30 gap-1 text-[10px] h-5 px-1.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground text-[10px] h-5 px-1.5"
                              >
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        {activeTab !== "to_be_processed" &&
                          activeTab !== "exception" && (
                            <TableCell className="py-2.5 px-3">
                              {doc.status === "processed" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-primary hover:text-primary px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/document/${doc.id}`);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              ) : null}
                            </TableCell>
                          )}
                      </TableRow>
                    );
                  })}
                  {activeDocuments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-16 text-center text-sm text-muted-foreground"
                      >
                        No documents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
