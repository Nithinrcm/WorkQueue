import { FileText, Eye, Calendar, User, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { DocumentItem } from "@/data/documents";

interface DocumentCardProps {
  document: DocumentItem;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-card border border-border rounded-lg p-3.5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-card-foreground truncate leading-tight">
            {document.fileName}
          </h4>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers className="h-3 w-3 shrink-0" />
              <span>{document.type}</span>
              <span className="text-border">•</span>
              <span>{document.fileSize}</span>
              <span className="text-border">•</span>
              <span>{document.pages} pg</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{document.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{document.uploadDate}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <Button
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs font-medium"
          onClick={() => navigate(`/document/${document.id}`)}
        >
          <Eye className="h-3 w-3 mr-1.5" />
          View Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentCard;
