import { useState } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Building, MapPin, Search, Filter, Plus, Users, Bed, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";

export function PropertyManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: properties, isLoading, error } = useProperties();

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load properties</div>;

  const filteredProperties = properties?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage your property portfolio and capacities.</p>
        </div>
        <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6">
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search properties by name or location..." 
            className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus-visible:ring-accent text-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className={cn("h-12 rounded-xl px-6 border-gray-200 bg-white hover:bg-gray-50 text-gray-900", glassClasses.base)}>
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      <motion.div 
        variants={motionVariants.staggerContainer}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredProperties.map((prop) => (
          <motion.div key={prop.id} variants={motionVariants.fadeIn}>
            <Card className={cn("hover:border-accent/50 transition-colors cursor-pointer group h-full overflow-hidden", glassClasses.card)}>
              <div className="h-32 bg-gradient-to-r from-accent/20 to-yellow-100 relative">
                <div className="absolute top-4 right-4">
                  <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border", 
                    prop.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                  )}>
                    {prop.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-6 relative">
                <div className="absolute -top-10 left-6 w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-accent" />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-accent transition-colors">{prop.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-1" /> {prop.address}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center text-gray-500 text-xs mb-1">
                        <Users className="w-3 h-3 mr-1" /> Tenants
                      </div>
                      <div className="font-semibold text-gray-900">{prop.occupancy} / {prop.capacity}</div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${prop.occupancyRate}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center text-gray-500 text-xs mb-1">
                        <CreditCard className="w-3 h-3 mr-1" /> Type
                      </div>
                      <div className="font-semibold text-gray-900">{prop.type}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
