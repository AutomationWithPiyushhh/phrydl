import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, MapPin, QrCode, FileText, ArrowRight, Loader2, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface TenantDashboardData {
  name: string;
  propertyName: string;
  roomNumber: string;
  currentRentDue: number;
  rentDueDate: string;
  activeNotices: { title: string; content: string; date: string }[];
  activeComplaints: { id: string; title: string; status: string }[];
}

export function TenantHome() {
  const { data: dashboardData, isLoading } = useQuery<TenantDashboardData>({
    queryKey: ['tenantDashboard'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Hi, {dashboardData.name} 👋</h2>
        <p className="text-gray-500 font-medium text-sm flex items-center mt-1">
          <MapPin className="w-3 h-3 mr-1" /> {dashboardData.propertyName}, Room {dashboardData.roomNumber}
        </p>
      </div>

      {/* Due Card */}
      <Card className="bg-gray-900 text-white border-0 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full mix-blend-screen filter blur-[40px] opacity-20"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Rent Due</p>
              <h3 className="text-3xl font-black tracking-tight text-white">₹{dashboardData.currentRentDue}</h3>
            </div>
            <div className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30">
              Due {dashboardData.rentDueDate}
            </div>
          </div>
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg font-bold rounded-xl h-12">
            <Link to="/tenant/payments">Pay Now</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: QrCode, label: "Digital ID", color: "bg-blue-50 text-blue-600 border-blue-100", link: "/tenant/id" },
          { icon: FileText, label: "Payments", color: "bg-purple-50 text-purple-600 border-purple-100", link: "/tenant/payments" },
          { icon: MessageSquare, label: "Complaints", color: "bg-orange-50 text-orange-600 border-orange-100", link: "/tenant/complaints" },
          { icon: User, label: "Profile", color: "bg-gray-50 text-gray-600 border-gray-100", link: "/tenant/profile" },
        ].map((action, i) => (
          <Link key={i} to={action.link} className="flex flex-col items-center gap-2">
            <button className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform active:scale-95", action.color)}>
              <action.icon className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-bold text-gray-600">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Active Complaints */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900">Active Tickets</h3>
          <Link to="/tenant/complaints" className="text-xs font-bold text-accent hover:underline">View All</Link>
        </div>
        {dashboardData.activeComplaints.length === 0 ? (
           <p className="text-sm text-gray-500 italic">No active tickets.</p>
        ) : (
          dashboardData.activeComplaints.map(complaint => (
            <Card key={complaint.id} className="bg-white border-gray-200 shadow-sm rounded-2xl mb-2">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{complaint.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {complaint.id}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded">{complaint.status}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Announcements */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Notice Board</h3>
        {dashboardData.activeNotices.map((notice, i) => (
          <Card key={i} className="bg-blue-50/50 border-blue-100 shadow-sm rounded-2xl mb-2">
            <CardContent className="p-4">
              <h4 className="font-bold text-sm text-gray-900">{notice.title}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {notice.content}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase">{notice.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
