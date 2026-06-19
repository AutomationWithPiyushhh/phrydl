import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function TenantSettings() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }
    
    // Very basic password validation
    if (passwords.new.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/tenant/settings/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      toast.success("Password updated successfully! Please log in again.");
      setPasswords({ current: '', new: '', confirm: '' });
      
      // Logout and redirect
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
      
      <Card className="bg-white border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Current Password</label>
              <input required type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">New Password</label>
              <input required type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
              <input required type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white" />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 rounded-xl">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
