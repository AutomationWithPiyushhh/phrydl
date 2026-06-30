import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Shield, IndianRupee, Filter, AlertCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';

type Property = {
  id: string;
  name: string;
  address: string;
  slug: string;
  capacity: number;
  type: string;
  amenities: string[];
  imageUrls: string[];
};

export function AllProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://185.2.102.63:8080/api/v1'}/public/properties`);
        const data = await response.json();
        if (data.success) {
          setProperties(data.data);
        } else {
          setError('Failed to load properties.');
        }
      } catch (err) {
        console.error('Failed to fetch properties', err);
        setError('Network error while loading properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-accent/30 selection:text-gray-900 font-sans">
      <SEO 
        title="All Properties & Locations" 
        description="Browse PhrydlPG's premium co-living properties in Ahmedabad. Find the perfect room for your lifestyle." 
        canonical="https://phrydlpg.com/properties" 
      />
      <Navbar />
      
      <div className="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">Discover Your Perfect Space</h1>
          <p className="text-xl text-gray-500 max-w-2xl">Explore our premium properties across Ahmedabad, designed for comfort and convenience.</p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="outline" className="rounded-full bg-white font-semibold shadow-sm border-gray-200">
              <Filter className="w-4 h-4 mr-2" /> All Locations
            </Button>
            <Button variant="outline" className="rounded-full bg-white font-semibold shadow-sm border-gray-200">
               Budget
            </Button>
            <Button variant="outline" className="rounded-full bg-white font-semibold shadow-sm border-gray-200">
               Sharing Type
            </Button>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full shadow-lg"></div>
            </div>
          ) : error ? (
            <div className="text-center py-24 px-6 bg-red-50/50 rounded-3xl border border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-gray-900 text-white rounded-full">
                Try Again
              </Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24 px-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">We couldn't find any properties matching your criteria at the moment.</p>
              <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((prop) => (
                <Card key={prop.id} className="overflow-hidden border-0 shadow-xl shadow-gray-200/50 rounded-3xl hover:shadow-2xl transition-all duration-300 group cursor-pointer" onClick={() => navigate(`/property/${prop.slug}`)}>
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={prop.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      Premium PG
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{prop.name}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {prop.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {prop.amenities?.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                          {amenity}
                        </span>
                      ))}
                      {(prop.amenities?.length || 0) > 3 && (
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                          +{(prop.amenities?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                    
                    <Button className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-bold h-12">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
