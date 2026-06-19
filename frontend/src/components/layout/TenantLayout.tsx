import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, CreditCard, MessageSquare, User, Bell, QrCode } from "lucide-react";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/websocket";

const sidebarLinks = [
  { name: "Home", href: "/tenant", icon: Home },
  { name: "Payments", href: "/tenant/payments", icon: CreditCard },
  { name: "Complaints", href: "/tenant/complaints", icon: MessageSquare },
  { name: "Profile", href: "/tenant/profile", icon: User },
  { name: "Digital ID", href: "/tenant/id", icon: QrCode },
  { name: "Support", href: "/tenant/support", icon: MessageSquare },
  { name: "Settings", href: "/tenant/settings", icon: User },
];

export function TenantLayout() {
  const location = useLocation();
  useWebSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className={cn("w-64 flex-shrink-0 flex flex-col border-r border-gray-200 relative z-20", glassClasses.nav)}>
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <Link to="/tenant" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
              <Home size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">Phrydl<span className="text-accent">PG</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== '/tenant' && location.pathname.startsWith(link.href + '/'));
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-accent/10 text-accent font-semibold" 
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-accent" : "")} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Soft Warm Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 pointer-events-none"></div>

        {/* Topbar */}
        <header className={cn("h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-200 relative z-10", glassClasses.nav)}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {sidebarLinks.find(l => location.pathname === l.href || (l.href !== '/tenant' && location.pathname.startsWith(l.href)))?.name || "Tenant Portal"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/tenant/notifications">
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-black/5">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </Button>
            </Link>
            <UserNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto z-10 p-6 md:p-10 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
