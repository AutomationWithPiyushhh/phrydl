import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from "jspdf";
import { useRazorpay } from "@/hooks/useRazorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  billingMonth: string;
}

export function TenantPayments() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['tenantInvoices'],
    queryFn: async () => {
      const response = await api.get('/tenant/invoices');
      return response.data.data;
    }
  });

  const isRazorpayLoaded = useRazorpay();

  const handlePayment = async (paymentId: string) => {
    if (!isRazorpayLoaded) {
      toast.error("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    try {
      setProcessingId(paymentId);
      // 1. Initiate Payment Order on Backend
      const initRes = await api.post(`/tenant/payments/${paymentId}/initiate`);
      const { orderId, amount, currency, keyId } = initRes.data.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId || "rzp_test_mockkey", // Fallback for dev if backend doesn't send
        amount: amount * 100, // Amount in paise
        currency: currency || "INR",
        name: "PhrydlPG",
        description: "Rent Payment",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature on Backend
            await api.post(`/tenant/payments/${paymentId}/verify`, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            toast.success("Payment successful!");
            queryClient.invalidateQueries({ queryKey: ['tenantInvoices'] });
          } catch (err) {
            toast.error("Payment verification failed. If amount was deducted, it will be refunded.");
          }
        },
        prefill: {
          name: "Tenant Name",
          email: "tenant@phrydlpg.com",
          contact: "9999999999"
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed", error);
      toast.error("Failed to initiate payment. Please contact support.");
    } finally {
      setProcessingId(null);
    }
  };

  const downloadInvoicePdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
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

  const totalDue = invoices?.filter(i => i.status !== 'PAID').reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payments</h2>
        <p className="text-gray-500 text-sm">Manage your rent and dues.</p>
      </div>

      <Card className="bg-gradient-to-br from-accent to-accent/90 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full mix-blend-overlay filter blur-xl transform translate-x-10 -translate-y-10"></div>
        <CardContent className="p-6 relative z-10">
          <p className="text-white/80 font-medium mb-1">Total Outstanding</p>
          <h3 className="text-4xl font-black tracking-tighter">₹{totalDue.toLocaleString()}</h3>
          {totalDue > 0 && (
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => handlePayment(invoices?.find(i => i.status !== 'PAID')?.id || '')} 
                className="w-full bg-white text-accent hover:bg-gray-50 shadow-md font-bold text-base h-12 rounded-xl"
                disabled={!invoices?.find(i => i.status !== 'PAID')}
              >
                Pay Full Amount
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Invoice History</h3>
      <div className="space-y-4">
        {(!invoices || invoices.length === 0) && (
           <p className="text-gray-500 text-sm text-center py-8">No invoices found.</p>
        )}
        {invoices?.map((invoice) => (
          <Card key={invoice.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  invoice.status === 'PAID' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  {invoice.status === 'PAID' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-gray-900 text-lg">₹{invoice.totalAmount.toLocaleString()}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {invoice.billingMonth} • Due {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none h-10 rounded-xl border-gray-200 text-gray-700" onClick={() => downloadInvoicePdf(invoice.id, invoice.invoiceNumber)}>
                  <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Download PDF</span>
                </Button>
                
                {invoice.status !== 'PAID' && (
                  <Button 
                    className="flex-1 sm:flex-none h-10 rounded-xl bg-accent text-white hover:bg-accent/90 shadow-sm font-semibold" 
                    onClick={() => handlePayment(invoice.id)}
                    disabled={processingId === invoice.id}
                  >
                    {processingId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
