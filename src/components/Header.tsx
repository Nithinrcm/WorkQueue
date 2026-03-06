import ProfileMenu from "./ProfileMenu";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  fetchUser?: () => Promise<any>;
  onBack?: () => void;
  showBrand?: boolean;
}

export default function Header({
  fetchUser,
  onBack,
  showBrand = true,
}: HeaderProps) {
  if (!showBrand) {
    return (
      <header className="shrink-0 border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            {onBack ? (
              <Button size="sm" variant="secondary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to dashboard</span>
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <ProfileMenu fetchUser={fetchUser} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="shrink-0 border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted/50"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div
            className="flex items-center justify-center h-10 w-10 rounded-lg"
            style={{ backgroundColor: "rgb(31,69,124)" }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">
              Document Processing Platform
            </div>
            <div className="text-sm text-muted-foreground">
              Human Review & Sign-Off
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProfileMenu fetchUser={fetchUser} />
        </div>
      </div>
    </header>
  );
}
