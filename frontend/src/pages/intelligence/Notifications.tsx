import { useState } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, CreditCard, MessageSquare, AlertCircle, Volume2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: "payment" | "complaint" | "alert" | "announcement";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const initialNotifications: Notification[] = [
  { id: "1", type: "alert", title: "SLA Breach Warning", message: "Ticket TKT-101 (AC not cooling) has breached the 24hr SLA.", time: "10 mins ago", isRead: false },
  { id: "2", type: "payment", title: "Payment Received", message: "₹14,000 rent received from Sneha Patel (Room 105-B).", time: "1 hour ago", isRead: false },
  { id: "3", type: "complaint", title: "New Complaint", message: "Rahul S. raised a High Priority ticket for Geyser Leak.", time: "3 hours ago", isRead: true },
  { id: "4", type: "announcement", title: "System Maintenance", message: "Scheduled downtime on Saturday 2AM - 4AM for server upgrades.", time: "Yesterday", isRead: true },
  { id: "5", type: "payment", title: "Rent Overdue Reminder", message: "Auto-reminder sent to 12 tenants for pending dues.", time: "Yesterday", isRead: true },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [category, setCategory] = useState<"all" | "payment" | "complaint" | "alert" | "announcement">("all");

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread" && n.isRead) return false;
    if (category !== "all" && n.type !== category) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'payment': return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'complaint': return <MessageSquare className="w-5 h-5 text-yellow-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'announcement': return <Volume2 className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'payment': return 'bg-green-50 border-green-100';
      case 'complaint': return 'bg-yellow-50 border-yellow-100';
      case 'alert': return 'bg-red-50 border-red-100';
      case 'announcement': return 'bg-blue-50 border-blue-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            Notification Center
          </h1>
          <p className="text-gray-500">Stay updated on your portfolio operations.</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline" className={cn("rounded-xl border-gray-200 bg-white text-gray-900", glassClasses.base)}>
          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button onClick={() => setFilter("all")} className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all", filter === "all" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900")}>All</button>
          <button onClick={() => setFilter("unread")} className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all", filter === "unread" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900")}>Unread</button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {["all", "payment", "complaint", "alert", "announcement"].map((cat) => (
            <button 
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-all whitespace-nowrap", 
                category === cat ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No new notifications to display.</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className={cn("border-gray-200 transition-all hover:shadow-md cursor-pointer", glassClasses.card, !notif.isRead ? "bg-white" : "bg-gray-50/50 opacity-70")}>
                  <CardContent className="p-4 sm:p-6 flex gap-4" onClick={() => toggleRead(notif.id)}>
                    <div className={cn("w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border", getIconBg(notif.type))}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("font-bold truncate pr-4", !notif.isRead ? "text-gray-900" : "text-gray-600")}>{notif.title}</h4>
                        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className={cn("text-sm leading-relaxed", !notif.isRead ? "text-gray-600" : "text-gray-500")}>{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-3 h-3 bg-accent rounded-full shrink-0 self-center"></div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
