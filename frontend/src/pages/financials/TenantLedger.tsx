import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, FileText, IndianRupee, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassClasses } from "@/lib/glass";

interface LedgerEntry {
  id: string;
  transactionDate: string;
  type: string; // INVOICE_GENERATED, PAYMENT_RECEIVED, DEPOSIT_RECEIVED, LATE_FEE_APPLIED, MANUAL_ADJUSTMENT
  amount: number;
  description: string;
  referenceId: string;
}

export function TenantLedger() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await api.get('/tenants');
      return res.data.data;
    }
  });

  const { data: ledgerEntries, isLoading } = useQuery<LedgerEntry[]>({
    queryKey: ['tenantLedger', selectedTenant],
    queryFn: async () => {
      if (!selectedTenant) return [];
      const res = await api.get(`/financials/ledger/${selectedTenant}`);
      return res.data.data;
    },
    enabled: !!selectedTenant
  });

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'PAYMENT_RECEIVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'INVOICE_GENERATED': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LATE_FEE_APPLIED': return 'text-red-600 bg-red-50 border-red-200';
      case 'DEPOSIT_RECEIVED': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'DEPOSIT_REFUNDED': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateBalance = () => {
    if (!ledgerEntries) return 0;
    return ledgerEntries.reduce((acc, entry) => {
      if (entry.type === 'INVOICE_GENERATED' || entry.type === 'LATE_FEE_APPLIED') {
        return acc + entry.amount;
      } else if (entry.type === 'PAYMENT_RECEIVED' || entry.type === 'MANUAL_ADJUSTMENT') {
        return acc - entry.amount;
      }
      return acc;
    }, 0);
  };

  const handleExport = () => {
    if (!ledgerEntries) return;
    const headers = ["Date", "Type", "Description", "Amount", "Reference"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + ledgerEntries.map(e => `${new Date(e.transactionDate).toLocaleDateString()},${e.type},"${e.description}",${e.amount},${e.referenceId || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tenant_ledger_${selectedTenant}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Tenant Ledger</h1>
          <p className="text-gray-500">Immutable audit trail of all financial events per tenant.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} disabled={!selectedTenant || ledgerEntries?.length === 0} className={cn("rounded-xl border-gray-200 bg-white text-gray-900", glassClasses.base)}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!selectedTenant || ledgerEntries?.length === 0} className={cn("rounded-xl border-gray-200 bg-white text-gray-900", glassClasses.base)}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Tenant</label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search and select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.tenantCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTenant && (
              <div className="flex gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</p>
                  <h3 className="text-3xl font-black text-red-600">₹{calculateBalance().toLocaleString()}</h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Security Deposit</p>
                  <h3 className="text-3xl font-black text-blue-600">₹20,000</h3>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedTenant ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <History className="w-12 h-12 mb-4 text-gray-300" />
            <p>Select a tenant to view their full financial ledger.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>
      ) : (
        <Card className={cn("border-gray-200 bg-white overflow-hidden", glassClasses.panel)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Debit (Due)</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Credit (Paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {ledgerEntries?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No ledger entries found.</td></tr>
                ) : ledgerEntries?.map((entry) => {
                  const isDebit = entry.type === 'INVOICE_GENERATED' || entry.type === 'LATE_FEE_APPLIED' || entry.type === 'DEPOSIT_REFUNDED';
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-medium">{new Date(entry.transactionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 text-[10px] uppercase font-bold rounded border", getEntryColor(entry.type))}>
                          {entry.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{entry.description}</div>
                        {entry.referenceId && <div className="text-xs text-gray-500 font-mono mt-0.5">Ref: {entry.referenceId}</div>}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-red-600">
                        {isDebit ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {!isDebit ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
