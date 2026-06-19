import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { QrCode, Download, ShieldCheck, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function TenantDigitalId() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: async () => {
      const res = await api.get('/tenant/dashboard');
      return res.data.data;
    }
  });
  
  const idCardRef = useRef<HTMLDivElement>(null);

  // Use a predictable hash or just user ID for demo purposes. 
  // In a real app this would be the actual Tenant ID from the database.
  const tenantId = user?.id || "demo-123";
  const verificationUrl = `${window.location.origin}/verify/${tenantId}`;

  const downloadAsPng = async () => {
    if (!idCardRef.current) return;
    const toastId = toast.loading("Generating PNG...");
    try {
      const canvas = await html2canvas(idCardRef.current, { scale: 2, useCORS: true, allowTaint: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `PhrydlPG_ID_${tenantId}.png`;
      link.click();
      toast.success("Downloaded successfully", { id: toastId });
    } catch (e) {
      toast.error("Failed to generate PNG", { id: toastId });
      console.error(e);
    }
  };

  const downloadAsPdf = async () => {
    if (!idCardRef.current) return;
    const toastId = toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(idCardRef.current, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PhrydlPG_ID_${tenantId}.pdf`);
      toast.success("Downloaded successfully", { id: toastId });
    } catch (e) {
      toast.error("Failed to generate PDF", { id: toastId });
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto mt-10">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Digital ID</h2>
        <p className="text-sm text-gray-500 mt-1">Show this at the gate for entry</p>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading ID...</div>
      ) : dashboard?.kycStatus !== 'VERIFIED' ? (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="font-bold text-orange-900 text-lg mb-2">Verification Required</h3>
            <p className="text-orange-700 text-sm">Your Digital ID will be unlocked once your KYC documents are verified by the admin.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div ref={idCardRef} className="p-4 bg-white/0">
        <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-0 shadow-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent rounded-full mix-blend-screen filter blur-[50px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[40px] opacity-20 pointer-events-none"></div>
        
        <CardContent className="p-8 flex flex-col items-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 overflow-hidden mb-4 shadow-xl">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          <h3 className="text-xl font-bold tracking-tight text-white mb-1">{user?.email.split('@')[0]}</h3>
          <p className="text-accent text-sm font-semibold mb-6 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1" /> Verified Resident
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
            <QRCodeSVG value={verificationUrl} size={180} level={"H"} />
          </div>
          
          <p className="text-xs text-gray-400 font-mono tracking-widest">{tenantId.substring(0, 12).toUpperCase()}</p>
        </CardContent>
      </Card>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 rounded-xl h-12 shadow-sm font-bold">
            <Download className="w-4 h-4 mr-2" /> Download ID
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px] rounded-xl">
          <DropdownMenuItem onClick={downloadAsPng} className="cursor-pointer py-3 rounded-lg">
            <FileImage className="w-4 h-4 mr-2" /> Download as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadAsPdf} className="cursor-pointer py-3 rounded-lg">
            <FileText className="w-4 h-4 mr-2" /> Download as PDF
          </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
      )}
    </div>
  );
}
