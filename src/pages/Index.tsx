import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import GarageCard from "@/components/GarageCard";
import SparePartCard from "@/components/SparePartCard";
import { garages, spareParts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, LogOut, MapPin, ShoppingCart, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const isMobile = useIsMobile();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      setAvatarUrl(null);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("full_name,avatar_url").eq("user_id", user.id).single();
      if (data) {
        setProfileName(data.full_name || null);
        setAvatarUrl(data.avatar_url || null);
      }
    };
    fetch();
  }, [user]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isMobile ? (
        <main className="container py-6">
          <div className="rounded-xl bg-card/80 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                {user ? (
                  <p className="text-lg font-medium">Hello, {profileName ?? user.email?.split("@")[0]}</p>
                ) : (
                  <p className="text-lg font-medium">Welcome to GarageGo</p>
                )}
              </div>
              {user && (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full text-sm">{(profileName || user.email || "U").charAt(0).toUpperCase()}</div>
                  )}
                </div>
              )}
            </div>
            { !user ? (
              <div className="flex gap-3 mb-4">
                <Button asChild className="flex-1">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            ) : null}
            <div className="flex justify-between mt-2">
              <Button asChild variant="ghost" className="flex flex-col items-center gap-2">
                <Link to="/garages"><MapPin className="w-6 h-6" /><span className="text-xs">Find Garages</span></Link>
              </Button>
              <Button asChild variant="ghost" className="flex flex-col items-center gap-2">
                <Link to="/spare-parts"><ShoppingCart className="w-6 h-6" /><span className="text-xs">Spare Parts</span></Link>
              </Button>
              {/* Appointments removed for minimal mobile layout */}
            </div>
          </div>

          {/* Top Rated Garages compact */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Top Rated Garages</h2>
              <Link to="/garages" className="text-sm text-primary">View All</Link>
            </div>
            <div className="space-y-3">
              {garages.slice(0, 2).map((g) => (
                <GarageCard key={g.id} garage={g} />
              ))}
            </div>
          </div>

          {/* Latest Spare Parts compact */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Latest Spare Parts</h2>
              <Link to="/spare-parts" className="text-sm text-primary">View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {spareParts.slice(0, 4).map((p) => (
                <SparePartCard key={p.id} part={p} />
              ))}
            </div>
          </div>
        </main>
      ) : (
        <>
              <HeroSection />
      {/* No account card shown on homepage */}
          <FeaturesSection />

      {/* Top Garages Preview */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Top Rated Garages</h2>
              <p className="text-muted-foreground">Verified mechanics near you in Addis Ababa</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/garages">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {garages.slice(0, 3).map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/garages">View All Garages <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Spare Parts Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Latest Spare Parts</h2>
              <p className="text-muted-foreground">Genuine parts from trusted sellers</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/spare-parts">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spareParts.slice(0, 3).map((part) => (
              <SparePartCard key={part.id} part={part} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/spare-parts">View All Parts <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
          </>
      )}
    </div>
  );
};

export default Index;
