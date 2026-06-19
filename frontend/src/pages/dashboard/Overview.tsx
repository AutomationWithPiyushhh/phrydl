import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { Building, Users, Home, TrendingUp, CreditCard, Activity, Sparkles, ArrowRight, Download, FileText, FileSpreadsheet, Target, MousePointerClick, CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardKPIs } from "@/hooks/useDashboard";
import { useAuth } from "@/context/AuthContext";
import jsPDF from "jspdf";
import { toast } from "sonner";


export function DashboardOverview() {
  const { data, isLoading, error } = useDashboardKPIs();
  const { user } = useAuth();

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load dashboard data</div>;

  const kpis = [
    { title: "Total Properties", value: data?.kpis.totalProperties || 0, trend: "+2", icon: Building },
    { title: "Total Tenants", value: data?.kpis.totalTenants || 0, trend: "+14%", icon: Users },
    { title: "Occupancy Rate", value: `${data?.kpis.occupancyRate?.toFixed(1) || 0}%`, trend: "+3%", icon: Home },
    { title: "Open Complaints", value: data?.kpis.openComplaints || 0, trend: "-5", icon: Activity },
  ];

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'REGION_MANAGER') {
    kpis.splice(3, 0, 
      { title: "Monthly Revenue", value: `₹${((data?.kpis.monthlyRevenue || 0) / 100000).toFixed(1)}L`, trend: "+9.4%", icon: TrendingUp },
      { title: "Outstanding Dues", value: `₹${((data?.kpis.outstandingDues || 0) / 1000).toFixed(1)}K`, trend: "-12%", icon: CreditCard },
      { title: "Monthly Expenses", value: `₹${((data?.kpis.monthlyExpenses || 0) / 100000).toFixed(1)}L`, trend: "-4%", icon: Activity },
      { title: "Lead Conversion", value: `${data?.kpis.leadConversionRate?.toFixed(1) || 0}%`, trend: "+2%", icon: Users },
      { title: "Complaint Resolution", value: `${data?.kpis.complaintResolutionRate?.toFixed(1) || 0}%`, trend: "+5%", icon: Activity },
      { title: "Revenue per Bed", value: `₹${((data?.kpis.revenuePerBed || 0) / 1000).toFixed(1)}K`, trend: "+4%", icon: TrendingUp },
      { title: "Profit Margin", value: `${data?.kpis.netProfit?.toFixed(1) || 0}%`, trend: "+1.2%", icon: Activity },
      { title: "Tenant Churn", value: `${data?.kpis.churnRate?.toFixed(1) || 0}%`, trend: "-0.5%", icon: Users }
    );
  }

  const revenueData = data?.revenueTrend.map(r => ({ month: r.name, revenue: r.current / 100000 })) || [];
  const occupancyData = data?.occupancyTrend.map(o => ({ property: o.name, rate: o.current })) || [];

  const handleExportPDF = () => {
    if (!data) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("PhrydlPG Executive Report", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      
      doc.setFontSize(16);
      doc.text("1. Executive Summary", 20, 45);
      
      doc.setFontSize(12);
      let y = 55;
      kpis.forEach((kpi) => {
        doc.text(`${kpi.title}: ${kpi.value} (${kpi.trend})`, 25, y);
        y += 10;
      });

      y += 10;
      doc.setFontSize(16);
      doc.text("2. Occupancy by Property", 20, y);
      y += 10;
      doc.setFontSize(12);
      data.occupancyTrend.forEach((occ) => {
        doc.text(`${occ.name}: ${occ.current}%`, 25, y);
        y += 10;
      });

      y += 10;
      doc.setFontSize(16);
      doc.text("3. Revenue Trend (Last 6 Months)", 20, y);
      y += 10;
      doc.setFontSize(12);
      data.revenueTrend.forEach((rev) => {
        doc.text(`${rev.name}: ₹${rev.current.toLocaleString()}`, 25, y);
        y += 10;
      });

      doc.save("phrydlpg-report.pdf");
      toast.success("PDF Report generated successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    try {
      let csv = "Category,Metric,Value,Trend\n";
      kpis.forEach(kpi => {
        csv += `KPI,${kpi.title},${kpi.value},${kpi.trend}\n`;
      });
      csv += "\nProperty,Occupancy Rate (%)\n";
      data.occupancyTrend.forEach(occ => {
        csv += `${occ.name},${occ.current}\n`;
      });
      csv += "\nMonth,Revenue\n";
      data.revenueTrend.forEach(rev => {
        csv += `${rev.name},${rev.current}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "phrydlpg-data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Export downloaded");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500">Welcome back, here's what's happening across your properties today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} variant="outline" className={cn("rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-900", glassClasses.base)}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className={cn("rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-900", glassClasses.base)}>
            <FileText className="w-4 h-4 mr-2 text-red-500" /> Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className={cn("overflow-hidden group", glassClasses.card)}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                  <kpi.icon size={20} />
                </div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  kpi.trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights - Apple/Gemini Style */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={cn("md:col-span-2 relative overflow-hidden", glassClasses.panel)}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="w-5 h-5 text-accent" /> AI Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-lg text-gray-600 leading-relaxed font-medium mb-6">
              "Revenue is up 9.4% this month, primarily driven by 100% occupancy at the BTM Layout property. We project a 5% drop in cash flow next week due to 15 pending rent renewals at Whitefield."
            </p>
            <div className="flex gap-4">
              <button className="text-sm font-semibold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                Generate Full Report <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                View Renewals
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("relative overflow-hidden bg-accent", glassClasses.card)}>
          <CardContent className="p-6 h-full flex flex-col justify-between relative z-10 text-accent-foreground">
            <div>
              <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center mb-4">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1">Portfolio Health</h3>
              <p className="text-sm text-accent-foreground/80">Excellent standing</p>
            </div>
            <div className="mt-6">
              <div className="text-5xl font-black tracking-tighter">94<span className="text-2xl text-accent-foreground/70">/100</span></div>
              <p className="text-xs font-medium mt-2">+2 points from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Only visible to Admins */}
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={cn(glassClasses.card)}>
            <CardHeader>
              <CardTitle className="text-gray-900">Revenue Growth (Lakhs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFC83D" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFC83D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#111111', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#FFC83D" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(glassClasses.card)}>
            <CardHeader>
              <CardTitle className="text-gray-900">Property Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="property" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#111111', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="rate" fill="#111111" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Landing Page Analytics */}
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'MANAGER') && data?.landingPageAnalytics && (
        <div className="mt-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" /> Landing Page Analytics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <Target className="w-6 h-6 mb-2 text-blue-500" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.totalLeads}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <MousePointerClick className="w-6 h-6 mb-2 text-green-500" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.bookRoomClicks}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Book Clicks</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <CalendarCheck className="w-6 h-6 mb-2 text-purple-500" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.scheduleVisitClicks}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visit Clicks</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <MessageCircle className="w-6 h-6 mb-2 text-green-600" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.whatsappClicks}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Clicks</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <Phone className="w-6 h-6 mb-2 text-indigo-500" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.callClicks}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Call Clicks</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <FileText className="w-6 h-6 mb-2 text-orange-500" />
                <p className="text-2xl font-black text-gray-900">{data.landingPageAnalytics.contactFormSubmissions}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Subs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
