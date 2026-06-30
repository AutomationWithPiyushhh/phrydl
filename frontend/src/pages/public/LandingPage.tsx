import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { motionVariants, glassClasses } from "@/lib/glass";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle2, ShieldCheck, MapPin, 
  Wifi, Wind, Coffee, Dumbbell, BookOpen, Utensils, 
  ChevronRight, ChevronLeft, Star, Heart, Fingerprint, Calendar,
  Zap, Users, X, Search, Plus, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { BookRoomModal } from "@/components/layout/BookRoomModal";
import { SEO } from "@/components/seo/SEO";

export function LandingPage() {
  const navigate = useNavigate();
  const [availableBeds, setAvailableBeds] = useState<number | null>(null);
  
  // Gallery State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Testimonials State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // FAQ State
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://185.2.102.63:8080/api/v1'}/public/room-availability`)
      .then(r => r.json())
      .then(d => { if(d.success) setAvailableBeds(d.data.availableBeds) })
      .catch(e => console.error("Error fetching room availability", e));
  }, []);

  const openBookingModal = (source: string = 'BOOK_ROOM', title: string = 'Book a Premium Room', roomType?: string) => {
    // Track Analytics Event
    fetch(`${import.meta.env.VITE_API_URL || 'http://185.2.102.63:8080/api/v1'}/public/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CTA_CLICK', source, title, timestamp: new Date().toISOString() })
    }).catch(console.error);

    window.dispatchEvent(new CustomEvent('open-booking-modal', {
      detail: { source, title, roomType }
    }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFA] font-sans">
      <SEO 
        title="Luxury PG Accommodation in Ahmedabad" 
        description="Experience premium co-living with PhrydlPG in Ahmedabad. Fully furnished rooms, high-speed WiFi, nutritious meals, and 24x7 security for students and professionals." 
        canonical="https://phrydlpg.com" 
      />
      <BookRoomModal />

      {/* Background Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={motionVariants.staggerContainer}
              className="text-left"
            >
              <motion.div variants={motionVariants.fadeIn} className="mb-6 flex items-center gap-3">
                <span className="px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-yellow-700 font-bold text-xs tracking-wider uppercase backdrop-blur-md">
                  Premium PG in Ahmedabad
                </span>
                <span className="flex items-center text-sm font-semibold text-gray-600">
                  <Star className="w-4 h-4 text-accent fill-accent mr-1" /> 4.9/5 (500+ Reviews)
                </span>
              </motion.div>
              
              <motion.h1 variants={motionVariants.scaleUp} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-gray-900">
                Ahmedabad's Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-500">Comfortable</span> Premium PG
              </motion.h1>
              
              <motion.p variants={motionVariants.fadeIn} className="text-xl text-gray-600 max-w-xl mb-10 leading-relaxed font-medium">
                Fully furnished rooms, delicious meals, high-speed WiFi, modern amenities, and a vibrant community — everything you need to feel at home.
              </motion.p>
              
              <motion.div variants={motionVariants.fadeIn} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg shadow-xl shadow-accent/20 font-bold" onClick={() => openBookingModal('BOOK_ROOM', 'Book a Premium Room')}>
                  Book a Room <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className={cn("rounded-full h-14 px-8 text-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-bold shadow-sm")} onClick={() => openBookingModal('SCHEDULE_VISIT', 'Schedule a Visit')}>
                  Schedule a Visit
                </Button>
              </motion.div>

              <motion.div variants={motionVariants.fadeIn} className="mt-10 flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Fully Furnished</div>
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Healthy Meals</div>
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> High-Speed WiFi</div>
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" /> Safe & Secure</div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Premium PG Room" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white">
                  <p className="font-bold text-lg mb-1">Single Occupancy Room</p>
                  <p className="text-sm text-white/80">SG Highway, Ahmedabad</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AMENITIES SECTION */}
      <section id="amenities" className="py-24 px-6 bg-white relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">Unmatched Premium Amenities</h2>
            <p className="text-gray-500 text-lg">We provide everything you need so you can focus on your studies and career.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Wifi, title: "High-Speed WiFi", desc: "Seamless streaming & working" },
              { icon: Wind, title: "AC Rooms", desc: "Comfortable living all year" },
              { icon: Utensils, title: "Healthy Meals", desc: "Breakfast, lunch & dinner" },
              { icon: ShieldCheck, title: "CCTV Security", desc: "24x7 surveillance" },
              { icon: Fingerprint, title: "Biometric Entry", desc: "Secure access control" },
              { icon: Zap, title: "Power Backup", desc: "Uninterrupted power supply" },
              { icon: BookOpen, title: "Study Zones", desc: "Quiet spaces for focus" },
              { icon: Dumbbell, title: "Recreation Area", desc: "Gym, indoor games & more" },
            ].map((amenity, i) => (
              <div key={i} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:border-accent/30 transition-all duration-300 flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors text-gray-700">
                  <amenity.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{amenity.title}</h3>
                <p className="text-sm text-gray-500">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS SECTION */}
      <section id="locations" className="py-24 px-6 bg-[#FAFAFA]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">Strategically Located Across Ahmedabad</h2>
              <p className="text-gray-500 text-lg max-w-2xl">Close to major IT parks, colleges, and transport hubs.</p>
            </div>
            <Button variant="outline" className="rounded-full bg-white shadow-sm border-gray-200 text-gray-900 font-bold" onClick={() => openBookingModal('SCHEDULE_VISIT', 'Schedule a Visit')}>
              Explore Map <MapPin className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {["Prahlad Nagar", "SG Highway", "Gota", "Chandkheda", "Navrangpura", "Science City", "Thaltej", "Satellite", "GIFT City"].map((loc, i) => (
              <div 
                key={i} 
                className={cn("p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors bg-white border border-gray-100 shadow-sm")}
                onClick={() => navigate(`/property/${loc.toLowerCase().replace(' ', '-')}-premium-pg`)}
              >
                <span className="font-bold group-hover:text-accent-foreground text-gray-800">{loc}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOM SHOWCASE */}
      <section id="rooms" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">Choose Your Comfort</h2>
            <p className="text-gray-500 text-lg">Premium living spaces designed for your lifestyle and budget.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Triple Sharing",
                price: "6,999",
                desc: "Budget-friendly with modern amenities",
                img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["Comfortable Bedding", "Study Table", "Shared Wardrobe", "AC"]
              },
              {
                title: "Double Sharing",
                price: "8,999",
                desc: "Comfortable and affordable for two",
                img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["Premium Bedding", "Personal Study Desk", "Personal Wardrobe", "AC"]
              },
              {
                title: "Single Occupancy",
                price: "12,999",
                desc: "Privacy-focused with premium interiors",
                img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                features: ["King Size Bed", "Executive Desk", "Spacious Wardrobe", "AC & Mini Fridge"]
              }
            ].map((room, i) => (
              <Card key={i} className="rounded-3xl overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-[#FAFAFA]">
                <div className="h-48 overflow-hidden relative">
                  <img src={room.img} alt={room.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {availableBeds !== null ? `${availableBeds} Beds Available` : 'Available Now'}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{room.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{room.desc}</p>
                  <div className="mb-6 flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-900">₹{room.price}</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {room.features.map((f, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-accent mr-2" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-bold h-12" onClick={() => openBookingModal('BOOK_ROOM', 'Book a Premium Room', room.title)}>
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE / COMMUNITY / FOOD */}
      <section className="py-24 px-6 bg-gray-900 text-white rounded-[3rem] mx-4 lg:mx-10 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-6">Homely Food, Every Day</h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                We know how much you miss home food. That's why our professional chefs prepare delicious, hygienic, and nutritious meals daily. Enjoy authentic Gujarati and North Indian cuisine with special weekend menus.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-accent font-bold mb-2">Daily Menu</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center"><Coffee className="w-4 h-4 mr-2" /> Hot Breakfast</li>
                    <li className="flex items-center"><Utensils className="w-4 h-4 mr-2" /> Unlimited Lunch</li>
                    <li className="flex items-center"><Utensils className="w-4 h-4 mr-2" /> Nutritious Dinner</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-accent font-bold mb-2">Community</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center"><Users className="w-4 h-4 mr-2" /> Friendly Environment</li>
                    <li className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Weekend Events</li>
                    <li className="flex items-center"><Heart className="w-4 h-4 mr-2" /> Festival Celebrations</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Healthy Food" className="rounded-3xl shadow-2xl mt-8" />
                <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Community gathering" className="rounded-3xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">Experience the Lifestyle</h2>
            <p className="text-gray-500 text-lg">A glimpse into your future home.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1502672260266-1c1e52409818?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            ].map((img, i) => (
              <div 
                key={i} 
                className="relative h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setCurrentImageIndex(i);
                  setLightboxOpen(true);
                }}
              >
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50">
              <X className="w-8 h-8" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + 8) % 8); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % 8); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <img 
              src={[
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1e52409818?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
              ][currentImageIndex]} 
              alt="Gallery Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {[0,1,2,3,4,5,6,7].map(idx => (
                <button 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={cn("w-2 h-2 rounded-full transition-all", idx === currentImageIndex ? "bg-white w-6" : "bg-white/40")}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 px-6 bg-[#FAFAFA]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">What Our Residents Say</h2>
            <p className="text-gray-500 text-lg">Don't just take our word for it.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
              >
                {[
                  { name: "Meet Patel", role: "Software Engineer, TCS", quote: "The best PG in SG Highway. The WiFi is super fast, which is crucial for my WFH days. Food is exactly like home." },
                  { name: "Krunal Shah", role: "MBA Student", quote: "Very peaceful environment for studying. The study zones are quiet, and the housekeeping staff is very cooperative." },
                  { name: "Dhruvi Mehta", role: "Data Analyst", quote: "As a woman new to Ahmedabad, safety was my biggest concern. The biometric entry and 24x7 security here make me feel completely safe." },
                  { name: "Jayesh Modi", role: "Intern at Simform", quote: "Affordable luxury! It's so easy to meet other young professionals here. The weekend events are a major plus." }
                ].map((t, i) => (
                  <div key={i} className="min-w-full px-4">
                    <Card className="bg-white border-0 shadow-xl shadow-gray-200/50 rounded-3xl p-8 md:p-12 relative h-full flex flex-col justify-center items-center text-center">
                      <div className="text-accent mb-6 flex gap-1">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                      </div>
                      <p className="text-gray-700 md:text-xl italic leading-relaxed mb-8 max-w-2xl font-medium">"{t.quote}"</p>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden ring-4 ring-gray-50">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.replace(' ', '')}`} alt={t.name} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg">{t.name}</h4>
                          <p className="text-sm text-gray-500 font-semibold">{t.role}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button 
              onClick={() => setCurrentTestimonialIndex(prev => Math.max(0, prev - 1))}
              className={cn("absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all", currentTestimonialIndex === 0 && "opacity-0 pointer-events-none")}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentTestimonialIndex(prev => Math.min(3, prev + 1))}
              className={cn("absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all", currentTestimonialIndex === 3 && "opacity-0 pointer-events-none")}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonialIndex(idx)}
                  className={cn("w-2 h-2 rounded-full transition-all", currentTestimonialIndex === idx ? "bg-accent w-6" : "bg-gray-300")}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-gray-900">Frequently Asked Questions</h2>
            <div className="max-w-md mx-auto relative mt-8">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search your question..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is food included in the rent?", a: "Yes, all our plans include nutritious breakfast, lunch, and dinner prepared by professional chefs." },
              { q: "Are guests allowed?", a: "Yes, guests are allowed in the common areas and visitor lounges during daytime hours (9 AM to 8 PM)." },
              { q: "What are the security measures?", a: "We have 24x7 CCTV surveillance, biometric access control, and round-the-clock security guards at the premises." },
              { q: "Is parking available?", a: "Yes, we provide dedicated two-wheeler and limited four-wheeler parking spaces for residents." },
              { q: "What is the notice period before moving out?", a: "We require a standard 30-day notice period before vacating the premises to ensure a smooth transition and deposit refund." },
              { q: "Do you provide housekeeping?", a: "Yes, daily housekeeping is included in the rent to ensure your room and common areas remain spotless." }
            ].filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())).map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 text-lg pr-8">{faq.q}</h3>
                  <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300", openFaqIndex === i ? "bg-accent text-white rotate-180" : "bg-gray-100 text-gray-500")}>
                    {openFaqIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {faqSearch && [
              { q: "Is food included in the rent?", a: "Yes, all our plans include nutritious breakfast, lunch, and dinner prepared by professional chefs." },
              { q: "Are guests allowed?", a: "Yes, guests are allowed in the common areas and visitor lounges during daytime hours (9 AM to 8 PM)." },
              { q: "What are the security measures?", a: "We have 24x7 CCTV surveillance, biometric access control, and round-the-clock security guards at the premises." },
              { q: "Is parking available?", a: "Yes, we provide dedicated two-wheeler and limited four-wheeler parking spaces for residents." },
              { q: "What is the notice period before moving out?", a: "We require a standard 30-day notice period before vacating the premises to ensure a smooth transition and deposit refund." },
              { q: "Do you provide housekeeping?", a: "Yes, daily housekeeping is included in the rent to ensure your room and common areas remain spotless." }
            ].filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No questions found matching "{faqSearch}". Please <a href="#contact" onClick={(e) => {e.preventDefault(); openBookingModal('CONTACT_FORM', 'Contact Us');}} className="text-accent underline font-semibold">contact us</a> for your query.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 px-6 relative bg-accent">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">Looking for the Perfect PG in Ahmedabad?</h2>
          <p className="text-xl text-gray-800 mb-10 font-medium">Join hundreds of students and professionals already enjoying a comfortable, safe, and premium living experience.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="rounded-full bg-gray-900 text-white hover:bg-gray-800 h-14 px-10 text-lg shadow-xl font-bold" onClick={() => openBookingModal('BOOK_ROOM', 'Book a Premium Room')}>
              Book Your Room Today
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg border-gray-900 text-gray-900 hover:bg-black/5 font-bold" onClick={() => openBookingModal('CONTACT_FORM', 'Contact Us')}>
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-20 pb-10 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="text-3xl font-black tracking-tight text-white mb-6 block">Phrydl<span className="text-accent">PG</span></span>
              <p className="text-gray-400 max-w-sm mb-6">
                Premium student and professional accommodations in Ahmedabad. Comfort, Community, and Convenience.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📍 SG Highway, Ahmedabad, Gujarat 380015</p>
                <p>📞 +91 98765 43210</p>
                <p>✉️ hello@phrydlpg.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#locations" className="hover:text-accent transition-colors">Locations</a></li>
                <li><a href="#rooms" className="hover:text-accent transition-colors">Pricing & Rooms</a></li>
                <li><a href="#amenities" className="hover:text-accent transition-colors">Amenities</a></li>
                <li><a href="#faq" className="hover:text-accent transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">House Rules</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} PhrydlPG. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
