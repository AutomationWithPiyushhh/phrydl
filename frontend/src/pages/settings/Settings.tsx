import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { Bell, User, Lock, Users, Save, DatabaseBackup, Loader2, IndianRupee } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function Settings() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await api.post("/system/backup");
      toast.success("Database backup completed successfully.");
    } catch (err) {
      toast.error("Failed to trigger database backup.");
    } finally {
      setIsBackingUp(false);
    }
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Manage your profile, team, and property defaults.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-6 w-[900px] mb-8 bg-white border border-gray-200 rounded-xl p-1 h-12">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Security</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Team</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Financials</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-accent" /> Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-accent to-yellow-300 p-1 shadow-sm">
                  <div className="w-full h-full rounded-2xl bg-white border-2 border-white overflow-hidden">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="rounded-xl">Change Photo</Button>
                  <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">Remove Photo</Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Admin User" className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue="Property Admin" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="admin@phrydlpg.com" className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+91 9876543210" className="rounded-xl border-gray-200" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-6"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-accent" /> Notification Preferences</CardTitle>
              <CardDescription>Control what alerts you receive and how.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "New Payments", desc: "Receive alerts when a tenant pays rent.", email: true, sms: false, push: true },
                { title: "Critical Complaints", desc: "Immediate alerts for HIGH and CRITICAL priority tickets.", email: true, sms: true, push: true },
                { title: "New Onboarding", desc: "When a new tenant completes KYC.", email: true, sms: false, push: false },
                { title: "Marketing & Updates", desc: "PhrydlPG feature updates and news.", email: false, sms: false, push: false },
              ].map((notif, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-100 last:border-0 last:pb-0 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    <p className="text-sm text-gray-500">{notif.desc}</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.email} className="w-4 h-4 rounded text-accent focus:ring-accent border-gray-300" /> Email
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.sms} className="w-4 h-4 rounded text-accent focus:ring-accent border-gray-300" /> SMS
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.push} className="w-4 h-4 rounded text-accent focus:ring-accent border-gray-300" /> Push
                    </label>
                  </div>
                </div>
              ))}
              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-6"><Save className="w-4 h-4 mr-2" /> Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-accent" /> Security</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl border-gray-200" />
                </div>
                <div className="hidden md:block"></div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl border-gray-200" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-gray-200">Enable 2FA</Button>
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-100 mt-6">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-6 mt-4"><Save className="w-4 h-4 mr-2" /> Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-accent" /> Team Management</CardTitle>
                <CardDescription>Manage staff access to your Ahmedabad properties.</CardDescription>
              </div>
              <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">Invite Staff</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Ramesh Joshi", email: "ramesh@phrydlpg.com", role: "Manager", property: "Sardar Patel Co-living" },
                  { name: "Jignesh Bhai", email: "jignesh@phrydlpg.com", role: "Manager", property: "Sabarmati Stays" },
                  { name: "Hetal Patel", email: "hetal@phrydlpg.com", role: "Staff", property: "Gokuldham Premium PG" },
                ].map((member, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 text-accent-foreground font-bold flex items-center justify-center border border-accent/30">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{member.role}</span>
                      <span className="text-xs text-gray-500">{member.property}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-accent" /> Billing & Late Fee Configuration</CardTitle>
              <CardDescription>Manage global financial policies for all properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Invoice Generation Day</Label>
                  <Input type="number" defaultValue="1" min="1" max="28" className="rounded-xl border-gray-200" />
                  <p className="text-xs text-gray-500">Day of the month to generate rent invoices.</p>
                </div>
                <div className="space-y-2">
                  <Label>Grace Period (Days)</Label>
                  <Input type="number" defaultValue="5" min="0" className="rounded-xl border-gray-200" />
                  <p className="text-xs text-gray-500">Number of days before late fees apply.</p>
                </div>
                <div className="space-y-2">
                  <Label>Daily Late Fee (₹)</Label>
                  <Input type="number" defaultValue="100" min="0" className="rounded-xl border-gray-200" />
                  <p className="text-xs text-gray-500">Flat amount charged per day after grace period.</p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Late Fee Cap (₹)</Label>
                  <Input type="number" defaultValue="2000" min="0" className="rounded-xl border-gray-200" />
                  <p className="text-xs text-gray-500">Maximum late fee that can accumulate per invoice.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-6"><Save className="w-4 h-4 mr-2" /> Save Financial Policies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className={cn("border-gray-200 bg-white", glassClasses.panel)}>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-accent" /> Super Admin Controls</CardTitle>
              <CardDescription>Manage global feature toggles and manual system backups.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Feature Toggles</h4>
                <div className="space-y-4">
                  {[
                    { key: "FEATURE_AUTO_INVOICE", name: "Automatic Invoicing", desc: "System auto-generates monthly invoices on the configured day.", enabled: true },
                    { key: "FEATURE_LATE_FEES", name: "Automatic Late Fees", desc: "System auto-adds late fees after grace period.", enabled: true },
                    { key: "FEATURE_AI_ASSISTANT", name: "AI Assistant", desc: "Enable the AI Assistant module for staff.", enabled: true },
                    { key: "FEATURE_MAINTENANCE_MODE", name: "Maintenance Mode", desc: "Lock out tenants and staff. Only admins can login.", enabled: false }
                  ].map((feature, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div>
                        <h5 className="font-semibold text-gray-900">{feature.name}</h5>
                        <p className="text-xs text-gray-500">{feature.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={feature.enabled} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Database Backup</h4>
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-orange-900">Manual System Backup</h5>
                    <p className="text-xs text-orange-700 mt-1">Triggers pg_dump immediately and saves to the local server disk.</p>
                  </div>
                  <Button onClick={handleBackup} disabled={isBackingUp} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                    {isBackingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DatabaseBackup className="w-4 h-4 mr-2" />}
                    {isBackingUp ? "Backing up..." : "Trigger Backup Now"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
