import { Users } from "lucide-react";

interface Member {
  user_id: string;
  display_name: string;
  is_online: boolean;
  joined_at: string;
}

interface ContributorsSidebarProps {
  members: Member[];
  hostId: string;
}

const ContributorsSidebar = ({ members, hostId }: ContributorsSidebarProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Contributors</h3>
        <span className="ml-auto text-xs text-muted-foreground">{members.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {members.map((m) => (
          <div key={m.user_id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase">
                {m.display_name.slice(0, 2)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${m.is_online ? "bg-success" : "bg-muted-foreground/40"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">{m.display_name}</span>
                {m.user_id === hostId && (
                  <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">Host</span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                Joined {new Date(m.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributorsSidebar;
