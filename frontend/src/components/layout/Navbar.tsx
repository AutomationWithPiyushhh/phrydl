import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { glassClasses } from "@/lib/glass";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";

export function Navbar() {
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", glassClasses.nav)}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
            <Home size={20} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">Phrydl<span className="text-accent">PG</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/properties" className="text-muted-foreground hover:text-foreground transition-colors">Properties</Link>
          <a href="#amenities" className="text-muted-foreground hover:text-foreground transition-colors">Amenities</a>
          <a href="#locations" className="text-muted-foreground hover:text-foreground transition-colors">Locations</a>
          <a href="#rooms" className="text-muted-foreground hover:text-foreground transition-colors">Rooms & Pricing</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex rounded-full text-gray-700 hover:text-gray-900" asChild>
            <Link to="/login">Tenant Login</Link>
          </Button>
          <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6 font-bold" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}>
            Book a Room
          </Button>
        </div>
      </div>
    </nav>
  );
}
