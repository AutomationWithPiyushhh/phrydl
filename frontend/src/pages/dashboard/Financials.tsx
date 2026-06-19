import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Financials() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data.data;
    }
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: async () => {
      return api.post('/invoices/generate');
    },
    onSuccess: () => {
      toast.success("Monthly invoices generated!");
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: () => toast.error("Failed to generate invoices")
  });

  const downloadInvoice = async (id: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      toast.error("Failed to download invoice");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financials</h1>
          <p className="text-muted-foreground">Manage invoices and track revenue.</p>
        </div>
        <Button 
          onClick={() => generateInvoicesMutation.mutate()} 
          disabled={generateInvoicesMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Generate Monthly Invoices
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>All generated invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!invoices || invoices.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found. Generate monthly invoices to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.tenant?.user?.firstName || 'Unknown'} (T-{inv.tenant?.tenantCode})</TableCell>
                      <TableCell>{inv.billingMonth}</TableCell>
                      <TableCell>Rs. {inv.totalAmount}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          inv.status === 'PAID' && "bg-green-100 text-green-800",
                          inv.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                          inv.status === 'OVERDUE' && "bg-red-100 text-red-800",
                        )}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadInvoice(inv.id, inv.invoiceNumber)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
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
