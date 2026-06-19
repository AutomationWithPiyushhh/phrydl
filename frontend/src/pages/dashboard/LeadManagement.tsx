import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Phone, MessageCircle, ExternalLink, Calendar, User, Search, Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";

type Lead = {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  gender: string;
  occupation: string;
  preferredLocation: string;
  roomType: string;
  moveInDate: string;
  additionalRequirements: string;
  source: string;
  assignedTo: string | null;
  remarks: string | null;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  VISIT_SCHEDULED: "bg-purple-100 text-purple-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  CONVERTED: "bg-green-100 text-green-800",
  LOST: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function LeadManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.get('/leads');
      return res.data.data as Lead[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return api.put(`/leads/${id}/status?status=${status}`);
    },
    onSuccess: () => {
      toast.success("Lead status updated");
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error("Failed to update status")
  });

  const convertToTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/leads/${id}/convert`);
    },
    onSuccess: () => {
      toast.success("Lead successfully converted to Tenant!");
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error("Failed to convert lead")
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading leads...</div>;
  }

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(search.toLowerCase()) || lead.mobileNumber.includes(search);
    const matchesStatus = filterStatus === "ALL" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Management</h1>
          <p className="text-muted-foreground">Track, manage, and convert inquiries into tenants.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or mobile..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="VISIT_SCHEDULED">Visit Scheduled</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Lead Info</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No leads found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-foreground">{lead.fullName}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {lead.mobileNumber}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(lead.createdAt))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1 text-sm">
                          <span><strong>Loc:</strong> {lead.preferredLocation}</span>
                          <span><strong>Room:</strong> {lead.roomType}</span>
                          <span><strong>Move-in:</strong> {lead.moveInDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50">{lead.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={lead.status} 
                          onValueChange={(val) => updateStatusMutation.mutate({ id: lead.id, status: val })}
                        >
                          <SelectTrigger className={cn("h-8 w-[140px] text-xs font-semibold", statusColors[lead.status] || "bg-gray-100")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="VISIT_SCHEDULED">Visit Scheduled</SelectItem>
                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                            <SelectItem value="CONVERTED">Converted</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {lead.status !== "CONVERTED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              onClick={() => convertToTenantMutation.mutate(lead.id)}
                              disabled={convertToTenantMutation.isPending}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Convert
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => window.open(`https://wa.me/${lead.mobileNumber.replace(/\D/g,'')}`, '_blank')}
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => window.location.href = `tel:${lead.mobileNumber}`}
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
