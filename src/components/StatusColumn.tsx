import type { DocumentItem } from "@/data/documents";
import DocumentCard from "./DocumentCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatusColumnProps {
  title: string;
  count: number;
  documents: DocumentItem[];
  colorClass: string;
  active?: boolean;
  onClick?: () => void;
}

const StatusColumn = ({ title, count, documents, colorClass, active, onClick }: StatusColumnProps) => {
  return (
    <div
      className={`flex flex-col rounded-xl border transition-all duration-200 cursor-pointer ${
        active
          ? "border-primary/30 bg-card shadow-sm"
          : "border-border bg-muted/30 hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      {/* Column Header */}
      <div className="p-4 pb-3 flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-bold bg-secondary text-secondary-foreground rounded-full h-6 min-w-[1.5rem] flex items-center justify-center px-2">
          {count}
        </span>
      </div>

      {/* Document Grid */}
      <ScrollArea className="flex-1 px-3 pb-3" style={{ maxHeight: "calc(100vh - 180px)" }}>
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
          {documents.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No documents found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StatusColumn;
