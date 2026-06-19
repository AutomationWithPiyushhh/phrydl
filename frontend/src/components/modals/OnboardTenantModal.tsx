import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function OnboardTenantModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    monthlyRent: "",
    securityDeposit: "",
    occupation: "",
    employerOrCollege: "",
    emergencyContact: "",
    permanentAddress: ""
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      let photoUrl = "";
      if (profilePhoto) {
        const pData = new FormData();
        pData.append("file", profilePhoto);
        const uploadRes = await api.post("/upload/tenant-photo", pData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        photoUrl = uploadRes.data.data;
      }

      const payload = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber
        },
        monthlyRent: parseFloat(data.monthlyRent),
        securityDeposit: parseFloat(data.securityDeposit),
        occupation: data.occupation,
        employerOrCollege: data.employerOrCollege,
        emergencyContact: data.emergencyContact,
        permanentAddress: data.permanentAddress,
        profilePhotoUrl: photoUrl
      };

      return api.post('/tenants', payload);
    },
    onSuccess: () => {
      toast.success("Tenant onboarded successfully!");
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to onboard tenant")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.monthlyRent || !formData.securityDeposit) {
      toast.error("Please fill all required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agreed Monthly Rent (₹) *</Label>
              <Input required type="number" value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Security Deposit (₹) *</Label>
              <Input required type="number" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Select value={formData.occupation} onValueChange={(val) => setFormData({...formData, occupation: val})}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PROFESSIONAL">IT Professional</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employer or College</Label>
              <Input value={formData.employerOrCollege} onChange={e => setFormData({...formData, employerOrCollege: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact</Label>
            <Input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} placeholder="Name - Phone" />
          </div>

          <div className="space-y-2">
            <Label>Permanent Address</Label>
            <Input value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} />
          </div>

          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Onboard Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
