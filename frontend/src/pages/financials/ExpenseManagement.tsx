import { useState } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Filter, Plus, PieChart, Zap, Droplet, Wifi, Utensils, Wrench, Briefcase, FileText, Download, Edit, Trash2 } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseModal } from "@/components/modals/ExpenseModal";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'electricity': return { icon: Zap, color: 'text-yellow-600' };
    case 'water': return { icon: Droplet, color: 'text-blue-600' };
    case 'internet': return { icon: Wifi, color: 'text-purple-600' };
    case 'food': return { icon: Utensils, color: 'text-orange-600' };
    case 'maintenance': return { icon: Wrench, color: 'text-gray-600' };
    case 'salaries': return { icon: Briefcase, color: 'text-green-600' };
    default: return { icon: FileText, color: 'text-gray-500' };
  }
};

export function ExpenseManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading, error } = useExpenses();
  const { data: stats } = useQuery({
    queryKey: ['expenses-stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/expenses/stats');
        return res.data.data;
      } catch (e) {
        return { totalExpenses: 0, paid: 0, pending: 0, breakdown: [] };
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-stats'] });
    },
    onError: () => toast.error("Failed to delete expense")
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (!expenses) return;
    const headers = ["ID", "Category", "Property", "Title", "Amount", "Status", "Date", "Bill URL"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + expenses.map(e => `${e.id},${e.category},${e.propertyName},"${e.title}",${e.amount},${e.status},${e.expenseDate},${e.billUrl || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load expenses</div>;

  const filteredExpenses = expenses?.filter(e => 
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalAmount = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Expense Center</h1>
          <p className="text-gray-500">Track operating costs, maintenance, and utility bills.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className={cn("rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50", glassClasses.base)}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button 
            onClick={() => { setSelectedExpenseId(null); setIsModalOpen(true); }}
            className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className={cn("lg:col-span-1 border-gray-200 bg-accent/10", glassClasses.card)}>
          <CardContent className="p-8 flex flex-col justify-center h-full">
            <h3 className="text-gray-600 font-semibold mb-2 uppercase tracking-wider text-xs">Total Expenses (MTD)</h3>
            <div className="text-5xl font-black mb-4 tracking-tighter text-gray-900">₹{((stats?.totalExpenses || 0) / 1000).toFixed(1)}K</div>
            <div className="flex justify-between mt-4">
               <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Paid</p>
                  <p className="font-bold text-green-600">₹{(stats?.paid || 0).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pending</p>
                  <p className="font-bold text-orange-500">₹{(stats?.pending || 0).toLocaleString()}</p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("lg:col-span-2 border-gray-200 bg-white", glassClasses.card)}>
          <CardHeader>
            <CardTitle className="text-gray-900">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {stats?.breakdown?.map((cat: any, i: number) => (
              <div key={i} className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-gray-500 text-xs font-semibold mb-2">{cat.category}</div>
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-gray-900">₹{cat.amount.toLocaleString()}</div>
                </div>
              </div>
            )) || <div className="text-muted-foreground p-4">No breakdown available yet</div>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-6">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-gray-200 w-full flex-1">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <Input 
            placeholder="Search by category, property, or ID..." 
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-10 px-2 text-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className={cn("rounded-2xl h-14 px-6 border-gray-200 bg-white text-gray-900 hover:bg-gray-50", glassClasses.base)}>
          <Filter className="w-5 h-5 mr-2" /> Filter By Month
        </Button>
      </div>

      <Card className={cn("border-gray-200 bg-white overflow-hidden", glassClasses.panel)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Property</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredExpenses.map((exp) => {
                const { icon: Icon, color } = getCategoryIcon(exp.category);
                return (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <Icon className={cn("w-5 h-5", color)} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{exp.category}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{exp.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{exp.propertyName}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", 
                        exp.status === "PAID" ? "bg-green-50 text-green-700 border-green-200" :
                        exp.status === "PENDING" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => { setSelectedExpenseId(exp.id); setIsModalOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(exp.id)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} expenseId={selectedExpenseId} />
    </div>
  );
}
