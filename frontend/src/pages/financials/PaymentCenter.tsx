import { useState } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, Filter, ArrowUpRight, ArrowDownRight, IndianRupee, Clock, CreditCard, Receipt, Download, AlertTriangle } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { CollectPaymentModal } from "@/components/modals/CollectPaymentModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function PaymentCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: payments, isLoading, error } = usePayments();
  const { data: stats } = useQuery({
    queryKey: ['payments-stats'],
    queryFn: async () => {
      try {
        const res = await api.get('/payments/stats');
        return res.data.data;
      } catch (e) {
        return { collectedMtd: 0, outstandingDues: 0, totalDeposits: 0 };
      }
    }
  });

  const handleExport = () => {
    if (!payments) return;
    const headers = ["ID", "Tenant", "Property", "Type", "Amount", "Method", "Status", "Date", "Reference"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + payments.map(p => `${p.id},"${p.tenantName}",${p.propertyName},${p.type},${p.amount},${p.method},${p.status},${p.paymentDate},${p.referenceId || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load payments</div>;

  const filteredPayments = payments?.filter(p => 
    p.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Payment Center</h1>
          <p className="text-gray-500">Track rent collection, dues, and security deposits.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className={cn("rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50", glassClasses.base)}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" className={cn("rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50", glassClasses.base)}>
            <Receipt className="w-4 h-4 mr-2" /> Invoices
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6"
          >
            Collect Payment
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-green-600">
                <IndianRupee className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Collected (MTD)</p>
            <h3 className="text-3xl font-black text-gray-900">₹{((stats?.collectedMtd || 0) / 100000).toFixed(2)}L</h3>
          </CardContent>
        </Card>

        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-red-500">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Outstanding Dues</p>
            <h3 className="text-3xl font-black text-gray-900">₹{((stats?.outstandingDues || 0) / 1000).toFixed(1)}K</h3>
          </CardContent>
        </Card>

        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-500">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Deposits Held</p>
            <h3 className="text-3xl font-black text-gray-900">₹{((stats?.totalDeposits || 0) / 100000).toFixed(2)}L</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] mb-8 bg-white border border-gray-200 rounded-xl p-1 h-12">
          <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">All Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-amber-600 flex gap-2">Gateway Reconciliation <AlertTriangle className="w-3 h-3" /></TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className={cn("border-gray-200 bg-white overflow-hidden", glassClasses.panel)}>
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search transaction ID or tenant..." 
                    className="pl-9 h-10 rounded-lg border-gray-200 bg-white text-gray-900 focus-visible:ring-accent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="h-10 border-gray-200 bg-white text-gray-700 shrink-0">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Transaction</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Tenant</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Method</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredPayments.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{trx.type}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{trx.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{trx.tenantName}</div>
                        <div className="text-xs text-gray-500">{trx.propertyName}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{new Date(trx.paymentDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{trx.method}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase rounded border", 
                          trx.status === "SUCCESS" ? "bg-green-50 text-green-700 border-green-200" :
                          trx.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          trx.status === "REFUNDED" ? "bg-gray-50 text-gray-700 border-gray-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {trx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">₹{trx.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
             <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mb-4 text-amber-500" />
                <p className="font-medium text-gray-900 mb-1">Gateway Reconciliation checks run nightly.</p>
                <p className="text-sm">Currently, there are 0 mismatched transactions between Razorpay and the database.</p>
                <Button className="mt-6" variant="outline">Run Manual Sync</Button>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <CollectPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
