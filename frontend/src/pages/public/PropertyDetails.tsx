import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Wifi, Shield, IndianRupee, Phone, MessageCircle, BedDouble, CheckCircle2, ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookRoomModal } from '@/components/layout/BookRoomModal';
import { SEO } from '@/components/seo/SEO';

type Property = {
  id: string;
  name: string;
  address: string;
  slug: string;
  capacity: number;
  type: string;
  contactPhone: string;
  whatsappNumber: string;
  amenities: string[];
  imageUrls: string[];
};

export function PropertyDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/v1/public/properties/${slug}`);
        const data = await response.json();
        if (data.success) {
          setProperty(data.data);
        } else {
          setError('Property not found.');
        }
      } catch (err) {
        console.error('Failed to fetch property details', err);
        setError('Network error while fetching property.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full shadow-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-sans">
        <Navbar />
        <div className="text-center py-24 px-6 max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 mt-20">
          <div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{error || 'Property Not Found'}</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">The property you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
          <Button onClick={() => navigate('/properties')} className="w-full h-14 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg">Browse All Properties</Button>
        </div>
      </div>
    );
  }

  const openBookingModal = (source: string, title: string, roomType?: string) => {
    const event = new CustomEvent('open-booking-modal', {
      detail: { source, title, roomType, location: property.name }
    });
    window.dispatchEvent(event);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (property.imageUrls?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (property.imageUrls?.length || 1)) % (property.imageUrls?.length || 1));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      <SEO 
        title={`${property.name} - PhrydlPG`} 
        description={`Rent premium PG accommodation at ${property.name} located in ${property.address}. Fully furnished rooms with top-class amenities.`}
        canonical={`https://phrydlpg.com/property/${property.slug}`}
        image={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
      />
      <Navbar />
      <BookRoomModal />
      
      {/* Hero Image Gallery */}
      <div className="w-full h-[50vh] md:h-[60vh] relative bg-gray-900 group">
        <img 
          src={property.imageUrls?.[currentImageIndex] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={property.name}
          className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Navigation Arrows */}
        {property.imageUrls && property.imageUrls.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="container mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full text-accent-foreground text-xs font-bold mb-4 shadow-lg">
              <MapPin className="w-3 h-3" /> {property.address.split(',')[0]}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">{property.name}</h1>
            <p className="text-gray-300 text-lg max-w-2xl">{property.address}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Premium Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  {property.amenities?.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-accent">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">Available Rooms</h2>
                  <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     12 Beds Available
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Room Type Card */}
                  <div className="p-5 border border-gray-100 rounded-2xl hover:border-gray-300 transition-colors bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center">
                        <BedDouble className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Double Sharing</h3>
                        <p className="text-sm text-gray-500">Spacious room with attached washroom</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">₹12,000</div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">per month</div>
                      </div>
                      <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800 font-bold px-6" onClick={() => openBookingModal('BOOK_ROOM', `Book ${property.name}`, 'Double Sharing')}>
                        Book Now
                      </Button>
                    </div>
                  </div>

                  {/* Room Type Card */}
                  <div className="p-5 border border-gray-100 rounded-2xl hover:border-gray-300 transition-colors bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Single Occupancy</h3>
                        <p className="text-sm text-gray-500">Private premium room</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">₹18,000</div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">per month</div>
                      </div>
                      <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800 font-bold px-6" onClick={() => openBookingModal('BOOK_ROOM', `Book ${property.name}`, 'Single Occupancy')}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps Placeholder */}
            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden">
              <div className="h-64 bg-gray-200 w-full relative">
                <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(property.address)}&zoom=15&size=800x400&maptype=roadmap&markers=color:red%7Clabel:P%7C${encodeURIComponent(property.address)}&key=YOUR_API_KEY`} alt="Map location" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                  <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                    <MapPin className="text-red-500" /> View on Google Maps
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-3xl sticky top-24">
              <CardContent className="p-8">
                <h3 className="text-xl font-black text-gray-900 mb-6">Interested?</h3>
                <div className="space-y-4">
                  <Button className="w-full h-14 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-lg shadow-xl shadow-accent/20" onClick={() => openBookingModal('SCHEDULE_VISIT', 'Schedule a Visit')}>
                    Schedule a Visit
                  </Button>
                  
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <a href={`https://wa.me/${property.whatsappNumber?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-14 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold text-lg transition-colors gap-2">
                    <MessageCircle className="w-5 h-5" /> WhatsApp Us
                  </a>
                  
                  <a href={`tel:${property.contactPhone?.replace(/\D/g,'')}`} className="flex items-center justify-center w-full h-14 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors gap-2">
                    <Phone className="w-5 h-5" /> Call {property.contactPhone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
