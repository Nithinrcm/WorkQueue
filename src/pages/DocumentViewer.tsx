import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Maximize2,
  Download,
  Minimize2,
  RotateCw,
  Search,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import Header from "@/components/Header";
import fetchMockUser from "@/data/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// select dropdown no longer needed after review comments removed
// dialog for editing removed
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { mockDocuments } from "@/data/documents";
import {
  getDocumentFields,
  getPdfContent,
  type DocumentField,
} from "@/data/documentFields";
import {
  saveDocumentData,
  getSavedDocumentData,
  getFieldPageMap,
  approveDocument,
  isDocumentApproved,
} from "@/data/documentStore";
import { toast } from "@/hooks/use-toast";

const DocumentViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const doc = mockDocuments.find((d) => d.id === id);

  const initialFields = useMemo(() => {
    if (!doc) return [];
    const baseFields = getDocumentFields(doc);
    const saved = getSavedDocumentData(doc.id);
    if (saved) {
      return baseFields.map((f) => ({
        ...f,
        value:
          saved.fields[f.key] !== undefined ? saved.fields[f.key] : f.value,
      }));
    }
    return baseFields;
  }, [doc]);

  // no review comments any more

  const [fields, setFields] = useState<DocumentField[]>(initialFields);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [approved, setApproved] = useState(() =>
    doc ? isDocumentApproved(doc.id) : false,
  );
  const [eventType, setEventType] = useState<string>(() => {
    if (!doc) return "Distribution";
    const saved = getSavedDocumentData(doc.id);
    return saved?.eventType || doc.type;
  });

  const totalPages = doc?.pages || 1;
  const fieldPageMap = useMemo(
    () => (doc ? getFieldPageMap(doc.type) : {}),
    [doc],
  );

  // Resizable left panel state
  const MIN_LEFT = 450;
  const [leftWidth, setLeftWidth] = useState<number>(450); // default wider so value boxes look roomy
  const dragRef = useRef({ dragging: false, startX: 0, startWidth: 288 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const RESERVED_RIGHT = 280;

  useEffect(() => {
    // cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", onMouseMove as any);
      window.removeEventListener("mouseup", onMouseUp as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      window.removeEventListener("touchend", onMouseUp as any);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // keep leftWidth clamped to available container width so it doesn't get cut off
  const handleResize = () => {
    const max = 720;
    const containerWidth =
      containerRef.current?.clientWidth ?? window.innerWidth;
    // reserve space for the right pane
    const allowedMaxRaw = containerWidth - RESERVED_RIGHT;
    // clamp allowedMax but never go below MIN_LEFT
    const allowedMax = Math.min(max, Math.max(MIN_LEFT, allowedMaxRaw));
    setLeftWidth((prev) => Math.min(prev, allowedMax));
  };

  useEffect(() => {
    // initial clamp
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    let newWidth = dragRef.current.startWidth + dx;
    const min = MIN_LEFT;
    const max = 720;
    const containerWidth =
      containerRef.current?.clientWidth ?? window.innerWidth;
    const allowedMax = Math.min(
      max,
      Math.max(40, containerWidth - RESERVED_RIGHT),
    );
    if (newWidth < min) newWidth = min;
    if (newWidth > allowedMax) newWidth = allowedMax;
    setLeftWidth(newWidth);
  };

  const onMouseUp = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX);
    e.preventDefault();
  };

  const startDrag = (clientX: number) => {
    dragRef.current.dragging = true;
    dragRef.current.startX = clientX;
    dragRef.current.startWidth = leftWidth;
    window.addEventListener("mousemove", onMouseMove as any);
    window.addEventListener("mouseup", onMouseUp as any);
    window.addEventListener(
      "touchmove",
      onTouchMove as any,
      { passive: false } as any,
    );
    window.addEventListener("touchend", onMouseUp as any);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragRef.current.dragging) return;
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    let newWidth = dragRef.current.startWidth + dx;
    const min = MIN_LEFT;
    const max = 720;
    const containerWidth =
      containerRef.current?.clientWidth ?? window.innerWidth;
    const allowedMax = Math.min(
      max,
      Math.max(40, containerWidth - RESERVED_RIGHT),
    );
    if (newWidth < min) newWidth = min;
    if (newWidth > allowedMax) newWidth = allowedMax;
    setLeftWidth(newWidth);
    e.preventDefault();
  };

  const pdfContent = useMemo(
    () => (doc ? getPdfContent(doc, undefined, currentPage) : []),
    [doc, currentPage],
  );

  // UI state for PDF toolbar
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // state used for editing in-place
  const [editingKey, setEditingKey] = useState<string | null>(null); // may still track focus
  const [fitMode, setFitMode] = useState<"width" | "screen">("width");
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const [zoomInput, setZoomInput] = useState<string>(String(zoomPercent));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setZoomInput(String(zoomPercent));
  }, [zoomPercent]);

  const toggleFit = () => {
    if (fitMode === "width") {
      setFitMode("screen");
      setZoomPercent(50);
    } else {
      setFitMode("width");
      setZoomPercent(100);
    }
  };

  const fieldsByCategory = useMemo(() => {
    const groups: Record<string, DocumentField[]> = {};
    fields.forEach((f) => {
      const cat = f.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [fields]);

  // count of fields that have been manually modified compared to the
  // original extraction. This is what used to be shown as
  // "Reviewed x/y" at the top of the fields panel.
  const reviewedCount = useMemo(() => {
    if (!doc) return 0;
    const originalFields = getDocumentFields(doc);
    return fields.filter((f) => {
      const orig = originalFields.find((o) => o.key === f.key);
      // consider undefined vs empty string also a change
      return orig && f.value !== orig.value;
    }).length;
  }, [fields, doc]);

  // per-category sort state (none | asc | desc)
  const [categorySort, setCategorySort] = useState<
    Record<string, "none" | "asc" | "desc">
  >({});

  const toggleCategorySort = (cat: string) => {
    setCategorySort((prev) => {
      const cur = prev[cat] || "none";
      const next = cur === "none" ? "asc" : cur === "asc" ? "desc" : "none";
      return { ...prev, [cat]: next };
    });
  };

  const sortedFieldsByCategory = useMemo(() => {
    const map: Record<string, DocumentField[]> = {};
    Object.entries(fieldsByCategory).forEach(([cat, catFields]) => {
      const sortDir = categorySort[cat] || "none";
      if (sortDir === "none") {
        map[cat] = catFields;
        return;
      }
      const copy = [...catFields];
      copy.sort((a, b) => {
        const ca = a.confidence ?? 0;
        const cb = b.confidence ?? 0;
        return sortDir === "asc" ? ca - cb : cb - ca;
      });
      map[cat] = copy;
    });
    return map;
  }, [fieldsByCategory, categorySort]);

  const handleFieldClick = useCallback(
    (fieldKey: string) => {
      setActiveField(fieldKey);
      const page = fieldPageMap[fieldKey];
      if (page && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [fieldPageMap, currentPage],
  );

  const activeFieldValue = useMemo(() => {
    if (!activeField || !doc) return null;
    const field = fields.find((f) => f.key === activeField);
    if (!field) return null;
    const originalFields = getDocumentFields(doc);
    const original = originalFields.find((f) => f.key === activeField);
    return original?.value || null;
  }, [activeField, fields, doc]);

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Document not found</p>
          <Button
            onClick={() => navigate("/", { state: { tab: "processed" } })}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isProcessed = doc.status === "processed";
  const isException = doc.status === "exception";
  const isToBeProcessed = doc.status === "to_be_processed";

  const updateField = (key: string, value: string) => {
    if (approved) return;
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const handleApproveAll = () => {
    approveDocument(doc.id, fields, eventType);
    setApproved(true);
    toast({
      title: "Document approved",
      description: `All extracted fields for ${doc.fileName} have been approved.`,
    });
  };

  const handleSaveAndClose = (key?: string) => {
    // persist current fields
    saveDocumentData(doc.id, fields, eventType);
    setEditingKey(null);
    if (key) {
      toast({ title: "Field saved" });
    }
  };

  // removal of edit dialog and review comments; inline editing only

  // reviewedCount removed; no per-field review tracking

  const renderPdfLine = (
    line: { text: string; isHighlighted: boolean; fieldKey?: string },
    i: number,
  ) => {
    if (line.text === "") {
      return <div key={i} className="h-4" />;
    }

    const isTitle = i === 0;
    const shouldHighlight =
      activeField && line.fieldKey === activeField && activeFieldValue;

    // Prioritize active field highlight
    if (shouldHighlight && activeFieldValue) {
      const idx = line.text.indexOf(activeFieldValue);
      if (idx !== -1) {
        const before = line.text.slice(0, idx);
        const match = line.text.slice(idx, idx + activeFieldValue.length);
        const after = line.text.slice(idx + activeFieldValue.length);
        return (
          <div
            key={i}
            className={`py-0.5 cursor-default ${isTitle ? "text-sm font-bold tracking-wide mb-1" : ""}`}
          >
            {before}
            <mark className="bg-warning/50 text-foreground rounded-sm px-0.5 py-px">
              {match}
            </mark>
            {after}
          </div>
        );
      }
    }

    // If there's a search query, highlight the first match (case-insensitive)
    if (searchQuery && searchQuery.trim()) {
      const sq = searchQuery.trim().toLowerCase();
      const lower = line.text.toLowerCase();
      const idx = lower.indexOf(sq);
      if (idx !== -1) {
        const before = line.text.slice(0, idx);
        const match = line.text.slice(idx, idx + sq.length);
        const after = line.text.slice(idx + sq.length);
        return (
          <div
            key={i}
            className={`py-0.5 cursor-default ${isTitle ? "text-sm font-bold tracking-wide mb-1" : ""}`}
          >
            {before}
            <mark className="bg-warning/50 text-foreground rounded-sm px-0.5 py-px">
              {match}
            </mark>
            {after}
          </div>
        );
      }
    }

    return (
      <div
        key={i}
        className={`py-0.5 cursor-default ${isTitle ? "text-sm font-bold tracking-wide mb-1" : ""}`}
      >
        {line.text}
      </div>
    );
  };

  const fieldsPanel = (
    <div className="flex flex-col h-full">
      {/* Header area (non-scrollable) */}
      <div className="shrink-0 p-3 border-b border-border bg-card">
        {/* first row: back button on left, reviewed count on right */}
        <div className="flex items-center justify-between mb-1">
          {/* slim small back button with text */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/", { state: { tab: "processed" } })}
            className="gap-1 h-6 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
          <span className="text-sm text-muted-foreground">
            Reviewed {reviewedCount}/{fields.length}
          </span>
        </div>

        {/* second row: title only */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Extracted Fields
          </h3>
          <div className="flex items-center gap-2">
            {!approved && (
              <Button
                size="sm"
                onClick={handleApproveAll}
                className="gap-1.5 h-9 text-sm bg-primary text-white hover:bg-primary/90"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve All
              </Button>
            )}
            {approved && (
              <div className="rounded-md bg-success/10 border border-success/25 px-3 py-2 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="text-xs font-medium text-success">
                  All fields approved
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Scrollable fields */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            {Object.entries(sortedFieldsByCategory).map(
              ([category, catFields]) => (
                <Collapsible key={category} defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full py-1 px-2 rounded hover:bg-muted/50 transition-colors group">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </span>
                    {/* per-category sort button - stopPropagation so it doesn't toggle the collapsible */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategorySort(category);
                      }}
                      className="h-6 w-6 text-[11px] ml-2"
                      aria-label={`Toggle sort for ${category}`}
                    >
                      {categorySort[category] === "asc"
                        ? "▲"
                        : categorySort[category] === "desc"
                          ? "▼"
                          : "⇅"}
                    </Button>
                    <span className="text-[9px] text-muted-foreground/50 ml-auto tabular-nums">
                      {catFields.length}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 top-1 pl-1 pt-1 pb-2">
                      {catFields.map((field) => (
                        <div
                          key={field.key}
                          className="relative px-2 pr-16 py-1 transition-all duration-100 cursor-pointer"
                          onClick={() => handleFieldClick(field.key)}
                        >
                          <div className="mb-2 flex items-center">
                            <Label className="text-[11px] font-semibold text-foreground uppercase tracking-wider pointer-events-none flex-1 flex items-center gap-1">
                              {field.label}
                            </Label>

                            {/* Cluster the confidence pill (edit button removed) */}
                            <div className="absolute right-3 z-10 flex items-center gap-2">
                              {typeof field.confidence === "number" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <span
                                        className={
                                          `text-[11px] font-medium px-2 py-0.5 rounded-full bg-transparent select-none ` +
                                          (field.confidence >= 95
                                            ? "text-success"
                                            : field.confidence >= 90
                                              ? "text-warning"
                                              : "text-destructive")
                                        }
                                      >
                                        {Math.round(field.confidence)}%
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Confidence: {field.confidence}%
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* direct inline editing available; no buttons */}
                            </div>
                          </div>
                          {!approved ? (
                            <Input
                              value={field.value}
                              onChange={(e) =>
                                updateField(field.key, e.target.value)
                              }
                              onFocus={() => handleFieldClick(field.key)}
                              onBlur={() => handleSaveAndClose(field.key)}
                              className={`mt-1 h-8 text-sm bg-background border-border ${
                                activeField === field.key
                                  ? "bg-primary/8 ring-1 ring-primary/25"
                                  : ""
                              } text-foreground pr-20 w-full hover:bg-muted/45`}
                            />
                          ) : (
                            <div
                              className={`mt-1 rounded-md bg-background border border-border px-2 py-2 text-muted-foreground font-mono text-sm pr-20 w-full ${
                                activeField === field.key
                                  ? "bg-primary/8 ring-1 ring-primary/25"
                                  : ""
                              } hover:bg-muted/45`}
                            >
                              {field.value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ),
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const pdfPanel = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 🔹 Header (fixed) */}
      <div className="shrink-0 px-5 py-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">
              Redemption Notice – Series 2025A
            </h2>
            {/* page count removed as requested */}
          </div>

          {/* removed fullscreen button per request */}
        </div>

        {/* 🔹 Controls */}
        <div className="mt-3 flex items-center gap-3">
          {/* Zoom group: -, +, fit-to-width */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomPercent((z) => Math.max(25, z - 10))}
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="inline-flex items-center border border-border rounded-md bg-background h-7">
              <Input
                type="text"
                inputMode="numeric"
                value={zoomInput}
                onChange={(e) => setZoomInput(e.target.value)}
                onBlur={() => {
                  const n =
                    parseInt(zoomInput.replace(/[^0-9]/g, "") || "0", 10) || 0;
                  const clamped = Math.min(400, Math.max(25, n));
                  setZoomPercent(clamped);
                  setZoomInput(String(clamped));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n =
                      parseInt(zoomInput.replace(/[^0-9]/g, "") || "0", 10) ||
                      0;
                    const clamped = Math.min(400, Math.max(25, n));
                    setZoomPercent(clamped);
                    setZoomInput(String(clamped));
                  }
                }}
                className="w-16 text-center h-7 bg-transparent border-0 outline-none focus:ring-0"
              />
              <div className="px-1 text-sm h-7 flex items-center justify-center bg-transparent rounded-r-md">
                %
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoomPercent((z) => Math.min(400, z + 10))}
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Page indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md bg-background px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Input
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  const n =
                    parseInt(pageInput.replace(/[^0-9]/g, "") || "0", 10) || 1;
                  const clamped = Math.min(totalPages, Math.max(1, n));
                  setCurrentPage(clamped);
                  setPageInput(String(clamped));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n =
                      parseInt(pageInput.replace(/[^0-9]/g, "") || "0", 10) ||
                      1;
                    const clamped = Math.min(totalPages, Math.max(1, n));
                    setCurrentPage(clamped);
                    setPageInput(String(clamped));
                  }
                }}
                className="w-16 text-center h-7 mx-2"
              />

              <div className="text-sm text-muted-foreground">of</div>
              <div className="mx-2 text-sm font-medium tabular-nums">
                {totalPages}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                // rotate placeholder (no actual rotate implemented)
                toast({
                  title: "Rotate",
                  description: "Rotate action not implemented",
                });
              }}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFit}
              aria-label={
                fitMode === "width" ? "Fit to screen" : "Fit to width"
              }
            >
              {fitMode === "width" ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search + Download beside each other */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="pl-9 h-9"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                // download currently simply triggers a toast in this mock
                toast({ title: "Download", description: "Download triggered" });
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🔹 Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="min-h-full bg-muted/40 flex justify-center px-6 py-6">
          <div className="w-full max-w-[720px] bg-background border border-border rounded-xl shadow-sm overflow-hidden">
            {/* ✅ Zoom logic */}
            <div
              className="px-10 py-10 mx-auto"
              style={{
                fontSize: `${zoomPercent}%`,
                lineHeight: zoomPercent > 120 ? "1.8" : "1.6",
                transition: "font-size 0.15s ease",
              }}
            >
              <div className="font-sans text-foreground">
                {pdfContent.map((line, i) => renderPdfLine(line, i))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // compute an effective left width that never exceeds available container space
  const effectiveLeftWidth = Math.min(
    leftWidth,
    Math.max(
      MIN_LEFT,
      (containerRef.current?.clientWidth ?? window.innerWidth) - RESERVED_RIGHT,
    ),
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* use the same branded header as the dashboard; back button will live
          inside the fields panel instead */}
      <Header fetchUser={fetchMockUser} />

      {/* Content */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 w-full overflow-hidden"
      >
        {/* ================= LEFT PANEL ================= */}
        {isProcessed && (
          <aside
            className="hidden md:flex border-r border-border bg-card flex-col"
            style={{
              flex: `0 0 ${effectiveLeftWidth}px`,
              width: effectiveLeftWidth,
              maxWidth: `calc(100% - ${RESERVED_RIGHT}px)`,
            }}
          >
              {/* insert a small back button at top of panel */}
                  {/* render fieldsPanel with back button integrated in header */}
                  {fieldsPanel}
          </aside>
        )}

        {/* ================= EXCEPTION PANEL ================= */}
        {isException && (
          <aside
            className="hidden md:flex border-r border-border bg-card flex-col"
            style={{
              flex: `0 0 ${effectiveLeftWidth}px`,
              width: effectiveLeftWidth,
              maxWidth: `calc(100% - ${RESERVED_RIGHT}px)`,
            }}
          >
            <div className="p-4">
              <h3 className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-2">
                Exception Details
              </h3>
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs text-foreground leading-relaxed">
                  {doc.exceptionReason ||
                    "Unknown error occurred during processing."}
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* ================= RESIZER ================= */}
        {(isProcessed || isException) && (
          <div
            className="hidden md:flex items-stretch"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
          >
            <div
              onMouseDown={onMouseDown}
              onTouchStart={(e) => startDrag(e.touches[0].clientX)}
              className="w-3 cursor-col-resize mx-auto my-2 rounded bg-transparent hover:bg-border/60"
            />
          </div>
        )}

        {/* ================= RIGHT PANEL (PDF) ================= */}
        <div className="flex-1 min-w-0 flex flex-col bg-muted/30">
          {pdfPanel}
        </div>
      </div>
      {/* review dialog removed; editing done inline */}
    </div>
  );
};

export default DocumentViewer;
