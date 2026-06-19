import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BookRoomModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    gender: 'Male',
    occupation: 'Student',
    preferredLocation: 'Prahlad Nagar',
    roomType: 'Double Sharing',
    moveInDate: '',
    additionalRequirements: '',
    source: 'BOOK_ROOM'
  });
  const [modalTitle, setModalTitle] = useState("Book a Premium Room");

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.source) {
          setFormData(prev => ({ ...prev, source: customEvent.detail.source }));
        }
        if (customEvent.detail.title) {
          setModalTitle(customEvent.detail.title);
        }
        if (customEvent.detail.roomType) {
          setFormData(prev => ({ ...prev, roomType: customEvent.detail.roomType }));
        }
      }
      setIsOpen(true);
    };
    window.addEventListener('open-booking-modal', handleOpen);
    return () => window.removeEventListener('open-booking-modal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/leads', formData);
      setIsSuccess(true);
      toast.success("Inquiry submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] border-0 shadow-2xl rounded-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">{modalTitle}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {isSuccess 
              ? "Thank you for choosing PhrydlPG! We will contact you shortly." 
              : "Fill out the form below to schedule a visit or reserve your room. Our community manager will get back to you within 24 hours."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Request Received!</h3>
            <p className="text-center text-gray-500">We've saved your preferences and notified our local property manager. You'll hear from us soon!</p>
            <Button onClick={() => setIsOpen(false)} className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto px-8">
              Back to Home
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                <input required name="fullName" type="text" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Mobile Number *</label>
                <input required name="mobileNumber" type="tel" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="+91 98765 43210" value={formData.mobileNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Email Address *</label>
              <input required name="email" type="email" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Gender</label>
                <select name="gender" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none" value={formData.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Occupation</label>
                <select name="occupation" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none" value={formData.occupation} onChange={handleChange}>
                  <option>Student</option>
                  <option>IT Professional</option>
                  <option>Working Professional</option>
                  <option>Intern</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Preferred Location</label>
                <select name="preferredLocation" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none" value={formData.preferredLocation} onChange={handleChange}>
                  <option>Prahlad Nagar</option>
                  <option>SG Highway</option>
                  <option>Gota</option>
                  <option>Chandkheda</option>
                  <option>Navrangpura</option>
                  <option>Science City</option>
                  <option>Thaltej</option>
                  <option>Satellite</option>
                  <option>GIFT City</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Room Type</label>
                <select name="roomType" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none" value={formData.roomType} onChange={handleChange}>
                  <option>Single Occupancy</option>
                  <option>Double Sharing</option>
                  <option>Triple Sharing</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Expected Move-in Date *</label>
              <input required name="moveInDate" type="date" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 outline-none transition-all" value={formData.moveInDate} onChange={handleChange} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Additional Requirements (Optional)</label>
              <textarea name="additionalRequirements" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent/20 outline-none transition-all min-h-[80px]" placeholder="Any specific needs?" value={formData.additionalRequirements} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-xl mt-4 shadow-xl">
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Submit Booking Request
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
