import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TenantProfile() {
  const { user, login } = useAuth(); // Assume login can also refresh user context if modified, or just refresh window.
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    phoneNumber: '+91 98765 43210', 
    emergencyContact: '+91 91234 56789',
    address: '123 Main St, City'
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tenantProfile'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard'); // Use dashboard to fetch tenant info temporarily, or just read from user context
      return response.data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put('/tenant/profile', formData);
      return response.data;
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.emergencyContact || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }
    updateMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h2>
      
      <Card className="bg-white border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.email.split('@')[0]}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
              <p className="text-sm font-medium mt-1">{formData.phoneNumber}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Emergency Contact</label>
              <p className="text-sm font-medium mt-1">{formData.emergencyContact}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Government ID</label>
              <p className="text-sm font-medium mt-1">Uploaded (Aadhar)</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 rounded-xl">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-gray-900">Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input required type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Emergency Contact</label>
                    <input required type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Address</label>
                    <textarea required className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white min-h-[60px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={updateMutation.isPending} className="w-full bg-accent text-accent-foreground rounded-xl mt-4">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
