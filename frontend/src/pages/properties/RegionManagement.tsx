import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Map, Building, Trash2 } from "lucide-react";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RegionManagement() {
  const queryClient = useQueryClient();
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");

  const { data: regions, isLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await api.get('/regions');
      return response.data.data;
    }
  });

  const createRegionMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/regions', { name, description: '' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast.success("Region created successfully");
      setShowAddRegion(false);
      setNewRegionName("");
    },
    onError: () => {
      toast.error("Failed to create region");
    }
  });

  if (isLoading) return <div className="p-8">Loading regions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Region Management</h1>
          <p className="text-gray-500 text-sm">Organize properties by geographical regions and assign region managers.</p>
        </div>
        <Button onClick={() => setShowAddRegion(true)} className="bg-accent text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Region
        </Button>
      </div>

      {showAddRegion && (
        <Card className={cn("border-accent/20", glassClasses.card)}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Create New Region</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Region Name (e.g., South Bangalore)" 
                className="flex-1 px-3 py-2 border rounded-md"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
              />
              <Button onClick={() => createRegionMutation.mutate(newRegionName)} disabled={!newRegionName}>Create</Button>
              <Button variant="ghost" onClick={() => setShowAddRegion(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions?.map((region: any) => (
          <Card key={region.id} className={glassClasses.card}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-accent" /> {region.name}
              </CardTitle>
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4" /> 
                  <span>{region.properties?.length || 0} Properties</span>
                </div>
                <div className="flex items-center justify-between mt-4 border-t pt-4">
                  <span className="font-semibold text-gray-700">Manager:</span>
                  <span className="text-accent">{region.regionManager?.firstName || 'Unassigned'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!regions || regions.length === 0) && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No regions found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
