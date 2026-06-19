import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

type ExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  expenseId?: string | null;
};

export function ExpenseModal({ isOpen, onClose, expenseId }: ExpenseModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    propertyId: "",
    title: "",
    category: "",
    amount: "",
    status: "PAID",
    expenseDate: new Date().toISOString().split('T')[0],
    description: "",
  });
  const [billFile, setBillFile] = useState<File | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get('/properties');
      return res.data.data;
    }
  });

  const { data: existingExpense } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      if (!expenseId) return null;
      const res = await api.get(`/expenses/${expenseId}`);
      return res.data.data;
    },
    enabled: !!expenseId
  });

  useEffect(() => {
    if (existingExpense) {
      setFormData({
        propertyId: existingExpense.propertyId || "",
        title: existingExpense.title || "",
        category: existingExpense.category || "",
        amount: existingExpense.amount?.toString() || "",
        status: existingExpense.status || "PAID",
        expenseDate: existingExpense.expenseDate || new Date().toISOString().split('T')[0],
        description: existingExpense.description || "",
      });
    } else {
      setFormData({
        propertyId: "",
        title: "",
        category: "",
        amount: "",
        status: "PAID",
        expenseDate: new Date().toISOString().split('T')[0],
        description: "",
      });
      setBillFile(null);
    }
  }, [existingExpense, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      let billUrl = existingExpense?.billUrl;

      if (billFile) {
        const formData = new FormData();
        formData.append("file", billFile);
        const uploadRes = await api.post("/upload/expense-bill", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        billUrl = uploadRes.data.data;
      }

      const payload = { ...data, amount: parseFloat(data.amount), billUrl };
      
      if (expenseId) {
        return api.put(`/expenses/${expenseId}`, payload);
      } else {
        return api.post('/expenses', payload);
      }
    },
    onSuccess: () => {
      toast.success(`Expense ${expenseId ? 'updated' : 'added'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-stats'] });
      onClose();
    },
    onError: () => toast.error("Failed to save expense")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.title || !formData.amount || !formData.category) {
      toast.error("Please fill required fields");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expenseId ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Property *</Label>
            <Select value={formData.propertyId} onValueChange={(val) => setFormData({...formData, propertyId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                  <SelectItem value="SALARY">Staff Salary</SelectItem>
                  <SelectItem value="FOOD">Food & Groceries</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title/Description *</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g., Plumber fix" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input required type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attach Bill / Receipt</Label>
            <div className="flex items-center gap-2">
              <Input type="file" onChange={(e) => setBillFile(e.target.files?.[0] || null)} className="flex-1" accept="image/*,.pdf" />
              {existingExpense?.billUrl && !billFile && (
                <Button type="button" variant="outline" onClick={() => window.open(existingExpense.billUrl, '_blank')}>View</Button>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
