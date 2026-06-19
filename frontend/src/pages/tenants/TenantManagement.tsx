import { useState } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, Clock, Download, Edit, LogOut, Bed } from "lucide-react";
import { useTenants } from "@/hooks/useTenants";
import { OnboardTenantModal } from "@/components/modals/OnboardTenantModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tenants, isLoading, error } = useTenants();

  const { data: stats } = useQuery({
    queryKey: ['tenants-stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/tenants/stats');
        return res.data.data;
      } catch(e) {
        return { active: 0, paymentDue: 0, noticePeriod: 0, kycPending: 0 };
      }
    }
  });

  const handleExport = () => {
    if (!tenants) return;
    const headers = ["ID", "Name", "Email", "Phone", "Property", "Room", "Bed", "Status", "Check-In Date"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + tenants.map(t => `${t.id},"${t.name}",${t.email},${t.phone},${t.propertyName},${t.roomNumber},${t.bedNumber},${t.status},${t.checkInDate}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tenants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load tenants</div>;

  const filteredTenants = tenants?.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Tenant Directory</h1>
          <p className="text-gray-500">Manage onboarding, KYC, and rent lifecycles.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className={cn("rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-900", glassClasses.base)}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6">
            <Plus className="w-4 h-4 mr-2" /> Onboard Tenant
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Active", value: (stats?.active || tenants?.length || 0).toString(), icon: UserCheck, color: "text-green-600" },
          { label: "Payment Due", value: (stats?.paymentDue || 0).toString(), icon: Clock, color: "text-orange-500" },
          { label: "Notice Period", value: (stats?.noticePeriod || 0).toString(), icon: UserX, color: "text-gray-500" },
          { label: "KYC Pending", value: (stats?.kycPending || 0).toString(), icon: Clock, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-gray-200 bg-white", glassClasses.card)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search tenant or ID..." 
                className="pl-9 h-10 rounded-lg border-gray-200 bg-white text-gray-900 focus-visible:ring-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-40 shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAYMENT_DUE">Payment Due</SelectItem>
                  <SelectItem value="NOTICE_PERIOD">Notice Period</SelectItem>
                  <SelectItem value="KYC_PENDING">KYC Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Property & Room</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent-foreground">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{tenant.name}</div>
                        <div className="text-xs text-gray-500">{tenant.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tenant.propertyName}</div>
                    <div className="text-xs text-gray-500">Room: {tenant.roomNumber} ({tenant.bedNumber})</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tenant.phone}</div>
                    <div className="text-xs text-gray-500">{tenant.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", 
                      tenant.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" :
                      tenant.status === "PAYMENT_DUE" ? "bg-red-50 text-red-700 border-red-200" :
                      tenant.status === "NOTICE_PERIOD" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert("Edit Tenant")}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("Allocate Bed")}><Bed className="w-4 h-4 mr-2" /> Allocate Bed</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("Move Out")} className="text-red-600"><LogOut className="w-4 h-4 mr-2" /> Move Out</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <OnboardTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
