import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, BedDouble, AlertCircle, LogOut, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
export function RoomAllocation() {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const [selectedBed, setSelectedBed] = useState<any | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get('/properties');
      return res.data.data;
    }
  });

  const { data: occupancyMatrix, isLoading } = useQuery({
    queryKey: ['occupancy', selectedProperty],
    queryFn: async () => {
      const res = await api.get(`/properties/${selectedProperty}/matrix`);
      return res.data.data; // Should return an array of Floors -> Rooms -> Beds
    },
    enabled: !!selectedProperty
  });

  const getBedColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'OCCUPIED': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'RESERVED': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
  };

  if (!properties) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Room Allocation</h1>
          <p className="text-muted-foreground">Manage bed assignments and transfers visually.</p>
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select Property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProperty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BedDouble className="w-12 h-12 mb-4 text-gray-300" />
            <p>Select a property to view its allocation matrix</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div></div>
          ) : occupancyMatrix?.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No floors found for this property.</CardContent></Card>
          ) : (
            occupancyMatrix?.map((floor: any) => (
              <Card key={floor.id}>
                <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                  <CardTitle className="text-lg">Floor {floor.floorNumber}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {floor.rooms.map((room: any) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="font-semibold mb-3 flex justify-between items-center text-gray-900">
                        Room {room.roomNumber}
                        <span className="text-xs font-normal text-gray-500">{room.type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {room.beds.map((bed: any) => (
                          <div 
                            key={bed.id} 
                            onClick={() => setSelectedBed({ ...bed, roomNumber: room.roomNumber })}
                            className={`p-3 rounded-md border text-center cursor-pointer transition-colors ${getBedColor(bed.status)}`}
                          >
                            <div className="text-sm font-bold">Bed {bed.bedNumber}</div>
                            {bed.tenant && <div className="text-xs truncate opacity-80 mt-1">{bed.tenant.name}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Sheet open={!!selectedBed} onOpenChange={(open) => !open && setSelectedBed(null)}>
        <SheetContent>
          <SheetHeader className="mb-6">
            <SheetTitle>Bed Details</SheetTitle>
            <SheetDescription>Room {selectedBed?.roomNumber} - Bed {selectedBed?.bedNumber}</SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <Badge variant="outline" className={getBedColor(selectedBed?.status)}>
                {selectedBed?.status}
              </Badge>
            </div>

            {selectedBed?.tenant ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center"><User className="w-4 h-4 mr-2" /> Tenant Information</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{selectedBed.tenant.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Occupation</span><span className="font-medium text-gray-900">{selectedBed.tenant.occupation || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Move-in Date</span><span className="font-medium text-gray-900">{selectedBed.tenant.moveInDate || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Rent Amount</span><span className="font-medium text-gray-900">₹{selectedBed.tenant.rentAmount?.toLocaleString() || 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">KYC Status</span><span className="font-medium text-gray-900">{selectedBed.tenant.kycStatus || 'PENDING'}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button variant="outline" className="w-full">Transfer Bed</Button>
                  <Button variant="destructive" className="w-full"><LogOut className="w-4 h-4 mr-2" /> Move Out</Button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-6">This bed is currently unallocated.</p>
                <Button className="w-full">Allocate Bed</Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
