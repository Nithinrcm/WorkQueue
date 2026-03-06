import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface UserProfile {
  name: string;
  role?: string;
  email?: string;
}

interface ProfileMenuProps {
  fetchUser?: () => Promise<UserProfile | null>;
}

export default function ProfileMenu({ fetchUser }: ProfileMenuProps) {
  // fetch immediately so initials/avatar are available without needing to open the popover
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (fetchUser && !user && !loading) {
        setLoading(true);
        try {
          const u = await fetchUser();
          if (mounted && u) setUser(u);
        } catch (e) {
          // ignore for now
        } finally {
          if (mounted) setLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : loading
      ? ""
      : "?";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full bg-primary text-white"
        >
          {initials || "?"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        {loading && !user ? (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : user ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.role}</div>
            {user.email && (
              <div className="text-xs text-muted-foreground">{user.email}</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No profile available
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
