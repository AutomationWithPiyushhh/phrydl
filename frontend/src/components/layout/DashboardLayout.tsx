import { Outlet, Link, useLocation } from "react-router-dom";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { Home, LayoutDashboard, Building, Users, Bed, CreditCard, Receipt, MessageSquare, Settings, Bell, Sparkles, TrendingUp, Target, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/context/AuthContext";
import { UserNav } from "@/components/layout/UserNav";

const allSidebarLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER', 'STAFF'] },
  { name: "Leads", href: "/leads", icon: Target, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Properties", href: "/properties", icon: Building, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Regions", href: "/regions", icon: Map, roles: ['SUPER_ADMIN'] },
  { name: "Tenants", href: "/tenants", icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Rooms & Beds", href: "/rooms", icon: Bed, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Payments", href: "/payments", icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Ledger", href: "/ledger", icon: Receipt, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER'] },
  { name: "Expenses", href: "/expenses", icon: Receipt, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER'] },
  { name: "Complaints", href: "/complaints", icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER', 'STAFF'] },
  { name: "AI Assistant", href: "/ai", icon: Sparkles, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: "Forecasting", href: "/forecasting", icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER'] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

function UnreadNotificationBadge() {
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  if (unreadCount === 0) return null;
  return (
    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  useWebSocket(); // Initialize WebSocket connection

  const sidebarLinks = allSidebarLinks.filter(link => user && link.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className={cn("w-64 flex-shrink-0 flex flex-col border-r border-gray-200 relative z-20", glassClasses.nav)}>
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
              <Home size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">Phrydl<span className="text-accent">PG</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
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
      </aside>      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Soft Warm Background Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 pointer-events-none"></div>

        {/* Topbar */}
        <header className={cn("h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-200 relative z-10", glassClasses.nav)}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {sidebarLinks.find(l => location.pathname.startsWith(l.href))?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-black/5">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <UnreadNotificationBadge />
              </Button>
            </Link>
            <Button className="hidden md:flex rounded-full bg-white text-foreground hover:bg-gray-50 border border-gray-200 shadow-sm backdrop-blur-md" asChild>
              <Link to="/settings">Invite Staff</Link>
            </Button>
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
