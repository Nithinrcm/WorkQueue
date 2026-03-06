import {
  Filter,
  Calendar,
  Tag,
  User,
  ChevronDown,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FilterPanelProps {
  typeFilter: string[];
  onTypeFilterChange: (val: string[]) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (val: Date | undefined) => void;
  onDateToChange: (val: Date | undefined) => void;
  onReset: () => void;
  onFilesUpload?: (files: File[]) => void;
}

const eventTypes = ["Distribution", "Re-org", "Redemption"];

const FilterPanel = ({
  typeFilter,
  onTypeFilterChange,

  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
  onFilesUpload,
}: FilterPanelProps) => {
  const toggleType = (type: string) => {
    if (typeFilter.includes(type)) {
      onTypeFilterChange(typeFilter.filter((t) => t !== type));
    } else {
      onTypeFilterChange([...typeFilter, type]);
    }
  };

  const [eventOpen, setEventOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setStagedFiles((s) => [...s, ...Array.from(files)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleConfirmUpload = () => {
    // log to console for debugging if no handler is provided
    console.log("FilterPanel: confirming upload", stagedFiles);
    if (onFilesUpload) onFilesUpload(stagedFiles);
    setStagedFiles([]);
    setUploadOpen(false);
  };

  return (
    <aside className="h-full flex flex-col border-r overflow-hidden bg-slate-100">
      {/* Top bar: Upload on the top-right. Filters heading appears below. */}
      <div className="p-3 border-b border-border">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-9 px-4 flex items-center justify-center gap-2"
              aria-label="Upload files"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="text-sm">Upload a file</span>
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload documents</DialogTitle>
              <DialogDescription>
                Drag and drop files here or use the picker to upload.
              </DialogDescription>
            </DialogHeader>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="mt-4 mb-4 rounded-md border-2 border-dashed border-border bg-background p-6 text-center"
            >
              <input
                id="filterpanel-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <label
                htmlFor="filterpanel-upload-input"
                className="cursor-pointer inline-flex items-center gap-2"
              >
                <div className="text-sm text-muted-foreground">
                  Drag files here or{" "}
                </div>
                <div className="text-sm text-primary underline">browse</div>
              </label>
              <div className="mt-3 text-xs text-muted-foreground">
                Accepted: PDFs, images, docs
              </div>
            </div>

            {stagedFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-auto">
                {stagedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2">{f.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(f.size / 1024)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="mt-4">
              <div className="flex items-center justify-end gap-2 w-full">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStagedFiles([]);
                    setUploadOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={stagedFiles.length === 0}
                >
                  Upload
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* no close button on panel */}
      {/* Scrollable filter content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
        <div className="flex items-start flex-col">
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>
        {/* Event Type — popover with checkboxes (chevron trigger) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3 w-3" />
              Event Type
            </Label>
            <button
              aria-expanded={eventOpen}
              aria-controls="event-types-list"
              onClick={() => setEventOpen((v) => !v)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-slate-100"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  eventOpen && "-rotate-180",
                )}
              />
            </button>
          </div>
          {eventOpen && (
            <div id="event-types-list" className="space-y-2 pt-2">
              {eventTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={typeFilter.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                    className="border-slate-400 bg-white"
                  />
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded By filter removed per new spec */}

        {/* File type filter removed as per spec; left panel only contains event type and date range */}

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Date Range
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-sm h-9 bg-white border border-border text-foreground rounded-md px-2",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => {
                    if (!d) {
                      onDateFromChange(undefined);
                      return;
                    }
                    // If to-date exists and new from > to, reject and show toast
                    if (dateTo && d > dateTo) {
                      toast({
                        variant: "destructive",
                        title: "Invalid date range",
                        description: "From date cannot be greater than To date",
                      });
                      return;
                    }
                    onDateFromChange(d);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-sm h-9 bg-white border border-border text-foreground rounded-md px-2",
                    !dateTo && "text-muted-foreground",
                  )}
                >
                  {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={(d) => {
                    if (!d) {
                      onDateToChange(undefined);
                      return;
                    }
                    // If from-date exists and new to < from, reject and show toast
                    if (dateFrom && d < dateFrom) {
                      toast({
                        variant: "destructive",
                        title: "Invalid date range",
                        description: "To date cannot be earlier than From date",
                      });
                      return;
                    }
                    onDateToChange(d);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* inline error message removed; errors are now shown via toast */}
        </div>
      </div>

      {/* Fixed reset button at bottom */}
      <div className="p-5 border-t border-border shrink-0 bg-transparent">
        <Button
          variant="default"
          onClick={onReset}
          className="w-full bg-white text-foreground hover:bg-slate-50 text-sm h-9 rounded-md"
        >
          <Filter className="h-3.5 w-3.5 mr-2 text-foreground" />
          Reset Filters
        </Button>
      </div>
    </aside>
  );
};

export default FilterPanel;
