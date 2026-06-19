import { useState, useMemo } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bed, User, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRooms } from "@/hooks/useRooms";

export function RoomAllocation() {
  const { data: rooms, isLoading, error } = useRooms();

  const floors = useMemo(() => {
    if (!rooms) return [];
    
    // Group rooms by floor (assuming first digit of room number represents floor, or group by property)
    // Here we'll group by propertyName first, then list rooms. 
    // To keep the UI similar to the mockup, let's group by propertyName for now.
    const grouped = rooms.reduce((acc, room) => {
      const groupKey = room.propertyName;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(room);
      return acc;
    }, {} as Record<string, typeof rooms>);

    return Object.entries(grouped).map(([level, rooms]) => ({
      level,
      rooms
    }));
  }, [rooms]);

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load rooms</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Room Allocation</h1>
          <p className="text-gray-500">Visual floor plan and bed availability map.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className={cn("rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-900", glassClasses.base)}>Auto-Assign</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-8 flex-wrap">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-sm text-gray-600">Available</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-sm text-gray-600">Occupied</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-gray-600">Maintenance</span></div>
      </div>

      <div className="space-y-12">
        {floors.map((floor, i) => (
          <motion.div key={i} initial="initial" animate="animate" variants={motionVariants.staggerContainer}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
              <span className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm">{i+1}</span>
              {floor.level}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {floor.rooms.map((room) => (
                <Card key={room.id} className={cn("hover:border-accent/30 transition-colors bg-white border-gray-200", glassClasses.card)}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <span className="text-2xl font-black text-gray-900">{room.roomNumber}</span>
                        <div className="text-xs text-gray-500 font-medium">{room.type}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {room.beds.map((bed, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer hover:scale-105",
                            bed.status === 'AVAILABLE' ? "bg-green-50 border-green-200 text-green-700" :
                            bed.status === 'OCCUPIED' ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                            "bg-red-50 border-red-200 text-red-700"
                          )}
                        >
                          {bed.status === 'AVAILABLE' && <CheckCircle2 className="w-5 h-5 mb-1" />}
                          {bed.status === 'OCCUPIED' && <User className="w-5 h-5 mb-1" />}
                          {bed.status === 'MAINTENANCE' && <ShieldAlert className="w-5 h-5 mb-1" />}
                          
                          <span className="text-xs font-semibold">{bed.bedNumber}</span>
                          {bed.tenantName && <span className="text-[10px] opacity-80 truncate w-full">{bed.tenantName}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
