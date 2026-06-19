import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

export function TenantComplaints() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Electrical', priority: 'Medium' });

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['tenantComplaints'],
    queryFn: async () => {
      const response = await api.get('/tenant/complaints');
      return response.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/tenant/complaints', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantComplaints'] });
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', category: 'Electrical', priority: 'Medium' });
      toast.success("Ticket created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }
    createMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Tickets</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900">Create New Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Title</label>
                <input required type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" placeholder="E.g. AC not cooling" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea required className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white min-h-[100px]" placeholder="Describe the issue..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Electrical</option>
                    <option>Plumbing</option>
                    <option>Internet</option>
                    <option>Cleaning</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Priority</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-accent text-accent-foreground rounded-xl mt-4">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complaints?.map((complaint) => (
          <Card key={complaint.id} className="bg-white border-gray-200 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-900">{complaint.title}</h4>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                  complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 
                  complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium bg-gray-100 px-2 py-1 rounded">{complaint.category}</span>
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
