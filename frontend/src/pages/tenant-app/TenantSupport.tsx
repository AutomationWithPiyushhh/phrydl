import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle } from "lucide-react";

export function TenantSupport() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Help & Support</h2>
      <p className="text-gray-500">Need assistance? Reach out to your property manager through the following channels.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm rounded-2xl text-center">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Call Support</h3>
            <p className="text-sm text-gray-500 mb-4">+91 1800 123 4567</p>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.href='tel:+9118001234567'}>Call Now</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm rounded-2xl text-center">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-4">+91 98765 43210</p>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.href='https://wa.me/919876543210'}>Message</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm rounded-2xl text-center">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-500 mb-4">support@phrydlpg.com</p>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.href='mailto:support@phrydlpg.com'}>Email Us</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm rounded-2xl mt-8">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-800">When is the rent due?</h4>
              <p className="text-sm text-gray-500 mt-1">Rent is usually due on the 5th of every month. A late fee may be applied if paid after the due date.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">How do I raise a maintenance request?</h4>
              <p className="text-sm text-gray-500 mt-1">You can go to the "Complaints" section from the sidebar and click on "New Ticket" to raise a request.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">What are the visitor policies?</h4>
              <p className="text-sm text-gray-500 mt-1">Visitors are allowed between 9:00 AM and 8:00 PM. All visitors must be registered at the front desk or verified via your Digital ID.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
